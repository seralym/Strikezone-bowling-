import { AppLanguage, BowlerStyle } from '../types/bowling';

export interface Translations {
  // Navigation & Drawer
  menuTitle: string;
  menuSubtitle: string;
  playerProfile: string;
  startNewGame: string;
  startNewTournament: string;
  settings: string;
  currentGame: string;
  backToGame: string;
  swipeHint: string;
  activeTournamentBadge: string;
  currentMatchOnLane: string;
  soundEffects: string;

  // Profile
  profileTitle: string;
  profileSubtitle: string;
  editProfile: string;
  saveProfile: string;
  cancelEdit: string;
  profileSavedToast: string;
  nameLabel: string;
  namePlaceholder: string;
  styleLabel: string;
  styleDescription: string;
  bioLabel: string;
  bioPlaceholder: string;
  tabStats: string;
  tabArsenal: string;
  tabProfileInfo: string;

  // Bowler Styles
  styleRight: string;
  styleLeft: string;
  styleTwoHandedRight: string;
  styleTwoHandedLeft: string;
  styleTwoHanded: string;

  // Stats Highlights
  gamesPlayed: string;
  averageScore: string;
  highScore: string;
  strikeRate: string;
  spareRate: string;
  cleanGames: string;
  splitsCovered: string;
  recentGamesChart: string;
  frameDynamicsChart: string;
  pinHeatmap: string;
  pinHeatmapDesc: string;
  performanceByBall: string;
  performanceByPattern: string;
  performanceByCenter: string;
  noGamesYet: string;
  noGamesDesc: string;

  // Arsenal
  arsenalTitle: string;
  arsenalDesc: string;
  ballsTitle: string;
  oilPatternsTitle: string;
  centersTitle: string;
  addBallBtn: string;
  addPatternBtn: string;
  addCenterBtn: string;
  weightLbs: string;
  coverstock: string;
  primaryStrikeBall: string;
  spareBall: string;
  patternLength: string;
  patternVolume: string;
  patternRatio: string;
  centerLanes: string;
  centerSurface: string;

  // Game Screen
  currentRoll: string;
  frameLabel: string;
  rollFirst: string;
  rollSecond: string;
  standingPinsCount: string;
  confirmThrowBtn: string;
  quickFunctions: string;
  strikeBtn: string;
  spareBtn: string;
  foulBtn: string;
  gutterBtn: string;
  undoBtn: string;
  quickPinsCount: string;
  maxPins: string;
  scoreLabel: string;
  maxScoreLabel: string;
  pinPyramidTitle: string;
  pinPyramidSubtitle: string;
  splitAlert: string;
  knockAllPins: string;
  resetSelection: string;
  gameCompletedTitle: string;
  gameCompletedDesc: string;
  finalScore: string;
  cleanGameBadge: string;
  openFramesCount: string;
  saveGameToHistoryBtn: string;
  nextGameBtn: string;
  matchSavedToast: string;

