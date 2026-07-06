const express = require('express');
const router = express.Router();
const tarifaController = require('../controllers/tarifa.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.use(authenticateToken);

router.get('/', tarifaController.get);
router.put('/', authorizeRoles('Admin'), tarifaController.update);

module.exports = router;
