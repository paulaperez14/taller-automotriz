const { getConnection } = require('../../infrastructure/database/connection');

class FacturaRepository {
    /**
     * Crear una nueva factura
     */
    async create(datosFactura) {
        const connection = await getConnection();

        try {
            const [result] = await connection.execute(
                `INSERT INTO facturas_pagos 
                (factura_pago_id, factura_id, orden_servicio_id, cliente_id, numero_factura, 
                 fecha, subtotal, impuestos, total, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    datosFactura.factura_pago_id,
                    datosFactura.factura_id,
                    datosFactura.orden_servicio_id,
                    datosFactura.cliente_id,
                    datosFactura.numero_factura,
                    datosFactura.fecha,
                    datosFactura.subtotal,
                    datosFactura.impuestos,
                    datosFactura.total,
                    datosFactura.estado
                ]
            );

            return await this.findById(datosFactura.factura_pago_id);
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar factura por ID
     */
    async findById(facturaId) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM facturas_pagos WHERE factura_pago_id = ?`,
                [facturaId]
            );

            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Listar todas las facturas con filtros
     */
    async findAll(limit, offset, filtros = {}) {
        const connection = await getConnection();

        try {
            let query = 'SELECT * FROM facturas_pagos WHERE 1=1';
            const params = [];

            if (filtros.estado) {
                query += ' AND estado = ?';
                params.push(filtros.estado);
            }

            if (filtros.fecha_inicio) {
                query += ' AND fecha >= ?';
                params.push(filtros.fecha_inicio);
            }

            if (filtros.fecha_fin) {
                query += ' AND fecha <= ?';
                params.push(filtros.fecha_fin);
            }

            query += ' ORDER BY created_at DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + parseInt(offset);

            const [facturas] = await connection.execute(query, params);            // Contar total
            let countQuery = 'SELECT COUNT(*) as total FROM facturas_pagos WHERE 1=1';
            const countParams = [];

            if (filtros.estado) {
                countQuery += ' AND estado = ?';
                countParams.push(filtros.estado);
            }

            if (filtros.fecha_inicio) {
                countQuery += ' AND fecha >= ?';
                countParams.push(filtros.fecha_inicio);
            }

            if (filtros.fecha_fin) {
                countQuery += ' AND fecha <= ?';
                countParams.push(filtros.fecha_fin);
            }

            const [countResult] = await connection.execute(countQuery, countParams);
            const total = countResult[0].total;

            return { facturas, total };
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar facturas por cliente
     */
    async findByCliente(clienteId, limit, offset) {
        const connection = await getConnection();

        try {
            const query = `SELECT * FROM facturas_pagos 
                 WHERE cliente_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

            const [facturas] = await connection.execute(query, [clienteId]); const [countResult] = await connection.execute(
                `SELECT COUNT(*) as total FROM facturas_pagos WHERE cliente_id = ?`,
                [clienteId]
            );

            const total = countResult[0].total;

            return { facturas, total };
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar facturas por estado
     */
    async findByEstado(estado) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM facturas_pagos WHERE estado = ? ORDER BY fecha DESC`,
                [estado]
            );

            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualizar estado de la factura
     */
    async updateEstado(facturaId, nuevoEstado) {
        const connection = await getConnection();

        try {
            await connection.execute(
                `UPDATE facturas_pagos SET estado = ? WHERE factura_pago_id = ?`,
                [nuevoEstado, facturaId]
            );

            return await this.findById(facturaId);
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar factura por número
     */
    async findByNumero(numeroFactura) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM facturas_pagos WHERE numero_factura = ?`,
                [numeroFactura]
            );

            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Buscar factura por orden de servicio
     */
    async findByOrdenServicio(ordenServicioId) {
        const connection = await getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT * FROM facturas_pagos WHERE orden_servicio_id = ? LIMIT 1`,
                [ordenServicioId]
            );

            return rows[0] || null;
        } finally {
            connection.release();
        }
    }
}

module.exports = new FacturaRepository();
