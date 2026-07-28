export const safeNumber = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? fallback : n;
};

export const safePositiveNumber = (val, fallback = 0) => {
  const n = safeNumber(val, fallback);
  return n < 0 ? fallback : n;
};
