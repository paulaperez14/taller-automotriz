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
    
    CHECK (estado IN ('PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'))
) ENGINE=InnoDB;

-- Datos de prueba
INSERT INTO citas (cita_id, cliente_id, vehiculo_id, fecha, hora, motivo, estado) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', 'Mantenimiento preventivo', 'CONFIRMADA');
