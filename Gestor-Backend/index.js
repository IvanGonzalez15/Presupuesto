const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const db = require('./models');

// Routers
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const proyectoRoutes = require('./routes/proyecto.routes');
const elementoRoutes = require('./routes/elemento.routes');
const tarifaRoutes = require('./routes/tarifa.routes');
const tarifaMaterialRoutes = require('./routes/tarifaMaterial.routes');
const versionProyectoRoutes = require('./routes/versionProyecto.routes');
const authenticateToken = require('./middlewares/auth.middleware');
const authorizeRoles = require('./middlewares/role.middleware');

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
app.use('/api/proyectos', versionProyectoRoutes);
app.use('/api/elementos', elementoRoutes);
app.use('/api/tarifas', tarifaRoutes);
app.use('/api/tarifas-materiales', tarifaMaterialRoutes);

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

app.put('/api/empresas', authenticateToken, authorizeRoles('Admin'), (req, res, next) => {
  try {
    const companies = req.body;
    if (!Array.isArray(companies)) {
      return res.status(400).json({ message: 'El body debe ser un array de empresas.' });
    }
    const companiesPath = path.join(__dirname, 'data', 'companies.json');
    fs.writeFileSync(companiesPath, JSON.stringify(companies, null, 2), 'utf8');
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

app.put('/api/templateoptions', authenticateToken, authorizeRoles('Admin'), (req, res, next) => {
  try {
    const options = req.body;
    if (!options.noIncluido || !options.formaPago || !options.importante || !options.descripcion) {
      return res.status(400).json({ message: 'Estructura de opciones no válida (faltan campos noIncluido, formaPago, importante o descripcion).' });
    }
    const filePath = path.join(__dirname, 'data', 'templateoptions.json');
    fs.writeFileSync(filePath, JSON.stringify(options, null, 2), 'utf8');
    res.json(options);
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
    await db.sequelize.authenticate();
    console.log('Conexión con la base de datos establecida correctamente.');
    await db.sequelize.sync();
    console.log('Base de datos sincronizada con Sequelize de forma segura.');
    
    // Sembrar materiales iniciales si la tabla está vacía
    const seedMateriales = async () => {
      try {
        const count = await db.TarifaMaterial.count();
        if (count === 0) {
          await db.TarifaMaterial.bulkCreate([
            { categoria: 'porex', nombre: 'Porex Estándar', precio: 90.00, unidad: 'm3' },
            { categoria: 'linex', nombre: 'Line-X Estándar', precio: 10.00, unidad: 'm2' },
            { categoria: 'fibra', nombre: 'Fibra Estándar', precio: 12.00, unidad: 'm2' },
            { categoria: 'pintura', nombre: 'Pintura Estándar', precio: 25.00, unidad: 'm2' },
            { categoria: 'mortero', nombre: 'Mortero Estándar', precio: 190.00, unidad: 'm2' }
          ]);
          console.log('Tarifas de materiales iniciales insertadas.');
        }
      } catch (err) {
        console.error('Error al semillar materiales:', err.message);
      }
    };
    await seedMateriales();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
  }

  app.listen(port, () => {
    console.log(`API de presupuestos escuchando en http://localhost:${port}`);
  });
};

startServer();
