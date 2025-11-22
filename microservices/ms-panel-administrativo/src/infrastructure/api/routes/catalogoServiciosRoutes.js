const express = require('express');
const { body, param, query } = require('express-validator');
const CatalogoServiciosController = require('../controllers/CatalogoServiciosController');

const router = express.Router();

// Listar servicios con filtros
router.get('/',
    [
        query('categoria').optional().isIn(['MANTENIMIENTO', 'REPARACION', 'DIAGNOSTICO', 'PINTURA', 'ELECTRICO', 'OTROS']),
        query('activo').optional().toBoolean(),
        query('busqueda').optional().trim()
    ],
    CatalogoServiciosController.listar
);

// Obtener categorías
router.get('/categorias',
    CatalogoServiciosController.obtenerCategorias
);

// Obtener servicio por ID
router.get('/:id',
    [param('id').isUUID()],
    CatalogoServiciosController.obtenerPorId
);

// Obtener servicios por categoría
router.get('/categoria/:categoria',
    [param('categoria').isIn(['MANTENIMIENTO', 'REPARACION', 'DIAGNOSTICO', 'PINTURA', 'ELECTRICO', 'OTROS'])],
    CatalogoServiciosController.obtenerPorCategoria
);

// Crear servicio
router.post('/',
    [
        body('codigo').notEmpty().trim().withMessage('Código es requerido'),
        body('nombre').notEmpty().trim().withMessage('Nombre es requerido'),
        body('descripcion').optional().trim(),
        body('categoria').isIn(['MANTENIMIENTO', 'REPARACION', 'DIAGNOSTICO', 'PINTURA', 'ELECTRICO', 'OTROS']).withMessage('Categoría inválida'),
        body('precio_base').isFloat().withMessage('Precio base debe ser un número'),
        body('duracion_estimada').isInt({ min: 1 }).withMessage('Duración estimada debe ser mayor a 0'),
        body('activo').optional().isBoolean()
    ],
    CatalogoServiciosController.crear
);

// Actualizar servicio
router.put('/:id',
    [
        param('id').isUUID(),
        body('codigo').optional().notEmpty().trim(),
        body('nombre').optional().notEmpty().trim(),
        body('descripcion').optional().trim(),
        body('categoria').optional().isIn(['MANTENIMIENTO', 'REPARACION', 'DIAGNOSTICO', 'PINTURA', 'ELECTRICO', 'OTROS']),
        body('precio_base').optional().isFloat(),
        body('duracion_estimada').optional().isInt({ min: 1 }),
        body('activo').optional().isBoolean()
    ],
    CatalogoServiciosController.actualizar
);

// Eliminar servicio
router.delete('/:id',
    [param('id').isUUID()],
    CatalogoServiciosController.eliminar
);

// Toggle activo/inactivo
router.patch('/:id/toggle-activo',
    [param('id').isUUID()],
    CatalogoServiciosController.toggleActivo
);

module.exports = router;
