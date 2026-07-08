const fs = require('fs');
const path = require('path');
const db = require('../models');
const { getTarifas, parseElementExtraData, calcularPrecioPieza } = require('../helpers/calc.helper');

exports.get = (req, res, next) => {
  try {
    const tarifas = getTarifas();
    res.json(tarifas);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { manoObra, coeficientePVP } = req.body;
    if (!manoObra || coeficientePVP === undefined) {
      return res.status(400).json({ message: 'Todos los campos (manoObra, coeficientePVP) son obligatorios.' });
    }

    const filePath = path.join(__dirname, '..', 'data', 'tarifas.json');
    const newTarifas = {
      manoObra: {
        oficina: Number(manoObra.oficina || 0),
        programacion: Number(manoObra.programacion || 0),
        mecanizado: Number(manoObra.mecanizado || 0),
        prepost: Number(manoObra.prepost || 0),
        esculpir: Number(manoObra.esculpir || 0),
        linex: Number(manoObra.linex || 0),
        fibra: Number(manoObra.fibra || 0),
        mortero: Number(manoObra.mortero || 0),
        pintura: Number(manoObra.pintura || 0),
        estructura: Number(manoObra.estructura || 0),
        entrega: Number(manoObra.entrega || 0)
      },
      coeficientePVP: Number(coeficientePVP || 0.5)
    };

    fs.writeFileSync(filePath, JSON.stringify(newTarifas, null, 2), 'utf8');

    const elementos = await db.Elemento.findAll();
    const updates = elementos.map(async (el) => {
      if (el.Foto && el.Foto.trim().startsWith('{')) {
        const extra = parseElementExtraData(el.Foto);
        const calculated = await calcularPrecioPieza(extra, el.Cantidad);
        
        if (el.Precio !== calculated.precio || 
            el.medida_metro_cuadrado !== calculated.medida_metro_cuadrado || 
            el.medida_metro_cubico !== calculated.medida_metro_cubico) {
          el.Precio = calculated.precio;
          el.medida_metro_cuadrado = calculated.medida_metro_cuadrado;
          el.medida_metro_cubico = calculated.medida_metro_cubico;
          await el.save();
        }
      }
    });
    await Promise.all(updates);

    res.json(newTarifas);
  } catch (error) {
    next(error);
  }
};
