import type { Categoria } from '@/model/expense';

export type Idioma = 'es' | 'en' | 'pt';
export type ModoTema = 'SISTEMA' | 'CLARO' | 'OSCURO';

type Copia = {
  navExpenses: string;
  navMap: string;
  navSummary: string;
  navAi: string;
  navProfile: string;
  myExpenses: string;
  periodAll: string;
  periodWeek: string;
  periodMonth: string;
  categoryAll: string;
  categories: Record<Categoria, string>;
  offline: string;
  emptyExpenses: string;
  emptyFilter: string;
  expenseCount: (cantidad: number) => string;
  mapOnMap: (cantidad: number) => string;
  mapWithout: (cantidad: number) => string;
  mapCentered: string;
  mapNeedsNet: string;
  mapCredit: string;
  profile: string;
  appearance: string;
  themeSystem: string;
  themeDay: string;
  themeNight: string;
  language: string;
  reminder: string;
  reminderDesc: string;
  reminderTime: string;
  testReminder: string;
  notificationsOff: string;
  reminderWeb: string;
  signOut: string;
  genericProfile: string;
};

const categorias = {
  es: {
    SUPERMERCADO: 'Supermercado',
    TRANSPORTE: 'Transporte',
    SERVICIOS: 'Servicios',
    OCIO: 'Ocio',
    SALUD: 'Salud',
    OTROS: 'Otros',
  },
  en: {
    SUPERMERCADO: 'Groceries',
    TRANSPORTE: 'Transport',
    SERVICIOS: 'Bills',
    OCIO: 'Leisure',
    SALUD: 'Health',
    OTROS: 'Other',
  },
  pt: {
    SUPERMERCADO: 'Supermercado',
    TRANSPORTE: 'Transporte',
    SERVICIOS: 'Serviços',
    OCIO: 'Lazer',
    SALUD: 'Saúde',
    OTROS: 'Outros',
  },
} satisfies Record<Idioma, Record<Categoria, string>>;

