const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const hashPasswordMiddleware = require('../middlewares/bcrypt.middleware');

router.get('/', usuarioController.findAll);
router.get('/:id', usuarioController.findOne);
router.post('/', hashPasswordMiddleware, usuarioController.create);
router.put('/:id', hashPasswordMiddleware, usuarioController.update);
router.delete('/:id', usuarioController.remove);

module.exports = router;
