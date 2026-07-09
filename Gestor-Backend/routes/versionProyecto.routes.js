const express = require('express');
const router = express.Router();
const versionProyectoController = require('../controllers/versionProyecto.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.use(authenticateToken);

// Rutas de versiones bajo un proyecto
router.get('/:proyectoId/versiones', versionProyectoController.getVersiones);
router.post('/:proyectoId/versiones', versionProyectoController.crearVersion);
router.post('/:proyectoId/versiones/:versionId/restore', versionProyectoController.restaurarVersion);
router.delete('/:proyectoId/versiones/:versionId', versionProyectoController.eliminarVersion);

module.exports = router;