export const textos: Record<Idioma, Copia> = {
  es: {
    navExpenses: 'Gastos',
    navMap: 'Mapa',
    navSummary: 'Resumen',
    navAi: 'IA',
    navProfile: 'Perfil',
    myExpenses: 'Mis gastos',
    periodAll: 'Todos',
    periodWeek: 'Esta semana',
    periodMonth: 'Este mes',
    categoryAll: 'Todas',
    categories: categorias.es,
    offline: 'Sin internet: se están viendo los gastos guardados en el teléfono.',
    emptyExpenses: 'Todavía no hay gastos. Tocá + para anotar uno.',
    emptyFilter: 'Ningún gasto coincide con este filtro.',
    expenseCount: (cantidad) => (cantidad === 1 ? '1 gasto' : `${cantidad} gastos`),
    mapOnMap: (cantidad) => (cantidad === 1 ? '1 en el mapa' : `${cantidad} en el mapa`),
    mapWithout: (cantidad) =>
      cantidad === 1 ? '1 sin ubicación' : `${cantidad} sin ubicación`,
    mapCentered: 'No hay gastos con ubicación. El mapa muestra Buenos Aires.',
    mapNeedsNet: 'El mapa necesita internet.',
    mapCredit: '© Esri, HERE, Garmin, OpenStreetMap',
    profile: 'Perfil',
    appearance: 'Apariencia',
    themeSystem: 'Sistema',
    themeDay: 'Día',
    themeNight: 'Noche',
    language: 'Idioma',
    reminder: 'Recordatorio diario',
    reminderDesc: 'Avisar para cargar gastos',
    reminderTime: 'Hora del aviso',
    testReminder: 'Probar aviso',
    notificationsOff: 'Activá las notificaciones para usar el recordatorio.',
    reminderWeb: 'En el navegador no se puede enviar este aviso. Queda guardado y suena en el teléfono.',
    signOut: 'Cerrar sesión',
    genericProfile: 'Perfil',
  },
  en: {
    navExpenses: 'Expenses',
    navMap: 'Map',
    navSummary: 'Summary',
    navAi: 'AI',
    navProfile: 'Profile',
    myExpenses: 'My expenses',
    periodAll: 'All',
    periodWeek: 'This week',
    periodMonth: 'This month',
    categoryAll: 'All',
    categories: categorias.en,
    offline: 'No internet: you are seeing the expenses saved on this phone.',
    emptyExpenses: 'No expenses yet. Tap + to add one.',
    emptyFilter: 'No expenses match this filter.',
    expenseCount: (cantidad) => (cantidad === 1 ? '1 expense' : `${cantidad} expenses`),
    mapOnMap: (cantidad) => (cantidad === 1 ? '1 on the map' : `${cantidad} on the map`),
    mapWithout: (cantidad) =>
      cantidad === 1 ? '1 without a location' : `${cantidad} without a location`,
    mapCentered: 'No expenses have a location. The map shows Buenos Aires.',
    mapNeedsNet: 'The map needs internet.',
    mapCredit: '© Esri, HERE, Garmin, OpenStreetMap',
    profile: 'Profile',
    appearance: 'Appearance',
    themeSystem: 'System',
    themeDay: 'Day',
    themeNight: 'Night',
    language: 'Language',
    reminder: 'Daily reminder',
    reminderDesc: 'Remind me to add expenses',
    reminderTime: 'Reminder time',
    testReminder: 'Test notification',
    notificationsOff: 'Enable notifications to use the reminder.',
    reminderWeb: 'The browser cannot send this notice. It is saved and rings on the phone.',
    signOut: 'Sign out',
    genericProfile: 'Profile',
  },
  pt: {
    navExpenses: 'Despesas',
    navMap: 'Mapa',
    navSummary: 'Resumo',
    navAi: 'IA',
    navProfile: 'Perfil',
    myExpenses: 'Minhas despesas',
    periodAll: 'Todos',
    periodWeek: 'Esta semana',
    periodMonth: 'Este mês',
    categoryAll: 'Todas',
    categories: categorias.pt,
    offline: 'Sem internet: você está vendo as despesas salvas no telefone.',
    emptyExpenses: 'Ainda não há despesas. Toque em + para anotar uma.',
    emptyFilter: 'Nenhuma despesa corresponde a este filtro.',
    expenseCount: (cantidad) => (cantidad === 1 ? '1 despesa' : `${cantidad} despesas`),
    mapOnMap: (cantidad) => (cantidad === 1 ? '1 no mapa' : `${cantidad} no mapa`),
    mapWithout: (cantidad) => (cantidad === 1 ? '1 sem local' : `${cantidad} sem local`),
    mapCentered: 'Não há despesas com local. O mapa mostra Buenos Aires.',
    mapNeedsNet: 'O mapa precisa de internet.',
    mapCredit: '© Esri, HERE, Garmin, OpenStreetMap',
    profile: 'Perfil',
    appearance: 'Aparência',
    themeSystem: 'Sistema',
    themeDay: 'Dia',
    themeNight: 'Noite',
    language: 'Idioma',
    reminder: 'Lembrete diário',
    reminderDesc: 'Avisar para registrar despesas',
    reminderTime: 'Hora do aviso',
    testReminder: 'Testar aviso',
    notificationsOff: 'Ative as notificações para usar o lembrete.',
    reminderWeb: 'O navegador não pode enviar este aviso. Ele fica salvo e toca no telefone.',
    signOut: 'Sair',
    genericProfile: 'Perfil',
  },
};

export const IDIOMAS: { id: Idioma; etiqueta: string }[] = [
  { id: 'es', etiqueta: 'Español' },
  { id: 'en', etiqueta: 'English' },
  { id: 'pt', etiqueta: 'Português' },
];
