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

const fs = require('fs');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
app.use('/uploads', express.static(uploadsPath));

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

app.get('/api/empresas', (_req, res, next) => {
  try {
    const companiesPath = path.join(__dirname, 'data', 'companies.json');
    const rawData = fs.readFileSync(companiesPath, 'utf8');
    res.json(JSON.parse(rawData));
  } catch (error) {
    next(error);
  }
});

app.get('/api/templateoptions', (_req, res, next) => {
  try {
    const filePath = path.join(__dirname, 'data', 'templateoptions.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(rawData));
  } catch (error) {
    next(error);
  }
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
