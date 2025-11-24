-- Script para actualizar números de orden existentes
USE db_reparaciones;

-- Crear función para generar código alfanumérico
DELIMITER $$

CREATE FUNCTION IF NOT EXISTS generar_codigo_orden() 
RETURNS VARCHAR(7)
DETERMINISTIC
BEGIN
    DECLARE codigo VARCHAR(7);
    DECLARE caracteres VARCHAR(32) DEFAULT 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    DECLARE i INT DEFAULT 0;
    
    SET codigo = '';
    WHILE i < 7 DO
        SET codigo = CONCAT(codigo, SUBSTRING(caracteres, FLOOR(1 + RAND() * 32), 1));
        SET i = i + 1;
    END WHILE;
    
    RETURN codigo;
END$$

DELIMITER ;

-- Actualizar órdenes existentes con número de orden
UPDATE ordenes_servicio o
INNER JOIN (
    SELECT orden_id, 
           CONCAT(
               UPPER(SUBSTRING(MD5(CONCAT(orden_id, RAND())), 1, 7)),
               LPAD(
                   COALESCE(
                       (SELECT RIGHT(c.identificacion, 3) 
                        FROM db_clientes_vehiculos.clientes c 
                        WHERE c.cliente_id = o.cliente_id LIMIT 1),
                       '000'
                   ), 3, '0'
               )
           ) as nuevo_numero
    FROM ordenes_servicio o
) as temp ON o.orden_id = temp.orden_id
SET o.numero_orden = temp.nuevo_numero;
