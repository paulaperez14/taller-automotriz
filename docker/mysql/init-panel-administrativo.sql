-- ========================================
-- Base de Datos: db_panel_administrativo
-- Microservicio: ms-panel-administrativo
-- ========================================

USE db_panel_administrativo;

CREATE TABLE IF NOT EXISTS indicadores (
    indicador_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL COMMENT 'SERVICIOS, INGRESOS, EFICIENCIA, SATISFACCION',
    valor DECIMAL(15,2) NOT NULL,
    unidad VARCHAR(20) NULL COMMENT 'COP, unidades, porcentaje, horas',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    periodo VARCHAR(20) NOT NULL COMMENT 'DIARIO, SEMANAL, MENSUAL, ANUAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tipo (tipo),
    INDEX idx_periodo (periodo),
    INDEX idx_fecha_inicio (fecha_inicio),
    
    CHECK (tipo IN ('SERVICIOS', 'INGRESOS', 'EFICIENCIA', 'SATISFACCION')),
    CHECK (periodo IN ('DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reportes (
    reporte_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    titulo VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    datos JSON NULL,
    generado_por VARCHAR(100) NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tipo (tipo),
    INDEX idx_fecha (fecha_generacion)
) ENGINE=InnoDB;

-- Datos de prueba
INSERT INTO indicadores (indicador_id, nombre, tipo, valor, unidad, fecha_inicio, fecha_fin, periodo) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'Total de servicios realizados', 'SERVICIOS', 45, 'unidades', DATE_SUB(CURDATE(), INTERVAL 1 MONTH), CURDATE(), 'MENSUAL'),
('ff0e8400-e29b-41d4-a716-446655440002', 'Ingresos totales', 'INGRESOS', 15750000.00, 'COP', DATE_SUB(CURDATE(), INTERVAL 1 MONTH), CURDATE(), 'MENSUAL');
