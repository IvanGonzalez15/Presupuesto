const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const clienteController = require('./controllers/cliente.controller');
const elementoController = require('./controllers/elemento.controller');
const proyectoController = require('./controllers/proyecto.controller');
const usuarioController = require('./controllers/usuario.controller');
const materialController = require('./controllers/material.controller');
const { ensureElementoProjectForeignKey } = require('./config/ensureSchema');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const bindCrudRoutes = (basePath, controller) => {
  app.get(basePath, controller.findAll);
  app.get(`${basePath}/:id`, controller.findOne);
  app.post(basePath, controller.create);
  app.put(`${basePath}/:id`, controller.update);
  app.delete(`${basePath}/:id`, controller.remove);
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gestor-presupuestos-api' });
});

bindCrudRoutes('/api/clientes', clienteController);
bindCrudRoutes('/api/usuarios', usuarioController);
bindCrudRoutes('/api/proyectos', proyectoController);
bindCrudRoutes('/api/elementos', elementoController);

app.get('/api/materiales', materialController.findAll);
app.get('/api/materiales/:id', materialController.findOne);
app.post('/api/materiales', materialController.ensureAdmin, materialController.create);
app.put('/api/materiales/:id', materialController.ensureAdmin, materialController.update);
app.delete('/api/materiales/:id', materialController.ensureAdmin, materialController.remove);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: 'Error interno del servidor',
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
});

const startServer = async () => {
  try {
    await ensureElementoProjectForeignKey();
  } catch (error) {
    console.error('No se pudo verificar la clave foránea de elementos.Id_proyecto:', error.message);
  }

  app.listen(port, () => {
    console.log(`API de presupuestos escuchando en http://localhost:${port}`);
  });
};

startServer();
