import { BASE_URL } from '../services/api';

export const parseElementExtraData = (item) => {
  try {
    if (item && item.Foto && item.Foto.trim().startsWith('{')) {
      const parsed = JSON.parse(item.Foto);
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
          morteroId: parsed.materials.morteroId || null,
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error parsing extra data in elementHelpers:', e);
  }
  return {
    fotoUrl: (item && item.Foto && !item.Foto.trim().startsWith('{')) ? item.Foto : '',
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

export const serializeElementExtraData = (extraData) => {
  return JSON.stringify(extraData);
};

export const getPhotoUrl = (foto) => {
  if (!foto) return '';
  let path = foto;
  if (typeof foto === 'string' && foto.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(foto);
      path = parsed.fotoUrl || '';
    } catch (e) {
      console.error('Error parsing photo JSON:', e);
      path = '';
    }
  }
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${BASE_URL}${path}`;
};
