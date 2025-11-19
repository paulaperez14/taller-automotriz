-- ========================================
-- Base de Datos: db_facturacion_pagos
-- Microservicio: ms-facturacion-pagos
-- ========================================

USE db_facturacion_pagos;

CREATE TABLE IF NOT EXISTS facturas_pagos (
    factura_pago_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    factura_id CHAR(36) NOT NULL COMMENT 'Referencia a factura en ms-reparaciones',
    orden_servicio_id CHAR(36) NOT NULL,
    cliente_id CHAR(36) NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_numero_factura (numero_factura),
    INDEX idx_orden (orden_servicio_id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado (estado),
    
    CHECK (estado IN ('PENDIENTE', 'PAGADA', 'ANULADA'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pagos (
    pago_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    factura_pago_id CHAR(36) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL COMMENT 'EFECTIVO, TARJETA_CREDITO, TARJETA_DEBITO, TRANSFERENCIA, PSE',
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    referencia VARCHAR(100) NULL,
    comprobante VARCHAR(200) NULL,
    fecha_pago TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (factura_pago_id) REFERENCES facturas_pagos(factura_pago_id) ON DELETE CASCADE,
    
    INDEX idx_factura (factura_pago_id),
    INDEX idx_estado (estado),
    INDEX idx_metodo (metodo_pago),
    
    CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'PSE'))
) ENGINE=InnoDB;