  // Tournament
  tournamentModalTitle: string;
  tournamentModalSubtitle: string;
  tournamentNameInput: string;
  tournamentDatesRange: string;
  startDateInput: string;
  endDateInput: string;
  venueCenterSelect: string;
  oilPatternSelect: string;
  ballSelect: string;
  laneNumberInput: string;
  startTournamentBtn: string;
  cancelBtn: string;
  tournamentStartedToast: string;

  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  soundSectionTitle: string;
  soundSectionDesc: string;
  soundOn: string;
  soundOff: string;
  testSoundBtn: string;
  themeSectionTitle: string;
  themeSectionDesc: string;
  themeDark: string;
  themeDarkDesc: string;
  themeObsidian: string;
  themeObsidianDesc: string;
  themeRetro: string;
  themeRetroDesc: string;
  themeSlate: string;
  themeSlateDesc: string;
  languageSectionTitle: string;
  languageSectionDesc: string;
  dataSectionTitle: string;
  dataSectionDesc: string;
  exportDataBtn: string;
  importDataBtn: string;
  resetDemoBtn: string;
  settingsSavedToast: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  ru: {
    menuTitle: 'StrikeZone',
    menuSubtitle: 'Персональный трекер боулинга',
    playerProfile: 'Профиль игрока',
    startNewGame: 'Начать новую игру',
    startNewTournament: 'Начать новый турнир',
    settings: 'Настройки',
    currentGame: 'Текущий матч',
    backToGame: 'К игре',
    swipeHint: 'Свайп слева',
    activeTournamentBadge: 'Текущий турнир',
    currentMatchOnLane: 'Дорожка',
    soundEffects: 'Звуковые эффекты',

    profileTitle: 'Профиль боулера',
    profileSubtitle: 'Персональные данные, стиль броска, арсенал и статистика прогресса',
    editProfile: 'Редактировать профиль',
    saveProfile: 'Сохранить изменения',
    cancelEdit: 'Отмена',
    profileSavedToast: 'Профиль игрока успешно обновлён!',
    nameLabel: 'Имя игрока',
    namePlaceholder: 'Введите ваше имя',
    styleLabel: 'Стиль броска / Рука',
    styleDescription: 'Выберите ваш основной стиль хвата и выполнения броска',
    bioLabel: 'Кратко о себе / Клуб',
    bioPlaceholder: 'Клуб, разряд, лига или любимая техника',
    tabStats: 'Статистика и графики',
    tabArsenal: 'Мой арсенал и масло',
    tabProfileInfo: 'Данные профиля',

    styleRight: 'Правша',
    styleLeft: 'Левша',
    styleTwoHandedRight: 'Двурукий правша',
    styleTwoHandedLeft: 'Двурукий левша',
    styleTwoHanded: 'Двурукий игрок',

    gamesPlayed: 'Игр сыграно',
    averageScore: 'Средний счёт',
    highScore: 'Рекорд',
    strikeRate: 'Страйки',
    spareRate: 'Добивание спэаров',
    cleanGames: 'Чистые игры',
    splitsCovered: 'Сплитов закрыто',
    recentGamesChart: 'Динамика счёта последних матчей',
    frameDynamicsChart: 'Средний прогресс по 10 фреймам',
    pinHeatmap: 'Тепловая карта остающихся кеглей',
    pinHeatmapDesc: 'Частота, с которой каждая конкретная кегля остаётся стоять после 1-го броска',
    performanceByBall: 'Эффективность по шарам',
    performanceByPattern: 'Результаты по программам масла',
    performanceByCenter: 'Результаты по боулинг-центрам',
    noGamesYet: 'Пока нет сыгранных матчей',
    noGamesDesc: 'Сыграйте первую партию, чтобы увидеть графики прогресса и подробную аналитику.',

    arsenalTitle: 'Персональное снаряжение',
    arsenalDesc: 'Управление шарами, турнирными кондициями масла и центрами',
    ballsTitle: 'Шары в арсенале',
    oilPatternsTitle: 'Программы масла на соревнования',
    centersTitle: 'Боулинг-центры',
    addBallBtn: 'Добавить шар',
    addPatternBtn: 'Добавить масло',
    addCenterBtn: 'Добавить центр',
    weightLbs: 'Вес',
    coverstock: 'Покрытие',
    primaryStrikeBall: 'Основной страйковый',
    spareBall: 'Спэровый прямой',
    patternLength: 'Длина',
    patternVolume: 'Объём',
    patternRatio: 'Соотношение',
    centerLanes: 'Дорожек',
    centerSurface: 'Покрытие',

    currentRoll: 'Текущий бросок',
    frameLabel: 'Фрейм',
    rollFirst: 'Первый бросок (1/2)',
    rollSecond: 'Второй бросок (добор)',
    standingPinsCount: 'Стоит кеглей',
    confirmThrowBtn: 'Зафиксировать бросок',
    quickFunctions: 'Быстрые функции броска',
    strikeBtn: 'Страйк (10)',
    spareBtn: 'Спэр',
    foulBtn: 'Заступ (Фол)',
    gutterBtn: 'Желоб (0)',
    undoBtn: 'Отменить бросок',
    quickPinsCount: 'Быстрое число кеглей',
    maxPins: 'Макс',
    scoreLabel: 'Счёт',
    maxScoreLabel: 'Макс',
    pinPyramidTitle: 'Интерактивная расстановка кеглей',
    pinPyramidSubtitle: 'Нажмите на сбитые этим броском кегли',
    splitAlert: 'Сплит!',
    knockAllPins: 'Сбить все',
    resetSelection: 'Сбросить выбор',
    gameCompletedTitle: 'Матч турнира завершён!',
    gameCompletedDesc: 'Все 10 фреймов сыграны. Сохраните результат в статистику игрока.',
    finalScore: 'Итоговый счёт',
    cleanGameBadge: 'Clean Game',
    openFramesCount: 'открытых фреймов',
    saveGameToHistoryBtn: 'Сохранить в историю и открыть профиль',
    nextGameBtn: 'Следующая партия',
    matchSavedToast: 'Матч сохранён в историю!',

    tournamentModalTitle: 'Новый турнир',
    tournamentModalSubtitle: 'Настройка параметров соревнования для игрока',
    tournamentNameInput: 'Название соревнования / турнира *',
    tournamentDatesRange: 'Сроки проведения турнира (с какого по какое)',
    startDateInput: 'Дата начала',
    endDateInput: 'Дата окончания',
    venueCenterSelect: 'Место проведения (Боулинг-центр) *',
    oilPatternSelect: 'Программа кондиционирования (Масло) *',
    ballSelect: 'Основной шар для игры',
    laneNumberInput: 'Дорожка №',
    startTournamentBtn: 'Начать турнир',
    cancelBtn: 'Отмена',
    tournamentStartedToast: 'Турнир успешно начат!',

    settingsTitle: 'Настройки приложения',
    settingsSubtitle: 'Управление звуком, темами оформления и языком интерфейса',
    soundSectionTitle: 'Звуковые эффекты',
    soundSectionDesc: 'Звуки падения кеглей, страйков, спэров и желоба во время бросков',
    soundOn: 'Звук включён',
    soundOff: 'Звук выключен',
    testSoundBtn: 'Проверить звук',
    themeSectionTitle: 'Основная тема оформления',
    themeSectionDesc: 'Цветовая палитра интерфейса игрового экрана и панелей',
    themeDark: 'Тёмная классика (Amber)',
    themeDarkDesc: 'Тёплый янтарный акцент на глубоком тёмно-сером фоне боулинг-клуба',
    themeObsidian: 'Обсидиан и Неон',
    themeObsidianDesc: 'Премиальный чёрный фон с неоново-бирюзовыми акцентами',
    themeRetro: 'Ретро Боулинг 80-х',
    themeRetroDesc: 'Винтажный дух золотой эры американского боулинга',
    themeSlate: 'Сланцевое Золото',
    themeSlateDesc: 'Строгий спортивный минимализм графита и матового золота',
    languageSectionTitle: 'Выбор языка (Language)',
    languageSectionDesc: 'Выберите предпочтительный язык интерфейса',
    dataSectionTitle: 'Резервное копирование данных',
    dataSectionDesc: 'Экспорт и импорт сыгранных партий, арсенала и настроек',
    exportDataBtn: 'Экспортировать JSON',
    importDataBtn: 'Импортировать JSON',
    resetDemoBtn: 'Загрузить демо-данные',
    settingsSavedToast: 'Настройки сохранены',
  },

