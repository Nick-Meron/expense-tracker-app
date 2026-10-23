import { CURRENCY } from './config';

export function money(value) {
  const number = Number(value);
  const [whole, decimals] = Math.abs(number).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = number < 0 ? '-' : '';
  const symbol = CURRENCY ? `${CURRENCY} ` : '';
  return `${sign}${symbol}${grouped}.${decimals}`;
}