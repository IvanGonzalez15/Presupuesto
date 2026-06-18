const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

router.use(authenticateToken);

// View allowed for all roles
router.get('/', materialController.findAll);
router.get('/:id', materialController.findOne);

// Write operations (create, update, delete materials) allowed only for Admins
router.post('/', authorizeRoles('Admin'), materialController.create);
router.put('/:id', authorizeRoles('Admin'), materialController.update);
router.delete('/:id', authorizeRoles('Admin'), materialController.remove);

module.exports = router;
