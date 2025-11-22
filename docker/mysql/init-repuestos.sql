-- ========================================
-- Base de Datos: db_repuestos
-- Microservicio: ms-repuestos
-- ========================================

USE db_repuestos;

CREATE TABLE IF NOT EXISTS proveedores (
    proveedor_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    direccion VARCHAR(300) NULL,
    tiempo_entrega_dias INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS repuestos (
    repuesto_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    proveedor_id CHAR(36) NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    categoria VARCHAR(100) NOT NULL COMMENT 'MOTOR, TRANSMISION, FRENOS, SUSPENSION, ELECTRICO',
    marca VARCHAR(100) NULL,
    precio DECIMAL(10,2) NOT NULL,
    cantidad_disponible INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    ubicacion VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(proveedor_id) ON DELETE SET NULL,
    
    INDEX idx_codigo (codigo),
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria),
    INDEX idx_proveedor (proveedor_id),
    
    CHECK (cantidad_disponible >= 0),
    CHECK (precio > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    movimiento_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    repuesto_id CHAR(36) NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL COMMENT 'ENTRADA, SALIDA, AJUSTE',
    cantidad INT NOT NULL,
    cantidad_anterior INT NOT NULL,
    cantidad_nueva INT NOT NULL,
    motivo VARCHAR(200) NULL,
    referencia VARCHAR(100) NULL COMMENT 'Orden de servicio o compra',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (repuesto_id) REFERENCES repuestos(repuesto_id) ON DELETE CASCADE,
    
    INDEX idx_repuesto (repuesto_id),
    INDEX idx_tipo (tipo_movimiento),
    INDEX idx_fecha (created_at),
    
    CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE'))
) ENGINE=InnoDB;

-- Datos de prueba
-- Sin datos de prueba de proveedores ni repuestos
