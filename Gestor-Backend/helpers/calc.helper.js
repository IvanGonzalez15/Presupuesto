// Gestor-Backend/helpers/calc.helper.js

const TARIFAS = {
  materiales: {
    porex: 90.0,
    linex: 10.0,
    fibra: 12.0,
    pintura: 25.0,
    mortero: 190.0
  },
  manoObra: {
    oficina: 25.0,
    programacion: 35.0,
    mecanizado: 15.0,
    prepost: 25.0,
    esculpir: 25.0,
    linex: 25.0,
    fibra: 25.0
  }
};

const parseElementExtraData = (foto) => {
  try {
    if (foto && typeof foto === 'string' && foto.trim().startsWith('{')) {
      return JSON.parse(foto);
    }
  } catch (e) {
    console.error('Error parsing element extra data JSON:', e.message);
  }
  return {
    fotoUrl: (foto && typeof foto === 'string' && !foto.trim().startsWith('{')) ? foto : '',
    largo: 0,
    ancho: 0,
    alto: 0,
    materials: { porex: false, linex: false, fibra: false, pintura: false, mortero: false },
    hours: { oficina: 0, programacion: 0, mecanizado: 0, prepost: 0, esculpir: 0, linex: 0, fibra: 0 }
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

const calcularPrecioPieza = (extraData) => {
  const largo = Number(extraData.largo || 0);
  const ancho = Number(extraData.ancho || 0);
  const alto = Number(extraData.alto || 0);
  const { m2, m3 } = calcularMedidas(largo, ancho, alto);

  const materials = extraData.materials || {};
  const hours = extraData.hours || {};

  // Material costs
  const costPorex = materials.porex ? m3 * TARIFAS.materiales.porex : 0;
  const costLineX = materials.linex ? m2 * TARIFAS.materiales.linex : 0;
  const costFibra = materials.fibra ? m2 * TARIFAS.materiales.fibra : 0;
  const costPintura = materials.pintura ? m2 * TARIFAS.materiales.pintura : 0;
  const costMortero = materials.mortero ? m2 * TARIFAS.materiales.mortero : 0;

  // Labor costs
  const costOficina = Number(hours.oficina || 0) * TARIFAS.manoObra.oficina;
  const costProgramacion = Number(hours.programacion || 0) * TARIFAS.manoObra.programacion;
  const costMecanizado = Number(hours.mecanizado || 0) * TARIFAS.manoObra.mecanizado;
  const costPrepost = Number(hours.prepost || 0) * TARIFAS.manoObra.prepost;
  const costEsculpir = Number(hours.esculpir || 0) * TARIFAS.manoObra.esculpir;
  const costLineXLabor = materials.linex ? Number(hours.linex || 0) * TARIFAS.manoObra.linex : 0;
  const costFibraLabor = materials.fibra ? Number(hours.fibra || 0) * TARIFAS.manoObra.fibra : 0;

  const newPrice = costPorex + costLineX + costFibra + costPintura + costMortero +
                   costOficina + costProgramacion + costMecanizado + costPrepost + costEsculpir +
                   costLineXLabor + costFibraLabor;

  return {
    precio: newPrice,
    medida_metro_cuadrado: m2,
    medida_metro_cubico: m3
  };
};

module.exports = {
  parseElementExtraData,
  calcularMedidas,
  calcularPrecioPieza
};
