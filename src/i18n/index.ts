import type { Categoria } from '@/model/expense';

export type Idioma = 'es' | 'en' | 'pt';
export type ModoTema = 'SISTEMA' | 'CLARO' | 'OSCURO';

type Copia = {
  appName: string;
  slogan: string;
  speechLang: string;
  loginTitle: string;
  createAccountTitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  repeatPasswordPlaceholder: string;
  passwordMin: string;
  btnEntering: string;
  btnCreating: string;
  linkCreateAccount: string;
  linkHaveAccount: string;
  errorDefaultAuth: string;
  btnBack: string;
  btnBackPlain: string;
  btnEdit: string;
  btnDelete: string;
  btnCancel: string;
  btnDeleting: string;
  btnSend: string;
  labelCategory: string;
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
  mapNoLocation: string;
  mapTapMarker: string;
  mapNeedsNet: string;
  mapCredit: string;
  summaryMonthTotal: string;
  summaryEmptyMonth: string;
  summaryDailyAverage: string;
  summaryPreviousMonth: string;
  summaryByCategory: string;
  aiTitle: string;
  aiSubtitle: string;
  aiGreeting: string;
  aiPlaceholder: string;
  errConsultAi: string;
  profile: string;
  settingsTitle: string;
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
  errReminderConfig: string;
  errReminderSave: string;
  signOut: string;
  genericProfile: string;
  errorExpenseNotFound: string;
  loadingExpenseDetail: string;
  noteTitle: string;
  receiptTitle: string;
  zoomPhotoHint: string;
  placeTitle: string;
  dialogDeleteTitle: string;
  dialogDeleteMessage: string;
  editExpenseTitle: string;
  newExpenseTitle: string;
  quickAssistantTitle: string;
  quickAssistantDesc: string;
  quickAssistantPlaceholder: string;
  btnListening: string;
  btnDictate: string;
  btnThinking: string;
  btnBuild: string;
  expenseDataTitle: string;
  labelAmount: string;
  noteOptionalPlaceholder: string;
  labelDate: string;
  btnCamera: string;
  btnGallery: string;
  btnReadingTicket: string;
  btnCompleteWithPhoto: string;
  btnSearchingLocation: string;
  btnUseLocation: string;
  mapAdjustHint: string;
  btnSaving: string;
  btnSaveChanges: string;
  btnSaveExpense: string;
  errDictationWeb: string;
  errMicPermission: string;
  errMicFailed: string;
  errDictationExpoGo: string;
  errInterpretExpense: string;
  errCameraPermission: string;
  errReadPhoto: string;
  errReadTicket: string;
  errLocationPermission: string;
  errGetLocation: string;
  errAmountZero: string;
  errSaveExpense: string;
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
    appName: 'TicketTrack',
    slogan: 'Tus gastos en un solo lugar',
    speechLang: 'es-AR',
    loginTitle: 'Ingresar',
    createAccountTitle: 'Crear cuenta',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Contraseña',
    repeatPasswordPlaceholder: 'Repetir contraseña',
    passwordMin: 'Mínimo 6 caracteres',
    btnEntering: 'Ingresando...',
    btnCreating: 'Creando...',
    linkCreateAccount: 'Crear cuenta nueva',
    linkHaveAccount: 'Ya tengo cuenta, ingresar',
    errorDefaultAuth: 'No se pudo completar el ingreso. Probá de nuevo.',
    btnBack: '← Volver',
    btnBackPlain: 'Volver',
    btnEdit: 'Editar',
    btnDelete: 'Eliminar',
    btnCancel: 'Cancelar',
    btnDeleting: 'Eliminando...',
    btnSend: 'Enviar',
    labelCategory: 'Categoría',
    navExpenses: 'Gastos',
    navMap: 'Mapa',
    navSummary: 'Resumen',
    navAi: 'Asistente',
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
    mapNoLocation: 'Tus gastos no tienen ubicación.',
    mapTapMarker: 'Tocá un marcador para ver el detalle.',
    mapNeedsNet: 'El mapa necesita internet.',
    mapCredit: '© Esri, HERE, Garmin, OpenStreetMap',
    summaryMonthTotal: 'Total del mes',
    summaryEmptyMonth: 'Sin movimientos registrados en este mes.',
    summaryDailyAverage: 'Promedio diario',
    summaryPreviousMonth: 'Mes anterior',
    summaryByCategory: 'Gastos por categoría',
    aiTitle: 'Asistente',
    aiSubtitle: 'Analizá tus hábitos, pedí consejos de ahorro o consultá dudas sobre tus consumos registrados.',
    aiGreeting: '¡Hola! Soy tu asistente financiero.\n¿En qué te puedo ayudar hoy?',
    aiPlaceholder: 'Escribí acá...',
    errConsultAi: 'No se pudo consultar al asistente',
    profile: 'Perfil',
    settingsTitle: 'Configuración',
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
    errReminderConfig: 'Error al configurar el recordatorio.',
    errReminderSave: 'Error al guardar el recordatorio.',
    signOut: 'Cerrar sesión',
    genericProfile: 'Perfil',
    errorExpenseNotFound: 'No encontramos ese gasto.',
    loadingExpenseDetail: 'Cargando gasto...',
    noteTitle: 'Nota',
    receiptTitle: 'Comprobante',
    zoomPhotoHint: 'Tocá la foto para ampliarla',
    placeTitle: 'Lugar',
    dialogDeleteTitle: 'Eliminar gasto',
    dialogDeleteMessage: 'Se va a borrar este gasto de tu listado.',
    editExpenseTitle: 'Editar gasto',
    newExpenseTitle: 'Nuevo gasto',
    quickAssistantTitle: 'Asistente rápido',
    quickAssistantDesc: 'Ahorrá tiempo dictando qué compraste.',
    quickAssistantPlaceholder: 'Contá tu gasto acá...',
    btnListening: 'Escuchando...',
    btnDictate: 'Dictar',
    btnThinking: 'Pensando...',
    btnBuild: 'Armar',
    expenseDataTitle: 'Datos del gasto',
    labelAmount: 'Monto',
    noteOptionalPlaceholder: 'Nota (opcional)',
    labelDate: 'Fecha',
    btnCamera: 'Cámara',
    btnGallery: 'Galería',
    btnReadingTicket: 'Leyendo ticket...',
    btnCompleteWithPhoto: 'Completar con la foto',
    btnSearchingLocation: 'Buscando...',
    btnUseLocation: 'Usar mi ubicación',
    mapAdjustHint: 'Deslizá el mapa para ajustar el punto exacto.',
    btnSaving: 'Guardando...',
    btnSaveChanges: 'Guardar cambios',
    btnSaveExpense: 'Guardar gasto',
    errDictationWeb: 'El dictado por voz no está disponible en la versión web.',
    errMicPermission: 'Activá el micrófono y el reconocimiento de voz para dictar.',
    errMicFailed: 'No se pudo usar el micrófono. Escribí la frase.',
    errDictationExpoGo: 'El dictado requiere la app instalada (no funciona en Expo Go).',
    errInterpretExpense: 'No se pudo interpretar el gasto',
    errCameraPermission: 'Activá la cámara para fotografiar el ticket.',
    errReadPhoto: 'No se pudo leer la foto',
    errReadTicket: 'No se pudo leer el ticket',
    errLocationPermission: 'Activá la ubicación precisa para guardar el lugar.',
    errGetLocation: 'No se pudo obtener la ubicación.',
    errAmountZero: 'El monto tiene que ser mayor que 0.',
    errSaveExpense: 'No se pudo guardar el gasto',
  },
  en: {
    appName: 'TicketTrack',
    slogan: 'Your expenses in one place',
    speechLang: 'en-US',
    loginTitle: 'Log in',
    createAccountTitle: 'Create account',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    repeatPasswordPlaceholder: 'Repeat password',
    passwordMin: 'Minimum 6 characters',
    btnEntering: 'Logging in...',
    btnCreating: 'Creating...',
    linkCreateAccount: 'Create new account',
    linkHaveAccount: 'I already have an account, log in',
    errorDefaultAuth: 'Could not complete login. Please try again.',
    btnBack: '← Back',
    btnBackPlain: 'Back',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    btnCancel: 'Cancel',
    btnDeleting: 'Deleting...',
    btnSend: 'Send',
    labelCategory: 'Category',
    navExpenses: 'Expenses',
    navMap: 'Map',
    navSummary: 'Summary',
    navAi: 'Assistant',
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
    mapNoLocation: 'Your expenses have no location.',
    mapTapMarker: 'Tap a marker to see details.',
    mapNeedsNet: 'The map needs internet.',
    mapCredit: '© Esri, HERE, Garmin, OpenStreetMap',
    summaryMonthTotal: 'Monthly total',
    summaryEmptyMonth: 'No transactions recorded this month.',
    summaryDailyAverage: 'Daily average',
    summaryPreviousMonth: 'Previous month',
    summaryByCategory: 'Expenses by category',
    aiTitle: 'Assistant',
    aiSubtitle: 'Analyze your habits, ask for saving tips, or check questions about your recorded expenses.',
    aiGreeting: 'Hi! I am your financial assistant.\nHow can I help you today?',
    aiPlaceholder: 'Type here...',
    errConsultAi: 'Could not reach the assistant',
    profile: 'Profile',
    settingsTitle: 'Settings',
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
    errReminderConfig: 'Error configuring the reminder.',
    errReminderSave: 'Error saving the reminder.',
    signOut: 'Sign out',
    genericProfile: 'Profile',
    errorExpenseNotFound: 'Expense not found.',
    loadingExpenseDetail: 'Loading expense...',
    noteTitle: 'Note',
    receiptTitle: 'Receipt',
    zoomPhotoHint: 'Tap the photo to zoom in',
    placeTitle: 'Location',
    dialogDeleteTitle: 'Delete expense',
    dialogDeleteMessage: 'This expense will be deleted from your list.',
    editExpenseTitle: 'Edit expense',
    newExpenseTitle: 'New expense',
    quickAssistantTitle: 'Quick assistant',
    quickAssistantDesc: 'Save time by dictating what you bought.',
    quickAssistantPlaceholder: 'Describe your expense here...',
    btnListening: 'Listening...',
    btnDictate: 'Dictate',
    btnThinking: 'Thinking...',
    btnBuild: 'Fill in',
    expenseDataTitle: 'Expense details',
    labelAmount: 'Amount',
    noteOptionalPlaceholder: 'Note (optional)',
    labelDate: 'Date',
    btnCamera: 'Camera',
    btnGallery: 'Gallery',
    btnReadingTicket: 'Reading receipt...',
    btnCompleteWithPhoto: 'Fill in from photo',
    btnSearchingLocation: 'Searching...',
    btnUseLocation: 'Use my location',
    mapAdjustHint: 'Drag the map to adjust the exact spot.',
    btnSaving: 'Saving...',
    btnSaveChanges: 'Save changes',
    btnSaveExpense: 'Save expense',
    errDictationWeb: 'Voice dictation is not available on the web version.',
    errMicPermission: 'Enable the microphone and speech recognition to dictate.',
    errMicFailed: 'Could not use the microphone. Type the phrase instead.',
    errDictationExpoGo: 'Dictation requires the installed app (does not work in Expo Go).',
    errInterpretExpense: 'Could not interpret the expense',
    errCameraPermission: 'Enable the camera to take a photo of the receipt.',
    errReadPhoto: 'Could not read the photo',
    errReadTicket: 'Could not read the receipt',
    errLocationPermission: 'Enable precise location to save the place.',
    errGetLocation: 'Could not get location.',
    errAmountZero: 'The amount must be greater than 0.',
    errSaveExpense: 'Could not save the expense',
  },
  pt: {
    appName: 'TicketTrack',
    slogan: 'Suas despesas em um só lugar',
    speechLang: 'pt-BR',
    loginTitle: 'Entrar',
    createAccountTitle: 'Criar conta',
    emailPlaceholder: 'E-mail',
    passwordPlaceholder: 'Senha',
    repeatPasswordPlaceholder: 'Repetir senha',
    passwordMin: 'Mínimo 6 caracteres',
    btnEntering: 'Entrando...',
    btnCreating: 'Criando...',
    linkCreateAccount: 'Criar nova conta',
    linkHaveAccount: 'Já tenho uma conta, entrar',
    errorDefaultAuth: 'Não foi possível completar o login. Tente novamente.',
    btnBack: '← Voltar',
    btnBackPlain: 'Voltar',
    btnEdit: 'Editar',
    btnDelete: 'Excluir',
    btnCancel: 'Cancelar',
    btnDeleting: 'Excluindo...',
    btnSend: 'Enviar',
    labelCategory: 'Categoria',
    navExpenses: 'Despesas',
    navMap: 'Mapa',
    navSummary: 'Resumo',
    navAi: 'Assistente',
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
    mapNoLocation: 'Suas despesas não têm local.',
    mapTapMarker: 'Toque em um marcador para ver os detalhes.',
    mapNeedsNet: 'O mapa precisa de internet.',
    mapCredit: '© Esri, HERE, Garmin, OpenStreetMap',
    summaryMonthTotal: 'Total do mês',
    summaryEmptyMonth: 'Nenhuma movimentação registrada neste mês.',
    summaryDailyAverage: 'Média diária',
    summaryPreviousMonth: 'Mês anterior',
    summaryByCategory: 'Despesas por categoria',
    aiTitle: 'Assistente',
    aiSubtitle: 'Analise seus hábitos, peça dicas de economia ou tire dúvidas sobre seus gastos registrados.',
    aiGreeting: 'Olá! Sou seu assistente financeiro.\nComo posso ajudar hoje?',
    aiPlaceholder: 'Escreva aqui...',
    errConsultAi: 'Não foi possível consultar o assistente',
    profile: 'Perfil',
    settingsTitle: 'Configurações',
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
    errReminderConfig: 'Erro ao configurar o lembrete.',
    errReminderSave: 'Erro ao salvar o lembrete.',
    signOut: 'Sair',
    genericProfile: 'Perfil',
    errorExpenseNotFound: 'Despesa não encontrada.',
    loadingExpenseDetail: 'Carregando despesa...',
    noteTitle: 'Nota',
    receiptTitle: 'Comprovante',
    zoomPhotoHint: 'Toque na foto para ampliar',
    placeTitle: 'Local',
    dialogDeleteTitle: 'Excluir despesa',
    dialogDeleteMessage: 'Esta despesa será excluída da sua lista.',
    editExpenseTitle: 'Editar despesa',
    newExpenseTitle: 'Nova despesa',
    quickAssistantTitle: 'Assistente rápido',
    quickAssistantDesc: 'Economize tempo ditando o que você comprou.',
    quickAssistantPlaceholder: 'Descreva sua despesa aqui...',
    btnListening: 'Ouvindo...',
    btnDictate: 'Ditar',
    btnThinking: 'Pensando...',
    btnBuild: 'Preencher',
    expenseDataTitle: 'Dados da despesa',
    labelAmount: 'Valor',
    noteOptionalPlaceholder: 'Nota (opcional)',
    labelDate: 'Data',
    btnCamera: 'Câmera',
    btnGallery: 'Galeria',
    btnReadingTicket: 'Lendo comprovante...',
    btnCompleteWithPhoto: 'Preencher com a foto',
    btnSearchingLocation: 'Buscando...',
    btnUseLocation: 'Usar minha localização',
    mapAdjustHint: 'Arraste o mapa para ajustar o ponto exato.',
    btnSaving: 'Salvando...',
    btnSaveChanges: 'Salvar alterações',
    btnSaveExpense: 'Salvar despesa',
    errDictationWeb: 'O ditado por voz não está disponível na versão web.',
    errMicPermission: 'Ative o microfone e o reconhecimento de voz para ditar.',
    errMicFailed: 'Não foi possível usar o microfone. Digite a frase.',
    errDictationExpoGo: 'O ditado requer o aplicativo instalado (não funciona no Expo Go).',
    errInterpretExpense: 'Não foi possível interpretar a despesa',
    errCameraPermission: 'Ative a câmera para fotografar o comprovante.',
    errReadPhoto: 'Não foi possível ler a foto',
    errReadTicket: 'Não foi possível ler o comprovante',
    errLocationPermission: 'Ative a localização precisa para salvar o local.',
    errGetLocation: 'Não foi possível obter a localização.',
    errAmountZero: 'O valor deve ser maior que 0.',
    errSaveExpense: 'Não foi possível salvar a despesa',
  },
};

export const IDIOMAS: { id: Idioma; etiqueta: string }[] = [
  { id: 'es', etiqueta: 'Español' },
  { id: 'en', etiqueta: 'English' },
  { id: 'pt', etiqueta: 'Português' },
];