  en: {
    menuTitle: 'StrikeZone',
    menuSubtitle: 'Personal Bowling Tracker',
    playerProfile: 'Player Profile',
    startNewGame: 'Start New Game',
    startNewTournament: 'Start New Tournament',
    settings: 'Settings',
    currentGame: 'Current Game',
    backToGame: 'Back to Game',
    swipeHint: 'Swipe from left',
    activeTournamentBadge: 'Current Tournament',
    currentMatchOnLane: 'Lane',
    soundEffects: 'Sound Effects',

    profileTitle: 'Bowler Profile',
    profileSubtitle: 'Personal info, bowling style, arsenal and progress statistics',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Changes',
    cancelEdit: 'Cancel',
    profileSavedToast: 'Player profile updated successfully!',
    nameLabel: 'Player Name',
    namePlaceholder: 'Enter your name',
    styleLabel: 'Bowling Style / Hand',
    styleDescription: 'Select your primary delivery grip and bowling hand style',
    bioLabel: 'Bio / Club / League',
    bioPlaceholder: 'Club, rating, league or preferred bowling style',
    tabStats: 'Stats & Charts',
    tabArsenal: 'My Arsenal & Oil',
    tabProfileInfo: 'Profile Info',

    styleRight: 'Right-handed',
    styleLeft: 'Left-handed',
    styleTwoHandedRight: 'Two-handed Righty',
    styleTwoHandedLeft: 'Two-handed Lefty',
    styleTwoHanded: 'Two-handed Player',

    gamesPlayed: 'Games Played',
    averageScore: 'Average Score',
    highScore: 'High Score',
    strikeRate: 'Strike Rate',
    spareRate: 'Spare Conversion',
    cleanGames: 'Clean Games',
    splitsCovered: 'Splits Converted',
    recentGamesChart: 'Recent Games Score Trend',
    frameDynamicsChart: 'Average Score Across 10 Frames',
    pinHeatmap: 'Pin Leaves Heatmap',
    pinHeatmapDesc: 'Frequency of specific pins remaining standing after the 1st roll',
    performanceByBall: 'Ball Performance',
    performanceByPattern: 'Oil Pattern Performance',
    performanceByCenter: 'Bowling Center Performance',
    noGamesYet: 'No games played yet',
    noGamesDesc: 'Play your first game to see progress charts and detailed analytics.',

    arsenalTitle: 'Personal Arsenal',
    arsenalDesc: 'Manage bowling balls, tournament oil patterns, and centers',
    ballsTitle: 'Arsenal Balls',
    oilPatternsTitle: 'Tournament Oil Patterns',
    centersTitle: 'Bowling Centers',
    addBallBtn: 'Add Ball',
    addPatternBtn: 'Add Pattern',
    addCenterBtn: 'Add Center',
    weightLbs: 'Weight',
    coverstock: 'Coverstock',
    primaryStrikeBall: 'Primary Strike Ball',
    spareBall: 'Spare Plastic Ball',
    patternLength: 'Length',
    patternVolume: 'Volume',
    patternRatio: 'Ratio',
    centerLanes: 'Lanes',
    centerSurface: 'Surface',

    currentRoll: 'Current Roll',
    frameLabel: 'Frame',
    rollFirst: 'First roll (1/2)',
    rollSecond: 'Second roll (spare pickup)',
    standingPinsCount: 'Standing Pins',
    confirmThrowBtn: 'Confirm Throw',
    quickFunctions: 'Quick Throw Functions',
    strikeBtn: 'Strike (10)',
    spareBtn: 'Spare',
    foulBtn: 'Foul (0)',
    gutterBtn: 'Gutter (0)',
    undoBtn: 'Undo Throw',
    quickPinsCount: 'Quick Pin Count',
    maxPins: 'Max',
    scoreLabel: 'Score',
    maxScoreLabel: 'Max',
    pinPyramidTitle: 'Interactive Pin Deck',
    pinPyramidSubtitle: 'Tap the pins knocked down on this roll',
    splitAlert: 'Split!',
    knockAllPins: 'Knock All',
    resetSelection: 'Reset Selection',
    gameCompletedTitle: 'Tournament Game Finished!',
    gameCompletedDesc: 'All 10 frames played. Save your game to your player profile.',
    finalScore: 'Final Score',
    cleanGameBadge: 'Clean Game',
    openFramesCount: 'open frames',
    saveGameToHistoryBtn: 'Save to History & Open Profile',
    nextGameBtn: 'Next Game',
    matchSavedToast: 'Game saved to history!',

    tournamentModalTitle: 'New Tournament',
    tournamentModalSubtitle: 'Configure competition settings for the player',
    tournamentNameInput: 'Tournament / Event Name *',
    tournamentDatesRange: 'Tournament Dates (From - To)',
    startDateInput: 'Start Date',
    endDateInput: 'End Date',
    venueCenterSelect: 'Venue (Bowling Center) *',
    oilPatternSelect: 'Oil Pattern *',
    ballSelect: 'Primary Ball',
    laneNumberInput: 'Lane #',
    startTournamentBtn: 'Start Tournament',
    cancelBtn: 'Cancel',
    tournamentStartedToast: 'Tournament started successfully!',

    settingsTitle: 'App Settings',
    settingsSubtitle: 'Manage sounds, visual themes, and app language',
    soundSectionTitle: 'Sound Effects',
    soundSectionDesc: 'Audio effects for pin crashes, strikes, spares, and gutters',
    soundOn: 'Sound Enabled',
    soundOff: 'Sound Muted',
    testSoundBtn: 'Test Sound',
    themeSectionTitle: 'Application Theme',
    themeSectionDesc: 'Interface color palette for game deck and controls',
    themeDark: 'Dark Classic (Amber)',
    themeDarkDesc: 'Warm amber glow on deep bowling club charcoal',
    themeObsidian: 'Obsidian & Neon',
    themeObsidianDesc: 'Ultra-deep black with cyan and neon accents',
    themeRetro: 'Retro Bowling 80s',
    themeRetroDesc: 'Vintage golden era aesthetic with warm tones',
    themeSlate: 'Slate & Gold',
    themeSlateDesc: 'Athletic minimalist graphite and matte gold',
    languageSectionTitle: 'Language Selection',
    languageSectionDesc: 'Select your preferred interface language',
    dataSectionTitle: 'Data Management & Backup',
    dataSectionDesc: 'Export and import your played matches, arsenal, and settings',
    exportDataBtn: 'Export JSON',
    importDataBtn: 'Import JSON',
    resetDemoBtn: 'Load Demo Data',
    settingsSavedToast: 'Settings updated',
  },

