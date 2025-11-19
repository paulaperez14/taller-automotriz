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
INSERT INTO proveedores (proveedor_id, nombre, telefono, email, tiempo_entrega_dias) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'Repuestos Colombia S.A.', '+57 300 1111111', 'ventas@repuestoscol.com', 2),
('dd0e8400-e29b-41d4-a716-446655440002', 'Autopartes del Caribe', '+57 310 2222222', 'info@autopartes.com', 3);

INSERT INTO repuestos (repuesto_id, proveedor_id, codigo, nombre, descripcion, categoria, marca, precio, cantidad_disponible, stock_minimo) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'dd0e8400-e29b-41d4-a716-446655440001', 'ACE-10W40-4L', 'Aceite motor 10W-40', 'Aceite sintético 4 litros', 'MOTOR', 'Mobil', 45000.00, 20, 5),
('ee0e8400-e29b-41d4-a716-446655440002', 'dd0e8400-e29b-41d4-a716-446655440001', 'FIL-AC-TOY', 'Filtro de aceite Toyota', 'Filtro compatible Corolla 2015-2023', 'MOTOR', 'Original', 18000.00, 15, 3),
('ee0e8400-e29b-41d4-a716-446655440003', 'dd0e8400-e29b-41d4-a716-446655440002', 'PAS-FR-DEL', 'Pastillas de freno delanteras', 'Juego pastillas cerámicas', 'FRENOS', 'Brembo', 120000.00, 8, 2);
