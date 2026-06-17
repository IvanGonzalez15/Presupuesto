const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');

router.get('/', materialController.findAll);
router.get('/:id', materialController.findOne);
router.post('/', materialController.create);
router.put('/:id', materialController.update);
router.delete('/:id', materialController.remove);

module.exports = router;
