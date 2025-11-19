const { getConnection } = require('../../infrastructure/database/connection');

class PagoRepository {
    /**
     * Crear un nuevo pago
     */
    async create(datosPago) {
        const connection = await getConnection();

        try {
            const [result] = await connection.execute(
                `INSERT INTO pagos 
                (pago_id, factura_pago_id, monto, metodo_pago, estado, referencia, comprobante, fecha_pago)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    datosPago.pago_id,
                    datosPago.factura_pago_id,
                    datosPago.monto,
                    datosPago.metodo_pago,
                    datosPago.estado,
                    datosPago.referencia,
                    datosPago.comprobante,
                    datosPago.fecha_pago
                ]
            );

            return await this.findById(datosPago.pago_id);
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar pago por ID
     */
    async findById(pagoId) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM pagos WHERE pago_id = ?`,
                [pagoId]
            );

            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar pagos por factura
     */
    async findByFactura(facturaId) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM pagos 
                 WHERE factura_pago_id = ? 
                 ORDER BY created_at DESC`,
                [facturaId]
            );

            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualizar estado del pago
     */
    async updateEstado(pagoId, nuevoEstado) {
        const connection = await getConnection();

        try {
            const fechaPago = nuevoEstado === 'APROBADO' ? new Date() : null;

            await connection.execute(
                `UPDATE pagos 
                 SET estado = ?, fecha_pago = ? 
                 WHERE pago_id = ?`,
                [nuevoEstado, fechaPago, pagoId]
            );

            return await this.findById(pagoId);
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener total pagado de una factura
     */
    async getTotalPagado(facturaId) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT COALESCE(SUM(monto), 0) as total_pagado 
                 FROM pagos 
                 WHERE factura_pago_id = ? AND estado = 'APROBADO'`,
                [facturaId]
            );

            return parseFloat(rows[0].total_pagado);
        } finally {
            connection.release();
        }
    }

    /**
     * Listar pagos por método de pago
     */
    async findByMetodo(metodoPago) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM pagos 
                 WHERE metodo_pago = ? 
                 ORDER BY created_at DESC`,
                [metodoPago]
            );

            return rows;
        } finally {
            connection.release();
        }
    }
}

module.exports = new PagoRepository();