  de: {
    menuTitle: 'StrikeZone',
    menuSubtitle: 'Persönlicher Bowling-Tracker',
    playerProfile: 'Spielerprofil',
    startNewGame: 'Neues Spiel starten',
    startNewTournament: 'Neues Turnier starten',
    settings: 'Einstellungen',
    currentGame: 'Aktuelles Spiel',
    backToGame: 'Zurück zum Spiel',
    swipeHint: 'Von links wischen',
    activeTournamentBadge: 'Aktuelles Turnier',
    currentMatchOnLane: 'Bahn',
    soundEffects: 'Soundeffekte',

    profileTitle: 'Bowler-Profil',
    profileSubtitle: 'Persönliche Daten, Wurfstil, Arsenal und Fortschrittsstatistiken',
    editProfile: 'Profil bearbeiten',
    saveProfile: 'Änderungen speichern',
    cancelEdit: 'Abbrechen',
    profileSavedToast: 'Spielerprofil erfolgreich aktualisiert!',
    nameLabel: 'Spielername',
    namePlaceholder: 'Geben Sie Ihren Namen ein',
    styleLabel: 'Wurfstil / Hand',
    styleDescription: 'Wählen Sie Ihren Wurfstil und Ihre bevorzugte Hand',
    bioLabel: 'Bio / Verein / Liga',
    bioPlaceholder: 'Verein, Liga oder bevorzugte Spieltechnik',
    tabStats: 'Statistiken & Diagramme',
    tabArsenal: 'Mein Arsenal & Ölmuster',
    tabProfileInfo: 'Profilinfo',

    styleRight: 'Rechtshänder',
    styleLeft: 'Linkshänder',
    styleTwoHandedRight: 'Beidhändig (Rechts)',
    styleTwoHandedLeft: 'Beidhändig (Links)',
    styleTwoHanded: 'Beidhändiger Spieler',

    gamesPlayed: 'Gespielte Spiele',
    averageScore: 'Durchschnitt',
    highScore: 'Rekord',
    strikeRate: 'Strike-Quote',
    spareRate: 'Spare-Quote',
    cleanGames: 'Clean Games',
    splitsCovered: 'Splits geräumt',
    recentGamesChart: 'Punkteverlauf der letzten Spiele',
    frameDynamicsChart: 'Durchschnittliche Punkte pro Frame',
    pinHeatmap: 'Pin-Heatmap',
    pinHeatmapDesc: 'Häufigkeit stehengebliebener Pins nach dem ersten Wurf',
    performanceByBall: 'Leistung nach Bällen',
    performanceByPattern: 'Leistung nach Ölmuster',
    performanceByCenter: 'Leistung nach Bowling-Zentrum',
    noGamesYet: 'Noch keine Spiele gespielt',
    noGamesDesc: 'Spielen Sie Ihr erstes Spiel, um Diagramme und Statistiken zu sehen.',

    arsenalTitle: 'Persönliches Arsenal',
    arsenalDesc: 'Verwalten Sie Bälle, Turniermuster und Zentren',
    ballsTitle: 'Bowlingbälle',
    oilPatternsTitle: 'Ölmuster für Wettbewerbe',
    centersTitle: 'Bowling-Zentren',
    addBallBtn: 'Ball hinzufügen',
    addPatternBtn: 'Muster hinzufügen',
    addCenterBtn: 'Zentrum hinzufügen',
    weightLbs: 'Gewicht',
    coverstock: 'Schale',
    primaryStrikeBall: 'Haupt-Strikeball',
    spareBall: 'Spareball (Plastik)',
    patternLength: 'Länge',
    patternVolume: 'Volumen',
    patternRatio: 'Verhältnis',
    centerLanes: 'Bahnen',
    centerSurface: 'Belag',

    currentRoll: 'Aktueller Wurf',
    frameLabel: 'Frame',
    rollFirst: 'Erster Wurf (1/2)',
    rollSecond: 'Zweiter Wurf (Räumen)',
    standingPinsCount: 'Stehende Pins',
    confirmThrowBtn: 'Wurf bestätigen',
    quickFunctions: 'Schnellfunktionen',
    strikeBtn: 'Strike (10)',
    spareBtn: 'Spare',
    foulBtn: 'Foul (0)',
    gutterBtn: 'Rinne (0)',
    undoBtn: 'Wurf rückgängig',
    quickPinsCount: 'Schnelle Pin-Anzahl',
    maxPins: 'Max',
    scoreLabel: 'Punkte',
    maxScoreLabel: 'Max',
    pinPyramidTitle: 'Interaktives Pindeck',
    pinPyramidSubtitle: 'Tippen Sie auf die gefallenen Pins',
    splitAlert: 'Split!',
    knockAllPins: 'Alle umwerfen',
    resetSelection: 'Auswahl löschen',
    gameCompletedTitle: 'Turnierspiel beendet!',
    gameCompletedDesc: 'Alle 10 Frames gespielt. Speichern Sie Ihr Ergebnis.',
    finalScore: 'Endergebnis',
    cleanGameBadge: 'Clean Game',
    openFramesCount: 'Offene Frames',
    saveGameToHistoryBtn: 'Speichern & Profil öffnen',
    nextGameBtn: 'Nächstes Spiel',
    matchSavedToast: 'Spiel im Verlauf gespeichert!',

    tournamentModalTitle: 'Neues Turnier',
    tournamentModalSubtitle: 'Wettbewerbseinstellungen für den Spieler konfigurieren',
    tournamentNameInput: 'Turniername / Wettbewerb *',
    tournamentDatesRange: 'Turnierzeitraum (Von - Bis)',
    startDateInput: 'Startdatum',
    endDateInput: 'Enddatum',
    venueCenterSelect: 'Austragungsort (Bowling-Zentrum) *',
    oilPatternSelect: 'Ölmuster *',
    ballSelect: 'Hauptball',
    laneNumberInput: 'Bahn Nr.',
    startTournamentBtn: 'Turnier starten',
    cancelBtn: 'Abbrechen',
    tournamentStartedToast: 'Turnier erfolgreich gestartet!',

    settingsTitle: 'Einstellungen',
    settingsSubtitle: 'Sounds, Design und Sprache anpassen',
    soundSectionTitle: 'Soundeffekte',
    soundSectionDesc: 'Audiowiedergabe bei Pin-Treffern, Strikes und Spares',
    soundOn: 'Sound aktiviert',
    soundOff: 'Sound stumm',
    testSoundBtn: 'Sound testen',
    themeSectionTitle: 'Erscheinungsbild / Design',
    themeSectionDesc: 'Farbpalette für das Spieldeck und die Benutzeroberfläche',
    themeDark: 'Dunkel Klassisch (Amber)',
    themeDarkDesc: 'Warme Bernsteinfarben auf tiefem Bowling-Anthrazit',
    themeObsidian: 'Obsidian & Neon',
    themeObsidianDesc: 'Tiefschwarz mit leuchtenden Cyan-Akzenten',
    themeRetro: 'Retro Bowling 80er',
    themeRetroDesc: 'Vintage-Look aus der goldenen Ära',
    themeSlate: 'Schiefer & Gold',
    themeSlateDesc: 'Sportlicher Minimalismus in Grafit und Mattgold',
    languageSectionTitle: 'Sprachauswahl',
    languageSectionDesc: 'Wählen Sie Ihre bevorzugte Sprache',
    dataSectionTitle: 'Datenverwaltung',
    dataSectionDesc: 'Spiele und Einstellungen exportieren oder importieren',
    exportDataBtn: 'JSON exportieren',
    importDataBtn: 'JSON importieren',
    resetDemoBtn: 'Demo-Daten laden',
    settingsSavedToast: 'Einstellungen gespeichert',
  },

