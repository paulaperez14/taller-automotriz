#!/bin/bash

# ========================================
# Script de Inicialización del Proyecto
# Taller Automotriz - Microservicios
# ========================================

echo "🚗 Iniciando configuración del proyecto Taller Automotriz..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========================================
# 1. Verificar requisitos
# ========================================

echo -e "${BLUE}📋 Verificando requisitos...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado. Por favor instala Docker Desktop.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todos los requisitos están instalados${NC}"
echo ""

# ========================================
# 2. Crear archivo .env si no existe
# ========================================

echo -e "${BLUE}📝 Configurando variables de entorno...${NC}"

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado desde .env.example${NC}"
    echo -e "${YELLOW}⚠️  Por favor, revisa y ajusta las variables en .env${NC}"
else
    echo -e "${YELLOW}⚠️  El archivo .env ya existe, saltando...${NC}"
fi

echo ""

# ========================================
# 3. Crear directorios necesarios
# ========================================

echo -e "${BLUE}📁 Creando estructura de directorios...${NC}"

mkdir -p docker/mysql
mkdir -p microservices/ms-autenticacion
mkdir -p microservices/ms-agendamiento
mkdir -p microservices/ms-reparaciones
mkdir -p microservices/ms-repuestos
mkdir -p microservices/ms-clientes-vehiculos
mkdir -p microservices/ms-facturacion-pagos
mkdir -p microservices/ms-panel-administrativo
mkdir -p infrastructure/notification-service
mkdir -p infrastructure/api-gateway
mkdir -p shared/events
mkdir -p docs

echo -e "${GREEN}✅ Estructura de directorios creada${NC}"
echo ""

# ========================================
# 4. Copiar scripts SQL si no existen
# ========================================

echo -e "${BLUE}🗄️  Verificando scripts SQL...${NC}"

SQL_FILES=(
    "init-autenticacion.sql"
    "init-agendamiento.sql"
    "init-reparaciones.sql"
    "init-repuestos.sql"
    "init-clientes-vehiculos.sql"
    "init-facturacion-pagos.sql"
    "init-panel-administrativo.sql"
)

for file in "${SQL_FILES[@]}"; do
    if [ ! -f "docker/mysql/$file" ]; then
        echo -e "${YELLOW}⚠️  Falta docker/mysql/$file${NC}"
        echo "   Por favor, crea este archivo con el esquema de la base de datos"
    fi
done

echo ""

# ========================================
# 5. Levantar contenedores de Docker
# ========================================

echo -e "${BLUE}🐳 Iniciando contenedores Docker...${NC}"
echo -e "${YELLOW}   Esto puede tomar varios minutos la primera vez...${NC}"
echo ""

docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contenedores Docker iniciados correctamente${NC}"
else
    echo -e "${RED}❌ Error al iniciar contenedores Docker${NC}"
    exit 1
fi

echo ""

# ========================================
# 6. Esperar a que las bases de datos estén listas
# ========================================

echo -e "${BLUE}⏳ Esperando a que las bases de datos estén listas...${NC}"

# Función para verificar si MySQL está listo
check_mysql() {
    docker exec $1 mysqladmin ping -h localhost --silent
}

MYSQL_CONTAINERS=(
    "mysql-autenticacion"
    "mysql-agendamiento"
    "mysql-reparaciones"
    "mysql-repuestos"
    "mysql-clientes-vehiculos"
    "mysql-facturacion-pagos"
    "mysql-panel-administrativo"
)

for container in "${MYSQL_CONTAINERS[@]}"; do
    echo -n "   Esperando $container... "
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if check_mysql $container 2>/dev/null; then
            echo -e "${GREEN}✅${NC}"
            break
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ Timeout${NC}"
    fi
done

echo ""

# ========================================
# 7. Verificar RabbitMQ
# ========================================

echo -e "${BLUE}🐰 Verificando RabbitMQ...${NC}"

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec rabbitmq rabbitmq-diagnostics ping 2>/dev/null; then
        echo -e "${GREEN}✅ RabbitMQ está listo${NC}"
        break
    fi
    
    attempt=$((attempt + 1))
    sleep 2
done

echo ""

# ========================================
# 8. Mostrar información de acceso
# ========================================

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuración completada exitosamente${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📡 Servicios disponibles:${NC}"
echo ""
echo "  🗄️  Bases de Datos MySQL:"
echo "     - ms-autenticacion:         localhost:3307"
echo "     - ms-agendamiento:          localhost:3308"
echo "     - ms-reparaciones:          localhost:3309"
echo "     - ms-repuestos:             localhost:3310"
echo "     - ms-clientes-vehiculos:    localhost:3311"
echo "     - ms-facturacion-pagos:     localhost:3312"
echo "     - ms-panel-administrativo:  localhost:3313"
echo ""
echo "  🐰 RabbitMQ:"
echo "     - AMQP:                     localhost:5672"
echo "     - Management UI:            http://localhost:15672"
echo "       Usuario: admin / Contraseña: admin123"
echo ""
echo "  🔧 PHPMyAdmin:"
echo "     - Web UI:                   http://localhost:8080"
echo "       Servidor: Seleccionar cualquier mysql-*"
echo "       Usuario: root / Contraseña: root123"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo ""
echo "  1. Inicializar microservicios:"
echo "     cd microservices/ms-reparaciones"
echo "     npm init -y"
echo "     npm install express mysql2 dotenv"
echo ""
echo "  2. Ver logs de los contenedores:"
echo "     docker-compose logs -f"
echo ""
echo "  3. Detener todos los servicios:"
echo "     docker-compose down"
echo ""
echo "  4. Limpiar todo (incluyendo volúmenes):"
echo "     docker-compose down -v"
echo ""
echo -e "${GREEN}¡Listo para desarrollar! 🚀${NC}"
echo ""