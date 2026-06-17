const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elemento.controller');

router.get('/', elementoController.findAll);
router.get('/:id', elementoController.findOne);
router.post('/', elementoController.create);
router.put('/:id', elementoController.update);
router.delete('/:id', elementoController.remove);

module.exports = router;
