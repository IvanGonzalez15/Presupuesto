const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const { ensureElementoProjectForeignKey } = require('./config/ensureSchema');

// Routers
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const proyectoRoutes = require('./routes/proyecto.routes');
const elementoRoutes = require('./routes/elemento.routes');
const materialRoutes = require('./routes/material.routes');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Bind Routes
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/elementos', elementoRoutes);
app.use('/api/materiales', materialRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gestor-presupuestos-api' });
});

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
