const fs = require('fs');
const path = require('path');

const getTarifas = () => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'tarifas.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    return {
      manoObra: {
        oficina: 25.0,
        programacion: 35.0,
        mecanizado: 15.0,
        prepost: 25.0,
        esculpir: 25.0,
        linex: 25.0,
        fibra: 25.0,
        mortero: 25.0,
        pintura: 25.0,
        estructura: 25.0,
        entrega: 25.0
      },
      coeficientePVP: 0.5
    };
  }
};

const parseElementExtraData = (foto) => {
  try {
    if (foto && typeof foto === 'string' && foto.trim().startsWith('{')) {
      const parsed = JSON.parse(foto);
      if (parsed.materials) {
        parsed.materials = {
          porex: parsed.materials.porex ?? false,
          linex: parsed.materials.linex ?? false,
          fibra: parsed.materials.fibra ?? false,
          pintura: parsed.materials.pintura ?? false,
          mortero: parsed.materials.mortero ?? false,
          porexId: parsed.materials.porexId || null,
          linexId: parsed.materials.linexId || null,
          fibraId: parsed.materials.fibraId || null,
          pinturaId: parsed.materials.pinturaId || null,
          morteroId: parsed.materials.morteroId || null
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error parsing element extra data JSON:', e.message);
  }
  return {
    fotoUrl: (foto && typeof foto === 'string' && !foto.trim().startsWith('{')) ? foto : '',
    largo: 0,
    ancho: 0,
    alto: 0,
    materials: {
      porex: false, linex: false, fibra: false, pintura: false, mortero: false,
      porexId: null, linexId: null, fibraId: null, pinturaId: null, morteroId: null
    },
    hours: { oficina: 0, programacion: 0, mecanizado: 0, prepost: 0, esculpir: 0, linex: 0, fibra: 0, mortero: 0, pintura: 0, estructura: 0, entrega: 0 }
  };
};

const calcularMedidas = (largo, ancho, alto) => {
  const l = Number(largo || 0) / 1000;
  const w = Number(ancho || 0) / 1000;
  const h = Number(alto || 0) / 1000;

  const m3 = l * w * h;
  const m2 = 2 * ((l * w) + (l * h) + (w * h));
  return { m2, m3 };
};

const calcularPrecioPieza = async (extraData, cantidad = 1, manualM2 = null, manualM3 = null) => {
  const TARIFAS = getTarifas();
  const qty = Math.max(Number(cantidad || 1), 1);
  const largo = Number(extraData.largo || 0);
  const ancho = Number(extraData.ancho || 0);
  const alto = Number(extraData.alto || 0);

  let m2 = (manualM2 !== null && manualM2 !== undefined && Number(manualM2) !== 0) ? Number(manualM2) : 0;
  let m3 = (manualM3 !== null && manualM3 !== undefined && Number(manualM3) !== 0) ? Number(manualM3) : 0;

  if (m2 === 0 && m3 === 0) {
    const calc = calcularMedidas(largo, ancho, alto);
    m2 = calc.m2;
    m3 = calc.m3;
  }

  const materials = extraData.materials || {};
  const hours = extraData.hours || {};

  const db = require('../models');

  
  let porexId = materials.porexId;
  if (!porexId && materials.porex) {
    const defaultMat = await db.TarifaMaterial.findOne({ where: { categoria: 'porex' } });
    if (defaultMat) porexId = defaultMat.id;
  }
  let linexId = materials.linexId;
  if (!linexId && materials.linex) {
    const defaultMat = await db.TarifaMaterial.findOne({ where: { categoria: 'linex' } });
    if (defaultMat) linexId = defaultMat.id;
  }
  let fibraId = materials.fibraId;
  if (!fibraId && materials.fibra) {
    const defaultMat = await db.TarifaMaterial.findOne({ where: { categoria: 'fibra' } });
    if (defaultMat) fibraId = defaultMat.id;
  }
  let pinturaId = materials.pinturaId;
  if (!pinturaId && materials.pintura) {
    const defaultMat = await db.TarifaMaterial.findOne({ where: { categoria: 'pintura' } });
    if (defaultMat) pinturaId = defaultMat.id;
  }
  let morteroId = materials.morteroId;
  if (!morteroId && materials.mortero) {
    const defaultMat = await db.TarifaMaterial.findOne({ where: { categoria: 'mortero' } });
    if (defaultMat) morteroId = defaultMat.id;
  }

  
  let pricePorex = 0;
  let priceLineX = 0;
  let priceFibra = 0;
  let pricePintura = 0;
  let priceMortero = 0;

  if (porexId) {
    const mat = await db.TarifaMaterial.findByPk(porexId);
    if (mat) pricePorex = Number(mat.precio);
  }
  if (linexId) {
    const mat = await db.TarifaMaterial.findByPk(linexId);
    if (mat) priceLineX = Number(mat.precio);
  }
  if (fibraId) {
    const mat = await db.TarifaMaterial.findByPk(fibraId);
    if (mat) priceFibra = Number(mat.precio);
  }
  if (pinturaId) {
    const mat = await db.TarifaMaterial.findByPk(pinturaId);
    if (mat) pricePintura = Number(mat.precio);
  }
  if (morteroId) {
    const mat = await db.TarifaMaterial.findByPk(morteroId);
    if (mat) priceMortero = Number(mat.precio);
  }

  const costPorex = porexId ? m3 * pricePorex * qty : 0;
  const costLineX = linexId ? m2 * priceLineX * qty : 0;
  const costFibra = fibraId ? m2 * priceFibra * qty : 0;
  const costPintura = pinturaId ? m2 * pricePintura * qty : 0;
  const costMortero = morteroId ? m2 * priceMortero * qty : 0;

  const costOficina = Number(hours.oficina || 0) * TARIFAS.manoObra.oficina;
  const costProgramacion = Number(hours.programacion || 0) * TARIFAS.manoObra.programacion;
  const costMecanizado = Number(hours.mecanizado || 0) * TARIFAS.manoObra.mecanizado * qty;
  const costPrepost = Number(hours.prepost || 0) * TARIFAS.manoObra.prepost * qty;
  const costEsculpir = Number(hours.esculpir || 0) * TARIFAS.manoObra.esculpir * qty;
  const costLineXLabor = linexId ? Number(hours.linex || 0) * TARIFAS.manoObra.linex * qty : 0;
  const costFibraLabor = fibraId ? Number(hours.fibra || 0) * TARIFAS.manoObra.fibra * qty : 0;
  const costMorteroLabor = morteroId ? Number(hours.mortero || 0) * (TARIFAS.manoObra.mortero || 25) * qty : 0;
  const costPinturaLabor = pinturaId ? Number(hours.pintura || 0) * (TARIFAS.manoObra.pintura || 25) * qty : 0;
  const costEstructura = Number(hours.estructura || 0) * (TARIFAS.manoObra.estructura || 25) * qty;
  const costEntrega = Number(hours.entrega || 0) * (TARIFAS.manoObra.entrega || 25) * qty;

  const totalCostLote = costPorex + costLineX + costFibra + costPintura + costMortero +
                        costOficina + costProgramacion +
                        costMecanizado + costPrepost + costEsculpir +
                        costLineXLabor + costFibraLabor + costMorteroLabor + costPinturaLabor +
                        costEstructura + costEntrega;

  const pvpTotal = totalCostLote / TARIFAS.coeficientePVP;
  const unitPrice = pvpTotal / qty;

  return {
    precio: unitPrice,
    medida_metro_cuadrado: m2,
    medida_metro_cubico: m3
  };
};

module.exports = {
  parseElementExtraData,
  calcularMedidas,
  calcularPrecioPieza,
  getTarifas
}
;