  fr: {
    menuTitle: 'StrikeZone',
    menuSubtitle: 'Suivi personnel de bowling',
    playerProfile: 'Profil du joueur',
    startNewGame: 'Nouvelle partie',
    startNewTournament: 'Nouveau tournoi',
    settings: 'Paramètres',
    currentGame: 'Partie en cours',
    backToGame: 'Retour au jeu',
    swipeHint: 'Glisser depuis la gauche',
    activeTournamentBadge: 'Tournoi actuel',
    currentMatchOnLane: 'Piste',
    soundEffects: 'Effets sonores',

    profileTitle: 'Profil du joueur',
    profileSubtitle: 'Informations personnelles, style de lancer, arsenal et statistiques',
    editProfile: 'Modifier le profil',
    saveProfile: 'Enregistrer',
    cancelEdit: 'Annuler',
    profileSavedToast: 'Profil mis à jour avec succès !',
    nameLabel: 'Nom du joueur',
    namePlaceholder: 'Entrez votre nom',
    styleLabel: 'Style de lancer / Main',
    styleDescription: 'Choisissez votre style de tenue et de lancer',
    bioLabel: 'Bio / Club / Ligue',
    bioPlaceholder: 'Club, niveau ou style préféré',
    tabStats: 'Stats & Graphiques',
    tabArsenal: 'Mon Arsenal & Huilage',
    tabProfileInfo: 'Infos du profil',

    styleRight: 'Droitier',
    styleLeft: 'Gaucher',
    styleTwoHandedRight: 'À deux mains (Droitier)',
    styleTwoHandedLeft: 'À deux mains (Gaucher)',
    styleTwoHanded: 'À deux mains',

    gamesPlayed: 'Parties jouées',
    averageScore: 'Moyenne',
    highScore: 'Record',
    strikeRate: 'Taux de strikes',
    spareRate: 'Taux de spares',
    cleanGames: 'Parties propres',
    splitsCovered: 'Splits réussis',
    recentGamesChart: 'Progression des dernières parties',
    frameDynamicsChart: 'Moyenne sur les 10 carreaux',
    pinHeatmap: 'Carte thermique des quilles',
    pinHeatmapDesc: 'Fréquence des quilles restantes après le 1er lancer',
    performanceByBall: 'Performance par boule',
    performanceByPattern: 'Performance par huilage',
    performanceByCenter: 'Performance par bowling',
    noGamesYet: 'Aucune partie enregistrée',
    noGamesDesc: 'Jouez votre première partie pour voir vos statistiques.',

    arsenalTitle: 'Arsenal personnel',
    arsenalDesc: 'Gérez vos boules, profils de huilage et centres de bowling',
    ballsTitle: 'Mes boules',
    oilPatternsTitle: 'Profils de huilage',
    centersTitle: 'Centres de bowling',
    addBallBtn: 'Ajouter une boule',
    addPatternBtn: 'Ajouter un profil',
    addCenterBtn: 'Ajouter un centre',
    weightLbs: 'Poids',
    coverstock: 'Revêtement',
    primaryStrikeBall: 'Boule de strike principale',
    spareBall: 'Boule de spare',
    patternLength: 'Longueur',
    patternVolume: 'Volume',
    patternRatio: 'Ratio',
    centerLanes: 'Pistes',
    centerSurface: 'Surface',

    currentRoll: 'Lancer actuel',
    frameLabel: 'Carreau',
    rollFirst: 'Premier lancer (1/2)',
    rollSecond: 'Second lancer (fermeture)',
    standingPinsCount: 'Quilles debout',
    confirmThrowBtn: 'Confirmer le lancer',
    quickFunctions: 'Actions rapides',
    strikeBtn: 'Strike (10)',
    spareBtn: 'Spare',
    foulBtn: 'Faute (0)',
    gutterBtn: 'Rigole (0)',
    undoBtn: 'Annuler le lancer',
    quickPinsCount: 'Nombre rapide',
    maxPins: 'Max',
    scoreLabel: 'Score',
    maxScoreLabel: 'Max',
    pinPyramidTitle: 'Position des quilles',
    pinPyramidSubtitle: 'Touchez les quilles abattues',
    splitAlert: 'Split !',
    knockAllPins: 'Tout abattre',
    resetSelection: 'Réinitialiser',
    gameCompletedTitle: 'Partie terminée !',
    gameCompletedDesc: 'Les 10 carreaux sont joués. Enregistrez votre résultat.',
    finalScore: 'Score final',
    cleanGameBadge: 'Clean Game',
    openFramesCount: 'carreaux ouverts',
    saveGameToHistoryBtn: 'Enregistrer et ouvrir le profil',
    nextGameBtn: 'Partie suivante',
    matchSavedToast: 'Partie sauvegardée dans l’historique !',

    tournamentModalTitle: 'Nouveau tournoi',
    tournamentModalSubtitle: 'Configuration du tournoi pour le joueur',
    tournamentNameInput: 'Nom du tournoi *',
    tournamentDatesRange: 'Dates du tournoi (Du - Au)',
    startDateInput: 'Date de début',
    endDateInput: 'Date de fin',
    venueCenterSelect: 'Lieu (Centre de bowling) *',
    oilPatternSelect: 'Profil de huilage *',
    ballSelect: 'Boule principale',
    laneNumberInput: 'Piste n°',
    startTournamentBtn: 'Commencer le tournoi',
    cancelBtn: 'Annuler',
    tournamentStartedToast: 'Tournoi commencé avec succès !',

    settingsTitle: 'Paramètres',
    settingsSubtitle: 'Gérez le son, le thème visuel et la langue',
    soundSectionTitle: 'Effets sonores',
    soundSectionDesc: 'Sons d’impact des quilles, strikes, spares et rigoles',
    soundOn: 'Son activé',
    soundOff: 'Son coupé',
    testSoundBtn: 'Tester le son',
    themeSectionTitle: 'Thème visuel',
    themeSectionDesc: 'Palette de couleurs pour l’interface de jeu',
    themeDark: 'Sombre Classique (Ambre)',
    themeDarkDesc: 'Éclat ambré sur fond anthracite style club',
    themeObsidian: 'Obsidienne & Néon',
    themeObsidianDesc: 'Noir profond avec accents cyan néon',
    themeRetro: 'Bowling Rétro Années 80',
    themeRetroDesc: 'Esprit vintage chaleureux des années d’or',
    themeSlate: 'Ardoise & Or',
    themeSlateDesc: 'Minimalisme sportif en graphite et or mat',
    languageSectionTitle: 'Choix de la langue',
    languageSectionDesc: 'Sélectionnez votre langue d’interface',
    dataSectionTitle: 'Sauvegarde des données',
    dataSectionDesc: 'Exporter ou importer vos parties et votre équipement',
    exportDataBtn: 'Exporter JSON',
    importDataBtn: 'Importer JSON',
    resetDemoBtn: 'Charger données démo',
    settingsSavedToast: 'Paramètres enregistrés',
  },

