const fs = require('fs').promises;
const path = require('path');
const db = require('../models');
const { parseElementExtraData, calcularPrecioPieza } = require('../helpers/calc.helper');

const normalizeElemento = (body) => {
  const base = {
    Nombre: body.Nombre,
    Foto: body.Foto || null,
    Ref: body.Ref,
    Id_usuario_creador: body.Id_usuario_creador,
    Id_proyecto: body.Id_proyecto,
    Cantidad: Number(body.Cantidad || 1),
    Unidad_de_medida: body.Unidad_de_medida || 'ud',
    Precio: Number(body.Precio || 0),
    medida_metro_cuadrado: Number(body.medida_metro_cuadrado || 0),
    medida_metro_cubico: Number(body.medida_metro_cubico || 0)
  };

  if (base.Foto && base.Foto.trim().startsWith('{')) {
    const extra = parseElementExtraData(base.Foto);
    const calculated = calcularPrecioPieza(extra);
    base.medida_metro_cuadrado = calculated.medida_metro_cuadrado;
    base.medida_metro_cubico = calculated.medida_metro_cubico;
    base.Precio = calculated.precio;
  }

  return base;
};

exports.findAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.proyectoId) {
      filter.Id_proyecto = req.query.proyectoId;
    }
    
    const elementos = await db.Elemento.findAll({
      where: filter,
      order: [['id', 'DESC']]
    });
    res.json(elementos);
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const elemento = await db.Elemento.findByPk(req.params.id);
    if (!elemento) return res.status(404).json({ message: 'Elemento no encontrado' });
    res.json(elemento);
  } catch (error) {
    next(error);
  }
};

const createReferencia = async (projectId) => {
  const project = await db.Proyecto.findByPk(projectId);
  if (!project) return null;

  const count = await db.Elemento.count({
    where: { Id_proyecto: projectId }
  });

  const nextNum = count + 1;
  const suffix = String(nextNum).padStart(3, '0');

  return `${project.Codigo}-${suffix}`;
};

exports.create = async (req, res, next) => {
  try {
    const data = normalizeElemento(req.body);
    if (!data.Nombre || !data.Id_usuario_creador || !data.Id_proyecto) {
      return res.status(400).json({ message: 'Nombre, Id_usuario_creador e Id_proyecto son obligatorios' });
    }

    const Ref = await createReferencia(data.Id_proyecto);
    if (!Ref) return res.status(404).json({ message: 'Proyecto no encontrado' });
    data.Ref = Ref;

    const nuevoElemento = await db.Elemento.create(data);
    res.status(201).json(nuevoElemento);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = normalizeElemento(req.body);
    const [affectedRows] = await db.Elemento.update(data, {
      where: { id: req.params.id }
    });
    
    if (!affectedRows) return res.status(404).json({ message: 'Elemento no encontrado' });
    
    const updatedElemento = await db.Elemento.findByPk(req.params.id);
    res.json(updatedElemento);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deletedCount = await db.Elemento.destroy({
      where: { id: req.params.id }
    });
    
    if (!deletedCount) return res.status(404).json({ message: 'Elemento no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    const { fileData, filename } = req.body;
    if (!fileData || !filename) {
      return res.status(400).json({ message: 'fileData y filename son obligatorios' });
    }

    const match = fileData.match(/^data:([^;]+);base64,(.*)$/);
    let base64Content = fileData;
    let extension = path.extname(filename) || '.png';
    let mimeType = 'image/png';
    
    if (match) {
      mimeType = match[1];
      base64Content = match[2];
      
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({ message: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP).' });
      }

      if (!path.extname(filename)) {
        if (mimeType === 'image/jpeg') extension = '.jpg';
        else if (mimeType === 'image/png') extension = '.png';
        else if (mimeType === 'image/gif') extension = '.gif';
        else if (mimeType === 'image/webp') extension = '.webp';
      }
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const sanitizedExtension = extension.toLowerCase();
    if (!allowedExtensions.includes(sanitizedExtension)) {
      return res.status(400).json({ message: 'Extensión de archivo no permitida. Solo se permiten imágenes (.jpg, .jpeg, .png, .gif, .webp).' });
    }

    const buffer = Buffer.from(base64Content, 'base64');
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ message: 'El archivo excede el tamaño máximo permitido de 5MB.' });
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const newFilename = `img_${uniqueId}${sanitizedExtension}`;
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, newFilename);

    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${newFilename}`;
    res.status(200).json({ url: relativeUrl });
  } catch (error) {
    next(error);
  }
};
