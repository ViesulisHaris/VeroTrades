export const formatCurrency = (value: number) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  return `${sign}$${abs.toFixed(2)}`;
};