  es: {
    menuTitle: 'StrikeZone',
    menuSubtitle: 'Rastreador personal de bolos',
    playerProfile: 'Perfil del jugador',
    startNewGame: 'Iniciar nuevo juego',
    startNewTournament: 'Iniciar nuevo torneo',
    settings: 'Ajustes',
    currentGame: 'Partida actual',
    backToGame: 'Volver al juego',
    swipeHint: 'Deslizar desde la izquierda',
    activeTournamentBadge: 'Torneo actual',
    currentMatchOnLane: 'Pista',
    soundEffects: 'Efectos de sonido',

    profileTitle: 'Perfil del jugador',
    profileSubtitle: 'Información personal, estilo de tiro, arsenal y estadísticas',
    editProfile: 'Editar perfil',
    saveProfile: 'Guardar cambios',
    cancelEdit: 'Cancelar',
    profileSavedToast: '¡Perfil actualizado con éxito!',
    nameLabel: 'Nombre del jugador',
    namePlaceholder: 'Ingrese su nombre',
    styleLabel: 'Estilo de tiro / Mano',
    styleDescription: 'Seleccione su estilo de agarre y mano preferida',
    bioLabel: 'Biografía / Club / Liga',
    bioPlaceholder: 'Club, liga o técnica preferida',
    tabStats: 'Estadísticas y Gráficos',
    tabArsenal: 'Mi Arsenal y Aceite',
    tabProfileInfo: 'Información del perfil',

    styleRight: 'Diestro',
    styleLeft: 'Zurdo',
    styleTwoHandedRight: 'Dos manos (Diestro)',
    styleTwoHandedLeft: 'Dos manos (Zurdo)',
    styleTwoHanded: 'Jugador a dos manos',

    gamesPlayed: 'Partidas jugadas',
    averageScore: 'Promedio',
    highScore: 'Récord',
    strikeRate: 'Tasa de strikes',
    spareRate: 'Conversión de spares',
    cleanGames: 'Partidas limpias',
    splitsCovered: 'Splits convertidos',
    recentGamesChart: 'Evolución de las últimas partidas',
    frameDynamicsChart: 'Promedio en los 10 cuadros',
    pinHeatmap: 'Mapa de calor de bolos',
    pinHeatmapDesc: 'Frecuencia de bolos restantes tras el primer tiro',
    performanceByBall: 'Rendimiento por bola',
    performanceByPattern: 'Rendimiento por patrón de aceite',
    performanceByCenter: 'Rendimiento por bolera',
    noGamesYet: 'Sin partidas aún',
    noGamesDesc: 'Juega tu primera partida para ver gráficos y estadísticas.',

    arsenalTitle: 'Arsenal personal',
    arsenalDesc: 'Administra tus bolas, patrones de aceite y boleras',
    ballsTitle: 'Bolas en el arsenal',
    oilPatternsTitle: 'Patrones de aceite de torneo',
    centersTitle: 'Boleras',
    addBallBtn: 'Añadir bola',
    addPatternBtn: 'Añadir patrón',
    addCenterBtn: 'Añadir bolera',
    weightLbs: 'Peso',
    coverstock: 'Cubierta',
    primaryStrikeBall: 'Bola de strike principal',
    spareBall: 'Bola de spare plástica',
    patternLength: 'Longitud',
    patternVolume: 'Volumen',
    patternRatio: 'Relación',
    centerLanes: 'Pistas',
    centerSurface: 'Superficie',

    currentRoll: 'Tiro actual',
    frameLabel: 'Cuadro',
    rollFirst: 'Primer tiro (1/2)',
    rollSecond: 'Segundo tiro (spare)',
    standingPinsCount: 'Bolos en pie',
    confirmThrowBtn: 'Confirmar tiro',
    quickFunctions: 'Funciones rápidas',
    strikeBtn: 'Strike (10)',
    spareBtn: 'Spare',
    foulBtn: 'Falta (0)',
    gutterBtn: 'Canaleta (0)',
    undoBtn: 'Deshacer tiro',
    quickPinsCount: 'Conteo rápido',
    maxPins: 'Máx',
    scoreLabel: 'Puntuación',
    maxScoreLabel: 'Máx',
    pinPyramidTitle: 'Pirámide de bolos interactiva',
    pinPyramidSubtitle: 'Toca los bolos derribados en este tiro',
    splitAlert: '¡Split!',
    knockAllPins: 'Derribar todos',
    resetSelection: 'Restablecer',
    gameCompletedTitle: '¡Partida de torneo finalizada!',
    gameCompletedDesc: 'Se han jugado los 10 cuadros. Guarda tu resultado en el perfil.',
    finalScore: 'Puntuación final',
    cleanGameBadge: 'Clean Game',
    openFramesCount: 'cuadros abiertos',
    saveGameToHistoryBtn: 'Guardar en historial y abrir perfil',
    nextGameBtn: 'Siguiente partida',
    matchSavedToast: '¡Partida guardada en el historial!',

    tournamentModalTitle: 'Nuevo Torneo',
    tournamentModalSubtitle: 'Configurar parámetros de competición para el jugador',
    tournamentNameInput: 'Nombre del torneo / evento *',
    tournamentDatesRange: 'Fechas del torneo (De - Hasta)',
    startDateInput: 'Fecha de inicio',
    endDateInput: 'Fecha de finalización',
    venueCenterSelect: 'Lugar (Bolera) *',
    oilPatternSelect: 'Patrón de aceite *',
    ballSelect: 'Bola principal',
    laneNumberInput: 'Pista n.º',
    startTournamentBtn: 'Iniciar torneo',
    cancelBtn: 'Cancelar',
    tournamentStartedToast: '¡Torneo iniciado con éxito!',

    settingsTitle: 'Ajustes',
    settingsSubtitle: 'Controla el sonido, temas visuales e idioma de la aplicación',
    soundSectionTitle: 'Efectos de sonido',
    soundSectionDesc: 'Sonido de impacto de bolos, strikes, spares y canaletas',
    soundOn: 'Sonido activado',
    soundOff: 'Sonido silenciado',
    testSoundBtn: 'Probar sonido',
    themeSectionTitle: 'Tema de la aplicación',
    themeSectionDesc: 'Paleta de colores para la mesa de bolos y controles',
    themeDark: 'Oscuro Clásico (Ámbar)',
    themeDarkDesc: 'Brillo ámbar cálido sobre carbón profundo de club',
    themeObsidian: 'Obsidiana y Neón',
    themeObsidianDesc: 'Negro ultra profundo con acentos cian neón',
    themeRetro: 'Bolera Retro Años 80',
    themeRetroDesc: 'Estética vintage de la era dorada del boliche',
    themeSlate: 'Pizarra y Oro',
    themeSlateDesc: 'Minimalismo deportivo en grafito y oro mate',
    languageSectionTitle: 'Seleccionar idioma',
    languageSectionDesc: 'Elige tu idioma preferido para la interfaz',
    dataSectionTitle: 'Gestión de datos',
    dataSectionDesc: 'Exporta o importa tus partidas y equipamiento',
    exportDataBtn: 'Exportar JSON',
    importDataBtn: 'Importar JSON',
    resetDemoBtn: 'Cargar datos demo',
    settingsSavedToast: 'Ajustes guardados',
  },

