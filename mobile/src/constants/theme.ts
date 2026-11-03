export const palette = {
  navy: '#0B1F3A',
  navyDeep: '#061426',
  navySoft: '#122B4D',
  ink: '#101D2F',
  yellow: '#F5B82E',
  yellowSoft: '#FEF5DB',
  canvas: '#F6F9FD',
  white: '#FFFFFF',
  muted: '#7D889A',
  subtle: '#9AA5B4',
  line: '#E8EEF6',
  red: '#EF4453',
  blue: '#2F80ED',
  green: '#12A76A',
  purple: '#7C5CFC',
  orange: '#F79009',
} as const;

export const shadow = {
  card: {
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  float: {
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  nav: {
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;
