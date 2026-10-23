export const colors = {
  pine: '#12372F',
  paper: '#F2F4EF',
  saffron: '#E8A33D',
  leaf: '#2F8F5B',
  brick: '#C4472E',
  ink: '#1E2A27',
  stone: '#6B7771',
  line: '#DDE2DB',
  white: '#FFFFFF',
};

export const fonts = {
  regular: 'BricolageGrotesque_400Regular',
  semibold: 'BricolageGrotesque_600SemiBold',
  extrabold: 'BricolageGrotesque_800ExtraBold',
};

const categoryPalette = [
  '#E8A33D',
  '#5FA8D3',
  '#C4472E',
  '#7B6FD0',
  '#2F8F5B',
  '#D96BA0',
  '#8C9A5B',
  '#E07B39',
];

export function categoryColor(id) {
  return categoryPalette[id % categoryPalette.length];
}