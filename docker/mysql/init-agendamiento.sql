-- ========================================
-- Base de Datos: db_agendamiento
-- Microservicio: ms-agendamiento
-- ========================================

USE db_agendamiento;

CREATE TABLE IF NOT EXISTS citas (
    cita_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cliente_id CHAR(36) NOT NULL,
    vehiculo_id CHAR(36) NOT NULL,
    mecanico_id CHAR(36) NULL,
    sede_id INT NOT NULL COMMENT 'ID de la sede donde se realizará el servicio',
    servicio_id CHAR(36) NULL COMMENT 'ID del servicio del catálogo',
    nombre_servicio VARCHAR(200) NULL COMMENT 'Nombre del servicio',
    precio_servicio DECIMAL(10,2) NULL COMMENT 'Precio base del servicio',
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    duracion_estimada INT NOT NULL DEFAULT 60 COMMENT 'En minutos',
    motivo VARCHAR(500) NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PROGRAMADA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_fecha_hora (fecha, hora),
    INDEX idx_cliente (cliente_id),
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_estado (estado),
    INDEX idx_sede_fecha (sede_id, fecha),
    INDEX idx_servicio (servicio_id),
    
    CHECK (estado IN ('PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'))
) ENGINE=InnoDB;

-- Datos de prueba
-- Sin datos de prueba
