# Credenciales de Login Actualizadas - Taller Automotriz

## 📋 Cambios Implementados

Se ha modificado el sistema de autenticación para que los **clientes** utilicen:
- **Usuario**: Su correo electrónico registrado
- **Contraseña**: Su número de identificación

## 🔐 Credenciales de Acceso

### Personal del Taller

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Administrador | `admin` | `admin123` |
| Mecánico | `mecanico` | `mecanico123` |

### Clientes

Los clientes **NO** están hardcodeados. Sus credenciales se crean automáticamente cuando:
1. El cliente agenda su primera cita
2. El sistema registra al cliente en `db_clientes_vehiculos`
3. Se generan automáticamente sus credenciales de acceso:
   - **Usuario**: Su email registrado
   - **Contraseña**: Su número de identificación

Ejemplo: Si un cliente con email `juan@ejemplo.com` e identificación `123456789` agenda una cita, podrá iniciar sesión con:
- Usuario: `juan@ejemplo.com`
- Contraseña: `123456789`

## 📝 Notas Importantes

1. **Nuevos clientes**: Al agendar una cita, el sistema automáticamente:
   - Crea el usuario en la tabla `usuarios` de `db_autenticacion`
   - Asigna el email como username
   - Genera la contraseña usando la identificación del cliente
   - El `usuario_id` coincide con el `cliente_id` de `db_clientes_vehiculos`

2. **Generación de hash bcrypt**: 
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = bcrypt.hashSync('identificacion', 10);
   ```

3. **Archivos modificados**:
   - `docker/mysql/init-autenticacion.sql` - Script de inicialización actualizado
   - `docker/mysql/update_client_credentials.sql` - Script de actualización aplicado

## 🔄 Aplicar Cambios en el Futuro

Si bajas y vuelves a levantar los contenedores desde cero:
```bash
docker-compose down -v
docker-compose up -d
```

Los cambios se aplicarán automáticamente gracias al script `init-autenticacion.sql` actualizado.

## ✅ Verificación

Para verificar las credenciales en la base de datos:
```bash
docker exec mysql-autenticacion mysql -uroot -proot123 -D db_autenticacion -e "SELECT usuario_id, username, email, rol FROM usuarios WHERE rol = 'CLIENTE';"
```

---

**Fecha de actualización**: 23 de Noviembre 2025
