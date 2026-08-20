// Paletas da arte do perfil.
// A cena muda conforme a hora em Sao Paulo e conforme o tema do GitHub.
// Cada paleta define os mesmos tokens, entao os templates de SVG nao precisam
// saber nada sobre horario nem sobre tema.

const DARK = {
  madrugada: {
    label: 'madrugada',
    bgTop: '#03060C', bgMid: '#050B14', horizon: '#0B1626',
    city: '#0B1A2B', haze: '#2E7FBF',
    desk: '#060D18', deskLine: '#16263A',
    screenBg: '#071322', screenPanel: '#0D1C2E',
    ink: '#E7F1FF', muted: '#8AA2BE', dim: '#5C7492',
    accent: '#5FA8E0', accentSoft: '#8FC4EF',
    body: '#04080F', metal: '#4A5568',
    celestial: '#DCEBFF', celestialType: 'moon',
    starOpacity: 1, windowOpacity: 1, rain: true,
  },
  manha: {
    label: 'manha',
    bgTop: '#0A1524', bgMid: '#1B3A5C', horizon: '#C97B4E',
    city: '#15293F', haze: '#E0956B',
    desk: '#0A1421', deskLine: '#1E3450',
    screenBg: '#08192B', screenPanel: '#102338',
    ink: '#EFF5FC', muted: '#93AAC4', dim: '#68829E',
    accent: '#6FB4E6', accentSoft: '#9CCBF2',
    body: '#070E18', metal: '#55637A',
    celestial: '#FFD9A8', celestialType: 'sun',
    starOpacity: 0.25, windowOpacity: 0.45, rain: false,
  },
  tarde: {
    label: 'tarde',
    bgTop: '#0E2440', bgMid: '#1E4A78', horizon: '#5B95C4',
    city: '#1A3350', haze: '#7FB6DE',
    desk: '#0C1C2E', deskLine: '#26405B',
    screenBg: '#0A1E33', screenPanel: '#132B45',
    ink: '#F2F8FE', muted: '#9DB6CE', dim: '#7291AE',
    accent: '#7FC0EC', accentSoft: '#AEDAF6',
    body: '#0A1522', metal: '#5E6D84',
    celestial: '#FFE8BF', celestialType: 'sun',
    starOpacity: 0, windowOpacity: 0.2, rain: false,
  },
  noite: {
    label: 'noite',
    bgTop: '#050B14', bgMid: '#0B1626', horizon: '#12324A',
    city: '#0D1E31', haze: '#2E7FBF',
    desk: '#070F1B', deskLine: '#1B2C42',
    screenBg: '#081525', screenPanel: '#0F2033',
    ink: '#E7F1FF', muted: '#88A0BC', dim: '#5C7492',
    accent: '#5FA8E0', accentSoft: '#8FC4EF',
    body: '#050B14', metal: '#4A5568',
    celestial: '#DCEBFF', celestialType: 'moon',
    starOpacity: 1, windowOpacity: 1, rain: true,
  },
};

const LIGHT = {
  madrugada: {
    label: 'madrugada',
    bgTop: '#8DA2BD', bgMid: '#A9BCD2', horizon: '#C6D2E0',
    city: '#6C84A1', haze: '#5A7696',
    desk: '#DCE6F2', deskLine: '#A9BCD2',
    screenBg: '#20344C', screenPanel: '#2C425D',
    ink: '#101E31', muted: '#3D587A', dim: '#5F7B99',
    accent: '#1F6FB2', accentSoft: '#3E8CCB',
    body: '#243852', metal: '#7C8EA5',
    celestial: '#F7FAFF', celestialType: 'moon',
    starOpacity: 0.3, windowOpacity: 0.5, rain: true,
  },
  manha: {
    label: 'manha',
    bgTop: '#B7D6F0', bgMid: '#D9E9F8', horizon: '#F4D9C0',
    city: '#8FA9C4', haze: '#E8A87C',
    desk: '#EDF3FA', deskLine: '#BCCFE3',
    screenBg: '#183049', screenPanel: '#22415C',
    ink: '#0E2035', muted: '#3C5A7A', dim: '#6486A6',
    accent: '#1A6BAF', accentSoft: '#3B8AC9',
    body: '#22384F', metal: '#8496AC',
    celestial: '#FFC77A', celestialType: 'sun',
    starOpacity: 0, windowOpacity: 0.2, rain: false,
  },
  tarde: {
    label: 'tarde',
    bgTop: '#9CCAEC', bgMid: '#C7E1F5', horizon: '#E4F1FB',
    city: '#7C9CBC', haze: '#A8CDE8',
    desk: '#EAF2FA', deskLine: '#B4CBE0',
    screenBg: '#153046', screenPanel: '#1F3D59',
    ink: '#0C1E33', muted: '#365474', dim: '#5F81A2',
    accent: '#15629F', accentSoft: '#3A85C4',
    body: '#1E3349', metal: '#7F92A9',
    celestial: '#FFDC94', celestialType: 'sun',
    starOpacity: 0, windowOpacity: 0.12, rain: false,
  },
  noite: {
    label: 'noite',
    bgTop: '#7E93B4', bgMid: '#9FB2CC', horizon: '#D3B6A8',
    city: '#5E779A', haze: '#B98D77',
    desk: '#D6E2F0', deskLine: '#A3B7CF',
    screenBg: '#1B2F47', screenPanel: '#264260',
    ink: '#0F1E31', muted: '#39557A', dim: '#5D7A9C',
    accent: '#1D68AC', accentSoft: '#3C88C7',
    body: '#20364E', metal: '#78899F',
    celestial: '#FFF1D6', celestialType: 'moon',
    starOpacity: 0.35, windowOpacity: 0.7, rain: true,
  },
};

/** Faixa do dia em Sao Paulo, independente do fuso onde a Action roda. */
export function periodOf(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hour12: false,
    }).format(date),
  );
  if (hour < 6) return 'madrugada';
  if (hour < 12) return 'manha';
  if (hour < 18) return 'tarde';
  return 'noite';
}

export function paletteFor(period, theme) {
  const table = theme === 'light' ? LIGHT : DARK;
  return { ...table[period], theme, period };
}
