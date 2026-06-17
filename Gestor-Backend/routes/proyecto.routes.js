const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyecto.controller');

router.get('/', proyectoController.findAll);
router.get('/:id', proyectoController.findOne);
router.post('/', proyectoController.create);
router.put('/:id', proyectoController.update);
router.delete('/:id', proyectoController.remove);

module.exports = router;
