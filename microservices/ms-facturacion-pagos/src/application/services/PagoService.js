const { v4: uuidv4 } = require('uuid');
const PagoRepository = require('../../domain/repositories/PagoRepository');
const FacturaRepository = require('../../domain/repositories/FacturaRepository');
const { publishEvent } = require('../../infrastructure/messaging/rabbitmq');

class PagoService {
    /**
     * Registrar un nuevo pago
     */
    async registrar({ factura_pago_id, monto, metodo_pago, referencia, comprobante }) {
        // Obtener la factura
        const factura = await FacturaRepository.findById(factura_pago_id);

        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        if (factura.estado === 'ANULADA') {
            throw new Error('No se puede registrar pago para una factura anulada');
        }

        if (factura.estado === 'PAGADA') {
            throw new Error('La factura ya está pagada');
        }

        // Validar que el monto no exceda el saldo pendiente
        const pagosAnteriores = await PagoRepository.findByFactura(factura_pago_id);
        const totalPagado = pagosAnteriores
            .filter(p => p.estado === 'APROBADO')
            .reduce((acc, p) => acc + parseFloat(p.monto), 0);

        const saldoPendiente = parseFloat(factura.total) - totalPagado;

        if (monto > saldoPendiente) {
            throw new Error(`El monto excede el saldo pendiente ($${saldoPendiente.toFixed(2)})`);
        }

        // Crear el pago
        const pagoId = uuidv4();
        const datosPago = {
            pago_id: pagoId,
            factura_pago_id,
            monto: parseFloat(monto),
            metodo_pago,
            estado: 'APROBADO', // En un mock, aprobamos automáticamente
            referencia: referencia || null,
            comprobante: comprobante || null,
            fecha_pago: new Date()
        };

        const pago = await PagoRepository.create(datosPago);

        // Verificar si la factura queda completamente pagada
        const nuevoTotalPagado = totalPagado + parseFloat(monto);

        if (Math.abs(nuevoTotalPagado - parseFloat(factura.total)) < 0.01) {
            // Factura completamente pagada
            await FacturaRepository.updateEstado(factura_pago_id, 'PAGADA');

            await publishEvent('billing_events', 'invoice.paid', {
                factura_pago_id,
                numero_factura: factura.numero_factura,
                total: factura.total,
                fecha_pago: new Date()
            });

            console.log(`💰 Factura ${factura.numero_factura} PAGADA completamente`);
        } else {
            // Pago parcial
            await publishEvent('billing_events', 'payment.registered', {
                pago_id: pagoId,
                factura_pago_id,
                numero_factura: factura.numero_factura,
                monto,
                metodo_pago,
                saldo_pendiente: saldoPendiente - parseFloat(monto)
            });

            console.log(`💵 Pago parcial registrado: $${monto} (Pendiente: $${(saldoPendiente - parseFloat(monto)).toFixed(2)})`);
        }

        return pago;
    }

    /**
     * Listar pagos de una factura
     */
    async listarPorFactura(facturaId) {
        const pagos = await PagoRepository.findByFactura(facturaId);

        // Calcular totales
        const totalPagado = pagos
            .filter(p => p.estado === 'APROBADO')
            .reduce((acc, p) => acc + parseFloat(p.monto), 0);

        return pagos.map(pago => ({
            ...pago,
            totalPagado
        }));
    }

    /**
     * Obtener pago por ID
     */
    async obtenerPorId(pagoId) {
        const pago = await PagoRepository.findById(pagoId);

        if (!pago) {
            throw new Error('Pago no encontrado');
        }

        return pago;
    }

    /**
     * Actualizar estado de un pago (aprobar/rechazar)
     */
    async actualizarEstado(pagoId, nuevoEstado) {
        const pago = await PagoRepository.findById(pagoId);

        if (!pago) {
            throw new Error('Pago no encontrado');
        }

        if (pago.estado !== 'PENDIENTE') {
            throw new Error('Solo se pueden actualizar pagos en estado PENDIENTE');
        }

        const pagoActualizado = await PagoRepository.updateEstado(pagoId, nuevoEstado);

        // Si se aprueba, verificar si la factura queda pagada
        if (nuevoEstado === 'APROBADO') {
            const factura = await FacturaRepository.findById(pago.factura_pago_id);
            const pagos = await PagoRepository.findByFactura(pago.factura_pago_id);

            const totalPagado = pagos
                .filter(p => p.estado === 'APROBADO')
                .reduce((acc, p) => acc + parseFloat(p.monto), 0);

            if (Math.abs(totalPagado - parseFloat(factura.total)) < 0.01) {
                await FacturaRepository.updateEstado(pago.factura_pago_id, 'PAGADA');

                await publishEvent('billing_events', 'invoice.paid', {
                    factura_pago_id: pago.factura_pago_id,
                    numero_factura: factura.numero_factura,
                    total: factura.total
                });
            }
        }

        await publishEvent('billing_events', 'payment.status_changed', {
            pago_id: pagoId,
            factura_pago_id: pago.factura_pago_id,
            estado_anterior: pago.estado,
            estado_nuevo: nuevoEstado
        });

        console.log(`💳 Pago ${pagoId} → ${nuevoEstado}`);

        return pagoActualizado;
    }
}

module.exports = new PagoService();
