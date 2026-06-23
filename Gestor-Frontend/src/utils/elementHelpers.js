import { BASE_URL } from '../services/api';

export const parseElementExtraData = (item) => {
  try {
    if (item && item.Foto && item.Foto.trim().startsWith('{')) {
      return JSON.parse(item.Foto);
    }
  } catch (e) {
    console.error('Error parsing extra data in elementHelpers:', e);
  }
  return {
    fotoUrl: (item && item.Foto && !item.Foto.trim().startsWith('{')) ? item.Foto : '',
    largo: 0,
    ancho: 0,
    alto: 0,
    materials: { porex: false, linex: false, fibra: false, pintura: false, mortero: false },
    hours: { oficina: 0, programacion: 0, mecanizado: 0, prepost: 0, esculpir: 0, linex: 0, fibra: 0 }
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
