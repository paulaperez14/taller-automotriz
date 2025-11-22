-- ========================================
-- Base de Datos: db_reparaciones
-- Microservicio: ms-reparaciones
-- ========================================

USE db_reparaciones;

-- ========================================
-- TABLA: mecanicos (Agregado Mecanico)
-- ========================================

CREATE TABLE IF NOT EXISTS mecanicos (
    mecanico_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL COMMENT 'MECANICA_GENERAL, ELECTRICIDAD, TRANSMISION, MOTOR, FRENOS',
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_especialidad (especialidad),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: ordenes_servicio (Agregado OrdenServicio - Raíz)
-- ========================================

CREATE TABLE IF NOT EXISTS ordenes_servicio (
    orden_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cita_id CHAR(36) NULL COMMENT 'Referencia externa a ms-agendamiento',
    cliente_id CHAR(36) NOT NULL COMMENT 'Referencia externa a ms-clientes-vehiculos',
    vehiculo_id CHAR(36) NOT NULL COMMENT 'Referencia externa a ms-clientes-vehiculos',
    mecanico_id CHAR(36) NULL,
    fecha_creacion DATE NOT NULL,
    fecha_estimada_finalizacion DATE NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE, EN_PROCESO, FINALIZADO, ENTREGADO',
    costo_total DECIMAL(10,2) DEFAULT 0.00,
    diagnostico TEXT NULL,
    gravedad_diagnostico VARCHAR(20) NULL COMMENT 'BAJA, MEDIA, ALTA, CRITICA',
    recomendaciones TEXT NULL,
    fecha_diagnostico DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(mecanico_id) ON DELETE SET NULL,
    
    INDEX idx_cita (cita_id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_mecanico (mecanico_id),
    
    CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'ENTREGADO')),
    CHECK (gravedad_diagnostico IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA') OR gravedad_diagnostico IS NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: servicios (Entidad interna de OrdenServicio)
-- ========================================

CREATE TABLE IF NOT EXISTS servicios (
    servicio_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    orden_id CHAR(36) NOT NULL,
    tipo VARCHAR(100) NOT NULL COMMENT 'MANTENIMIENTO_PREVENTIVO, REPARACION, DIAGNOSTICO',
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE, EN_PROCESO, COMPLETADO',
    horas_estimadas DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(orden_id) ON DELETE CASCADE,
    
    INDEX idx_orden (orden_id),
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    
    CHECK (tipo IN ('MANTENIMIENTO_PREVENTIVO', 'REPARACION', 'DIAGNOSTICO')),
    CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: servicios_repuestos (Relación muchos a muchos)
-- ========================================

CREATE TABLE IF NOT EXISTS servicios_repuestos (
    servicio_repuesto_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    servicio_id CHAR(36) NOT NULL,
    repuesto_id CHAR(36) NOT NULL COMMENT 'Referencia externa a ms-repuestos',
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NULL,
    subtotal DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id) ON DELETE CASCADE,
    
    INDEX idx_servicio (servicio_id),
    INDEX idx_repuesto (repuesto_id),
    
    CHECK (cantidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: facturas (Entidad interna de OrdenServicio)
-- ========================================

CREATE TABLE IF NOT EXISTS facturas (
    factura_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    orden_id CHAR(36) NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    impuestos DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'IVA 19%',
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE, PAGADA, ANULADA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (orden_id) REFERENCES ordenes_servicio(orden_id) ON DELETE CASCADE,
    
    INDEX idx_orden (orden_id),
    INDEX idx_numero_factura (numero_factura),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha),
    
    CHECK (estado IN ('PENDIENTE', 'PAGADA', 'ANULADA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: eventos_dominio (Event Sourcing - Opcional)
-- ========================================

CREATE TABLE IF NOT EXISTS eventos_dominio (
    evento_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    agregado_id CHAR(36) NOT NULL COMMENT 'ID de la orden, mecánico, etc.',
    tipo_agregado VARCHAR(50) NOT NULL COMMENT 'OrdenServicio, Mecanico',
    tipo_evento VARCHAR(100) NOT NULL COMMENT 'OrdenCreadaEvent, MecanicoAsignadoEvent, etc.',
    datos_evento JSON NOT NULL,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_agregado (agregado_id),
    INDEX idx_tipo_evento (tipo_evento),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DATOS DE PRUEBA (Seed Data)
-- ========================================

-- Datos de prueba
-- Sin datos de prueba de mecánicos, órdenes ni servicios

-- ========================================
-- TRIGGERS Y PROCEDIMIENTOS ALMACENADOS
-- ========================================

-- Trigger: Actualizar costo_total de orden cuando se modifica un servicio
DELIMITER //

CREATE TRIGGER actualizar_costo_total_orden
AFTER INSERT ON servicios
FOR EACH ROW
BEGIN
    UPDATE ordenes_servicio
    SET costo_total = (
        SELECT COALESCE(SUM(costo), 0)
        FROM servicios
        WHERE orden_id = NEW.orden_id
    )
    WHERE orden_id = NEW.orden_id;
END//

CREATE TRIGGER actualizar_costo_total_orden_update
AFTER UPDATE ON servicios
FOR EACH ROW
BEGIN
    UPDATE ordenes_servicio
    SET costo_total = (
        SELECT COALESCE(SUM(costo), 0)
        FROM servicios
        WHERE orden_id = NEW.orden_id
    )
    WHERE orden_id = NEW.orden_id;
END//

DELIMITER ;

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista: Órdenes con información completa
CREATE OR REPLACE VIEW v_ordenes_completas AS
SELECT 
    o.orden_id,
    o.cliente_id,
    o.vehiculo_id,
    o.fecha_creacion,
    o.fecha_estimada_finalizacion,
    o.estado AS estado_orden,
    o.costo_total,
    o.diagnostico,
    o.gravedad_diagnostico,
    m.mecanico_id,
    CONCAT(m.nombres, ' ', m.apellidos) AS nombre_mecanico,
    m.especialidad,
    COUNT(s.servicio_id) AS total_servicios,
    SUM(CASE WHEN s.estado = 'COMPLETADO' THEN 1 ELSE 0 END) AS servicios_completados,
    f.factura_id,
    f.numero_factura,
    f.estado AS estado_factura
FROM ordenes_servicio o
LEFT JOIN mecanicos m ON o.mecanico_id = m.mecanico_id
LEFT JOIN servicios s ON o.orden_id = s.orden_id
LEFT JOIN facturas f ON o.orden_id = f.orden_id
GROUP BY o.orden_id, m.mecanico_id, f.factura_id;

-- Vista: Carga de trabajo por mecánico
CREATE OR REPLACE VIEW v_carga_trabajo_mecanicos AS
SELECT 
    m.mecanico_id,
    CONCAT(m.nombres, ' ', m.apellidos) AS nombre_mecanico,
    m.especialidad,
    m.disponible,
    COUNT(o.orden_id) AS ordenes_asignadas,
    SUM(CASE WHEN o.estado = 'EN_PROCESO' THEN 1 ELSE 0 END) AS ordenes_en_proceso,
    SUM(CASE WHEN o.estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS ordenes_pendientes
FROM mecanicos m
LEFT JOIN ordenes_servicio o ON m.mecanico_id = o.mecanico_id
    AND o.estado IN ('PENDIENTE', 'EN_PROCESO')
GROUP BY m.mecanico_id;