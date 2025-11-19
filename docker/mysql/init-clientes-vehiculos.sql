-- ========================================
-- Base de Datos: db_clientes_vehiculos
-- Microservicio: ms-clientes-vehiculos
-- ========================================

USE db_clientes_vehiculos;

-- ========================================
-- TABLA: clientes (Agregado Cliente - Raíz)
-- ========================================

CREATE TABLE IF NOT EXISTS clientes (
    cliente_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tipo_identificacion VARCHAR(20) NOT NULL COMMENT 'CEDULA, PASAPORTE, NIT',
    identificacion VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    direccion VARCHAR(300) NULL,
    ciudad VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_identificacion (identificacion),
    INDEX idx_nombres (nombres, apellidos),
    INDEX idx_email (email),
    
    CHECK (tipo_identificacion IN ('CEDULA', 'PASAPORTE', 'NIT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: vehiculos (Entidad interna de Cliente)
-- ========================================

CREATE TABLE IF NOT EXISTS vehiculos (
    vehiculo_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cliente_id CHAR(36) NOT NULL,
    placa VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    color VARCHAR(30) NULL,
    vin VARCHAR(100) NULL UNIQUE COMMENT 'Vehicle Identification Number',
    kilometraje_actual INT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id) ON DELETE CASCADE,
    
    INDEX idx_cliente (cliente_id),
    INDEX idx_placa (placa),
    INDEX idx_marca_modelo (marca, modelo),
    INDEX idx_vin (vin),
    
    CHECK (anio >= 1900 AND anio <= 2100),
    CHECK (kilometraje_actual >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: historial_servicios
-- ========================================

CREATE TABLE IF NOT EXISTS historial_servicios (
    historial_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehiculo_id CHAR(36) NOT NULL,
    orden_servicio_id CHAR(36) NOT NULL COMMENT 'Referencia externa a ms-reparaciones',
    fecha DATE NOT NULL,
    tipo_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    costo DECIMAL(10,2) NOT NULL,
    kilometraje INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(vehiculo_id) ON DELETE CASCADE,
    
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_orden (orden_servicio_id),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DATOS DE PRUEBA
-- ========================================

-- Clientes de prueba
INSERT INTO clientes (cliente_id, tipo_identificacion, identificacion, nombres, apellidos, telefono, email, direccion, ciudad) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'CEDULA', '1234567890', 'Juan', 'Pérez', '+57 300 1234567', 'juan.perez@email.com', 'Calle 10 #20-30', 'Sincelejo'),
('770e8400-e29b-41d4-a716-446655440002', 'CEDULA', '0987654321', 'María', 'García', '+57 310 9876543', 'maria.garcia@email.com', 'Carrera 5 #15-25', 'Sincelejo'),
('770e8400-e29b-41d4-a716-446655440003', 'NIT', '900123456-7', 'Empresa Transportes S.A.', '', '+57 320 5551234', 'info@transportes.com', 'Avenida Principal #100-50', 'Sincelejo');

-- Vehículos de prueba
INSERT INTO vehiculos (vehiculo_id, cliente_id, placa, marca, modelo, anio, color, vin, kilometraje_actual) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'ABC123', 'Toyota', 'Corolla', 2020, 'Blanco', '1HGBH41JXMN109186', 45000),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'XYZ789', 'Chevrolet', 'Spark', 2019, 'Rojo', '2HGBH41JXMN109187', 62000),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'DEF456', 'Mazda', 'CX-5', 2021, 'Gris', '3HGBH41JXMN109188', 28000),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003', 'GHI789', 'Mercedes Benz', 'Sprinter', 2018, 'Blanco', '4HGBH41JXMN109189', 125000);

-- Historial de servicios de prueba
INSERT INTO historial_servicios (historial_id, vehiculo_id, orden_servicio_id, fecha, tipo_servicio, descripcion, costo, kilometraje) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', CURDATE(), 'MANTENIMIENTO_PREVENTIVO', 'Cambio de aceite y revisión general', 150000.00, 45000);

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista: Clientes con sus vehículos
CREATE OR REPLACE VIEW v_clientes_vehiculos AS
SELECT 
    c.cliente_id,
    c.tipo_identificacion,
    c.identificacion,
    CONCAT(c.nombres, ' ', c.apellidos) AS nombre_completo,
    c.telefono,
    c.email,
    c.direccion,
    c.ciudad,
    v.vehiculo_id,
    v.placa,
    v.marca,
    v.modelo,
    v.anio,
    v.color,
    v.kilometraje_actual
FROM clientes c
LEFT JOIN vehiculos v ON c.cliente_id = v.cliente_id;

-- Vista: Historial completo de servicios por vehículo
CREATE OR REPLACE VIEW v_historial_vehiculos AS
SELECT 
    v.vehiculo_id,
    v.placa,
    v.marca,
    v.modelo,
    v.anio,
    c.cliente_id,
    CONCAT(c.nombres, ' ', c.apellidos) AS propietario,
    h.historial_id,
    h.orden_servicio_id,
    h.fecha,
    h.tipo_servicio,
    h.descripcion,
    h.costo,
    h.kilometraje,
    COUNT(*) OVER (PARTITION BY v.vehiculo_id) AS total_servicios
FROM vehiculos v
INNER JOIN clientes c ON v.cliente_id = c.cliente_id
LEFT JOIN historial_servicios h ON v.vehiculo_id = h.vehiculo_id
ORDER BY h.fecha DESC;