  pt: {
    menuTitle: 'StrikeZone',
    menuSubtitle: 'Rastreador pessoal de boliche',
    playerProfile: 'Perfil do jogador',
    startNewGame: 'Iniciar novo jogo',
    startNewTournament: 'Iniciar novo torneio',
    settings: 'Configurações',
    currentGame: 'Jogo atual',
    backToGame: 'Voltar ao jogo',
    swipeHint: 'Deslizar da esquerda',
    activeTournamentBadge: 'Torneio atual',
    currentMatchOnLane: 'Pista',
    soundEffects: 'Efeitos sonoros',

    profileTitle: 'Perfil do Jogador',
    profileSubtitle: 'Dados pessoais, estilo de lançamento, arsenal e estatísticas',
    editProfile: 'Editar perfil',
    saveProfile: 'Salvar alterações',
    cancelEdit: 'Cancelar',
    profileSavedToast: 'Perfil do jogador atualizado com sucesso!',
    nameLabel: 'Nome do jogador',
    namePlaceholder: 'Digite seu nome',
    styleLabel: 'Estilo de arremesso / Mão',
    styleDescription: 'Escolha seu estilo de pegada e mão principal',
    bioLabel: 'Biografia / Clube / Liga',
    bioPlaceholder: 'Clube, liga ou técnica favorita',
    tabStats: 'Estatísticas e Gráficos',
    tabArsenal: 'Meu Arsenal e Óleo',
    tabProfileInfo: 'Informações do perfil',

    styleRight: 'Destro',
    styleLeft: 'Canhoto',
    styleTwoHandedRight: 'Duas mãos (Destro)',
    styleTwoHandedLeft: 'Duas mãos (Canhoto)',
    styleTwoHanded: 'Jogador de duas mãos',

    gamesPlayed: 'Jogos disputados',
    averageScore: 'Média',
    highScore: 'Recorde',
    strikeRate: 'Taxa de strikes',
    spareRate: 'Conversão de spares',
    cleanGames: 'Jogos limpos',
    splitsCovered: 'Splits convertidos',
    recentGamesChart: 'Evolução dos últimos jogos',
    frameDynamicsChart: 'Média ao longo dos 10 frames',
    pinHeatmap: 'Mapa de calor dos pinos',
    pinHeatmapDesc: 'Frequência dos pinos restantes após o primeiro arremesso',
    performanceByBall: 'Desempenho por bola',
    performanceByPattern: 'Desempenho por padrão de óleo',
    performanceByCenter: 'Desempenho por centro de boliche',
    noGamesYet: 'Nenhum jogo disputado ainda',
    noGamesDesc: 'Jogue sua primeira partida para ver gráficos e análises.',

    arsenalTitle: 'Arsenal pessoal',
    arsenalDesc: 'Gerencie bolas, padrões de óleo de torneio e pistas',
    ballsTitle: 'Bolas no arsenal',
    oilPatternsTitle: 'Padrões de óleo para competição',
    centersTitle: 'Centros de boliche',
    addBallBtn: 'Adicionar bola',
    addPatternBtn: 'Adicionar padrão',
    addCenterBtn: 'Adicionar centro',
    weightLbs: 'Peso',
    coverstock: 'Capa',
    primaryStrikeBall: 'Bola principal de strike',
    spareBall: 'Bola de spare de plástico',
    patternLength: 'Comprimento',
    patternVolume: 'Volume',
    patternRatio: 'Proporção',
    centerLanes: 'Pistas',
    centerSurface: 'Superfície',

    currentRoll: 'Arremesso atual',
    frameLabel: 'Frame',
    rollFirst: 'Primeiro arremesso (1/2)',
    rollSecond: 'Segundo arremesso (spare)',
    standingPinsCount: 'Pinos em pé',
    confirmThrowBtn: 'Confirmar arremesso',
    quickFunctions: 'Funções rápidas',
    strikeBtn: 'Strike (10)',
    spareBtn: 'Spare',
    foulBtn: 'Falta (0)',
    gutterBtn: 'Canaleta (0)',
    undoBtn: 'Desfazer arremesso',
    quickPinsCount: 'Contagem rápida',
    maxPins: 'Máx',
    scoreLabel: 'Pontuação',
    maxScoreLabel: 'Máx',
    pinPyramidTitle: 'Posicionamento interativo dos pinos',
    pinPyramidSubtitle: 'Toque nos pinos derrubados neste arremesso',
    splitAlert: 'Split!',
    knockAllPins: 'Derrubar todos',
    resetSelection: 'Redefinir seleção',
    gameCompletedTitle: 'Partida de torneio concluída!',
    gameCompletedDesc: 'Todos os 10 frames foram jogados. Salve seu resultado.',
    finalScore: 'Pontuação final',
    cleanGameBadge: 'Clean Game',
    openFramesCount: 'frames abertos',
    saveGameToHistoryBtn: 'Salvar no histórico e abrir perfil',
    nextGameBtn: 'Próxima partida',
    matchSavedToast: 'Partida salva no histórico!',

    tournamentModalTitle: 'Novo Torneio',
    tournamentModalSubtitle: 'Configurar parâmetros de competição para o jogador',
    tournamentNameInput: 'Nome do torneio / evento *',
    tournamentDatesRange: 'Período do torneio (De - Até)',
    startDateInput: 'Data de início',
    endDateInput: 'Data de término',
    venueCenterSelect: 'Local (Centro de boliche) *',
    oilPatternSelect: 'Padrão de óleo *',
    ballSelect: 'Bola principal',
    laneNumberInput: 'Pista nº',
    startTournamentBtn: 'Iniciar torneio',
    cancelBtn: 'Cancelar',
    tournamentStartedToast: 'Torneio iniciado com sucesso!',

    settingsTitle: 'Configurações',
    settingsSubtitle: 'Gerencie som, temas visuais e idioma do aplicativo',
    soundSectionTitle: 'Efeitos sonoros',
    soundSectionDesc: 'Sons de queda de pinos, strikes, spares e canaletas',
    soundOn: 'Som ativado',
    soundOff: 'Som mudo',
    testSoundBtn: 'Testar som',
    themeSectionTitle: 'Tema visual do aplicativo',
    themeSectionDesc: 'Paleta de cores para o painel de pinos e controles',
    themeDark: 'Escuro Clássico (Âmbar)',
    themeDarkDesc: 'Brilho âmbar acolhedor sobre cinza escuro de boliche',
    themeObsidian: 'Obsidiana e Neon',
    themeObsidianDesc: 'Preto ultra profundo com destaques ciano neon',
    themeRetro: 'Boliche Retrô Anos 80',
    themeRetroDesc: 'Estética vintage da era de ouro do boliche',
    themeSlate: 'Ardósia e Ouro',
    themeSlateDesc: 'Minimalismo esportivo em grafite e ouro fosco',
    languageSectionTitle: 'Seleção de idioma',
    languageSectionDesc: 'Escolha seu idioma de preferência para a interface',
    dataSectionTitle: 'Gerenciamento de dados',
    dataSectionDesc: 'Exporte ou importe partidas disputadas e arsenal',
    exportDataBtn: 'Exportar JSON',
    importDataBtn: 'Importar JSON',
    resetDemoBtn: 'Carregar dados demo',
    settingsSavedToast: 'Configurações salvas',
  },
};

export function getTranslation(lang: AppLanguage = 'ru'): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.ru;
}

export function formatBowlerStyle(style: BowlerStyle, lang: AppLanguage = 'ru'): string {
  const t = getTranslation(lang);
  switch (style) {
    case 'Правша':
      return t.styleRight;
    case 'Левша':
      return t.styleLeft;
    case 'Двурукий правша':
      return t.styleTwoHandedRight;
    case 'Двурукий левша':
      return t.styleTwoHandedLeft;
    case 'Двурукий игрок':
    default:
      return t.styleTwoHanded;
  }
}
