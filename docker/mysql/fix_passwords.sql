USE db_autenticacion;

-- Actualizar hash del admin (admin123)
UPDATE usuarios 
SET password_hash = '$2b$10$kSw0WK21YjmK60bHiPig3u0fcikQ.Tw5L2Dfro26WnAy.Zn6bBNn6' 
WHERE email = 'admin@taller.com';

-- Actualizar hash del mecanico (mecanico123)
UPDATE usuarios 
SET password_hash = '$2b$10$/Uou596AslYMmXLcu6hPWenFModtd8y69juAm9RhcPO301n/4.hgq' 
WHERE email = 'mecanico@taller.com';

-- Verificar
SELECT email, rol, LENGTH(password_hash) as hash_length, LEFT(password_hash, 30) as hash_preview 
FROM usuarios;
