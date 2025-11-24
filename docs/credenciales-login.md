# Credenciales de Login Actualizadas - Taller Automotriz

## 📋 Cambios Implementados

Se ha modificado el sistema de autenticación para que los **clientes** utilicen:
- **Usuario**: Su correo electrónico registrado
- **Contraseña**: Su número de identificación

## 🔐 Credenciales de Acceso

### Administradores y Personal

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Administrador | `admin` | `admin123` |
| Mecánico | `mecanico` | `mecanico123` |

### Clientes

| Nombre | Usuario (Email) | Contraseña (Identificación) |
|--------|-----------------|----------------------------|
| Paula Pérez | `paula.perezp@cecar.edu.co` | `1193216997` |
| Eliasib Benitez | `eliasib.benitez@cecar.edu.co` | `1104008652` |
| test test | `setst@gmail.com` | `555` |
| Juan Bernal | `juan.bernanl@gmail.com` | `55555` |

## 📝 Notas Importantes

1. **Nuevos clientes**: Al registrar un nuevo cliente en el sistema:
   - Se debe crear su usuario en la tabla `usuarios` de `db_autenticacion`
   - El `usuario_id` debe coincidir con el `cliente_id` de `db_clientes_vehiculos`
   - El username debe ser su email
   - La contraseña debe ser el hash bcrypt de su identificación

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
