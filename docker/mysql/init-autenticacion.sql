-- ========================================
-- Base de Datos: db_agendamiento
-- Microservicio: ms-agendamiento
-- ========================================

USE db_autenticacion;

CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL COMMENT 'ADMINISTRADOR, MECANICO, RECEPCIONISTA, CLIENTE',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    
    CHECK (rol IN ('ADMINISTRADOR', 'MECANICO', 'RECEPCIONISTA', 'CLIENTE'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sesiones (
    sesion_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    expira_en TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    
    INDEX idx_token (token(255)),
    INDEX idx_usuario (usuario_id),
    INDEX idx_expira (expira_en)
) ENGINE=InnoDB;

-- Usuarios de prueba
-- Admin: usuario=admin, password=admin123
-- Mecanico: usuario=mecanico, password=mecanico123
-- Clientes: usuario=email, password=identificación
INSERT INTO usuarios (usuario_id, username, password_hash, email, rol) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', '$2b$10$gJyQ58hlsDoAHPJ4XagtxeFmS5xo3BBviw.pGJxCe0FDREIr55/rW', 'admin@taller.com', 'ADMINISTRADOR'),
('22222222-2222-2222-2222-222222222222', 'mecanico', '$2b$10$gJyQ58hlsDoAHPJ4XagtxeFmS5xo3BBviw.pGJxCe0FDREIr55/rW', 'mecanico@taller.com', 'MECANICO'),
('156c9b58-234a-43e2-b67d-126d6572a712', 'paula.perezp@cecar.edu.co', '$2b$10$esNlbRmtM2N9v9LKOrTZ1OfzLoEUJ01d7TYFInuT6vjc.O9fk6vB.', 'paula.perezp@cecar.edu.co', 'CLIENTE'),
('45296626-f6cb-4477-90e6-5f9accb77452', 'eliasib.benitez@cecar.edu.co', '$2b$10$.UNfUBtSE3S6uMHWWWwRrOWc2wUv9Gjqfuycp7Rp1CSVgn4PEVjAi', 'eliasib.benitez@cecar.edu.co', 'CLIENTE'),
('4cece28b-c141-4887-b8c1-c44bbdf2e404', 'setst@gmail.com', '$2b$10$xlQhf7IqNB6gaGYZMEeFcuMHhDb8E3Yx/UVPN9bvQWSIY/zXC8no2', 'setst@gmail.com', 'CLIENTE'),
('90afbda9-533c-44a4-b5ef-32752c74302e', 'juan.bernanl@gmail.com', '$2b$10$arx6qzfoCOanP/2h0LlPkOX4m4sFMIqj1EImz1FilPJk/80KBkZnS', 'juan.bernanl@gmail.com', 'CLIENTE')
ON DUPLICATE KEY UPDATE username=VALUES(username), password_hash=VALUES(password_hash), email=VALUES(email);

