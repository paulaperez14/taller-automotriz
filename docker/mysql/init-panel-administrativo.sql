-- ========================================
-- Base de Datos: db_panel_administrativo
-- Microservicio: ms-panel-administrativo
-- ========================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE db_panel_administrativo;

-- ========================================
-- TABLA: catalogo_servicios
-- Catálogo de servicios predefinidos del taller
-- ========================================

CREATE TABLE IF NOT EXISTS catalogo_servicios (
    servicio_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    categoria VARCHAR(100) NOT NULL COMMENT 'MANTENIMIENTO, REPARACION, DIAGNOSTICO, PINTURA, ELECTRICO, OTROS',
    precio_base DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duracion_estimada INT NOT NULL DEFAULT 60 COMMENT 'En minutos',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categoria (categoria),
    INDEX idx_activo (activo),
    INDEX idx_codigo (codigo),
    
    CHECK (categoria IN ('MANTENIMIENTO', 'REPARACION', 'DIAGNOSTICO', 'PINTURA', 'ELECTRICO', 'OTROS'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Catálogo de servicios predefinidos
INSERT INTO catalogo_servicios (servicio_id, codigo, nombre, descripcion, categoria, precio_base, duracion_estimada, activo) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'MANT-001', 'Cambio de aceite y filtro', 'Cambio de aceite motor y filtro de aceite', 'MANTENIMIENTO', 80000.00, 60, TRUE),
('aa0e8400-e29b-41d4-a716-446655440002', 'MANT-002', 'Alineación y balanceo', 'Alineación computarizada y balanceo de 4 llantas', 'MANTENIMIENTO', 120000.00, 120, TRUE),
('aa0e8400-e29b-41d4-a716-446655440003', 'MANT-003', 'Revisión de frenos', 'Inspección completa del sistema de frenos', 'MANTENIMIENTO', 50000.00, 90, TRUE),
('aa0e8400-e29b-41d4-a716-446655440004', 'MANT-004', 'Cambio de filtro de aire', 'Reemplazo de filtro de aire del motor', 'MANTENIMIENTO', 35000.00, 30, TRUE),
('aa0e8400-e29b-41d4-a716-446655440005', 'MANT-005', 'Rotación de llantas', 'Rotación y verificación de presión de llantas', 'MANTENIMIENTO', 40000.00, 45, TRUE),
('aa0e8400-e29b-41d4-a716-446655440006', 'REP-001', 'Cambio de pastillas de freno', 'Reemplazo de pastillas de freno delanteras o traseras', 'REPARACION', 150000.00, 120, TRUE),
('aa0e8400-e29b-41d4-a716-446655440007', 'REP-002', 'Cambio de batería', 'Reemplazo de batería con instalación', 'REPARACION', 200000.00, 45, TRUE),
('aa0e8400-e29b-41d4-a716-446655440008', 'REP-003', 'Reparación de motor', 'Diagnóstico y reparación de motor', 'REPARACION', 800000.00, 480, TRUE),
('aa0e8400-e29b-41d4-a716-446655440009', 'REP-004', 'Cambio de clutch', 'Reemplazo de kit de clutch completo', 'REPARACION', 600000.00, 360, TRUE),
('aa0e8400-e29b-41d4-a716-446655440010', 'REP-005', 'Cambio de amortiguadores', 'Reemplazo de amortiguadores delanteros o traseros', 'REPARACION', 400000.00, 180, TRUE),
('aa0e8400-e29b-41d4-a716-446655440011', 'DIAG-001', 'Escaneo computarizado', 'Diagnóstico con scanner automotriz', 'DIAGNOSTICO', 80000.00, 60, TRUE),
('aa0e8400-e29b-41d4-a716-446655440012', 'DIAG-002', 'Prueba de compresión', 'Verificación de compresión de cilindros', 'DIAGNOSTICO', 100000.00, 90, TRUE),
('aa0e8400-e29b-41d4-a716-446655440013', 'ELEC-001', 'Revisión sistema eléctrico', 'Diagnóstico completo del sistema eléctrico', 'ELECTRICO', 120000.00, 120, TRUE),
('aa0e8400-e29b-41d4-a716-446655440014', 'ELEC-002', 'Instalación de alarma', 'Instalación de sistema de alarma', 'ELECTRICO', 250000.00, 180, TRUE),
('aa0e8400-e29b-41d4-a716-446655440015', 'PINT-001', 'Retoque de pintura', 'Retoque de pintura menor', 'PINTURA', 150000.00, 240, TRUE);

-- Sin datos de prueba de indicadores
