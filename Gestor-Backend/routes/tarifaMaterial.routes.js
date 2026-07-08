const express = require('express');
const router = express.Router();
const tarifaMaterialController = require('../controllers/tarifaMaterial.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.use(authenticateToken);

router.get('/', tarifaMaterialController.getAll);
router.post('/', authorizeRoles('Admin'), tarifaMaterialController.create);
router.put('/:id', authorizeRoles('Admin'), tarifaMaterialController.update);
router.delete('/:id', authorizeRoles('Admin'), tarifaMaterialController.delete);

module.exports = router;
