import React, { useState } from 'react';
import { AppSettings, AppLanguage, AppTheme } from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { playPinCrashSound } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Volume2,
  VolumeX,
  Palette,
  Globe,
  Database,
  Check,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Share2,
  X,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onClearData: () => void;
  onNotification?: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearData,
  onNotification,
}) => {
  const t = getTranslation(settings.language);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted && onNotification) {
        onNotification('StrikeZone успешно установлено на устройство!');
      }
    } else {
      // Show iOS / browser guidance modal
      setShowIOSModal(true);
    }
  };

  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextSound };
    onUpdateSettings(updated);
    if (nextSound) {
      playPinCrashSound(1.0);
    }
    if (onNotification) {
      onNotification(nextSound ? t.soundOn : t.soundOff);
    }
  };

  const handleTestSound = () => {
    playPinCrashSound(1.2);
  };

  const handleSelectTheme = (theme: AppTheme) => {
    const updated = { ...settings, theme };
    onUpdateSettings(updated);
    if (onNotification) {
      onNotification(t.settingsSavedToast);
    }
  };

  const handleSelectLanguage = (lang: AppLanguage) => {
    const updated = { ...settings, language: lang };
    onUpdateSettings(updated);
    if (onNotification) {
      onNotification(getTranslation(lang).settingsSavedToast);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const languagesList: {
    code: AppLanguage;
    name: string;
    nativeName: string;
    flag: string;
  }[] = [
    { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇵🇹' },
  ];

  const themesList: {
    id: AppTheme;
    name: string;
    desc: string;
    primaryColor: string;
    accentColor: string;
    bgColor: string;
  }[] = [
    {
      id: 'dark',
      name: 'Тёмная Классическая',
      desc: 'Глубокий мягкий угольный фон, контрастный янтарный акцент и максимальная читаемость текста.',
      primaryColor: '#f59e0b',
      accentColor: '#fbbf24',
      bgColor: '#0c0a09',
    },
    {
      id: 'light',
      name: 'Светлая Чистая',
      desc: 'Чистый светлый фон без бликов, высокая контрастность и четкий тёмный шрифт для отличной видимости.',
      primaryColor: '#d97706',
      accentColor: '#b45309',
      bgColor: '#f5f5f4',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display tracking-tight">
          {t.settingsTitle}
        </h2>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          {t.settingsSubtitle}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. SOUND TOGGLE & AUDIO PREVIEW */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-stone-500" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                {t.soundSectionTitle}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {t.soundSectionDesc}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.soundEnabled ? 'bg-amber-500' : 'bg-stone-800'
            }`}
            aria-label="Переключить звук"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-stone-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800/80">
          <span className="text-xs text-stone-400">
            Текущий статус:{' '}
            <strong
              className={`font-semibold ${
                settings.soundEnabled ? 'text-amber-400' : 'text-stone-500'
              }`}
            >
              {settings.soundEnabled ? t.soundOn : t.soundOff}
            </strong>
          </span>

          <button
            type="button"
            onClick={handleTestSound}
            className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95 border border-stone-700"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.testSoundBtn}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. APP THEME (VISUAL STYLING SELECTION) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Palette className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100">
              {t.themeSectionTitle}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {t.themeSectionDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {themesList.map((thm) => {
            const isSelected = settings.theme === thm.id;
            return (
              <button
                key={thm.id}
                type="button"
                onClick={() => handleSelectTheme(thm.id)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-stone-600 shadow-sm"
                      style={{ backgroundColor: thm.primaryColor }}
                    />
                    <span className="text-sm font-bold text-stone-100">
                      {thm.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-400 leading-snug">
                  {thm.desc}
                </p>

                {/* Color swatches preview strip */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-stone-800/80">
                  <div
                    className="w-8 h-2.5 rounded-sm"
                    style={{ backgroundColor: thm.bgColor }}
                  />
                  <div
                    className="w-8 h-2.5 rounded-sm"
                    style={{ backgroundColor: thm.primaryColor }}
                  />
                  <div
                    className="w-8 h-2.5 rounded-sm"
                    style={{ backgroundColor: thm.accentColor }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LANGUAGE SELECTION (RU, EN, DE, FR, ES, PT) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100">
              {t.languageSectionTitle}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {t.languageSectionDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          {languagesList.map((lang) => {
            const isSelected = settings.language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-bold text-stone-100">
                      {lang.nativeName}
                    </div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">
                      {lang.code.toUpperCase()}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DATA BACKUP & RESTORE */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100">
              {t.dataSectionTitle}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {t.dataSectionDesc}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onExportData}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center gap-2 border border-stone-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t.exportDataBtn}</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center gap-2 border border-stone-700 cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>{t.importDataBtn}</span>
            <input
              type="file"
              accept=".json,application/json,text/plain,*/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onClearData}
            title="Очистить все сохранённые матчи и данные"
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-red-950/40 text-stone-400 hover:text-red-400 text-xs font-semibold transition-colors flex items-center gap-2 border border-stone-800 hover:border-red-800/60 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearDataBtn}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PWA APPLICATION INSTALLATION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isInstalled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Установка приложения (PWA)
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {isInstalled
                  ? 'Приложение установлено и работает в автономном режиме'
                  : 'Добавьте иконку StrikeZone на рабочий стол вашего смартфона или ПК'}
              </p>
            </div>
          </div>

          {isInstalled ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Приложение установлено</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-stone-950" />
              <span>Установить приложение</span>
            </button>
          )}
        </div>

        {isInstalled ? (
          <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/80 text-xs text-stone-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              StrikeZone запущено как отдельное PWA-приложение. Работает автономно и сохраняет все результаты на устройстве.
            </span>
          </div>
        ) : (
          <p className="text-xs text-stone-400">
            После установки вы сможете запускать StrikeZone прямо с рабочего стола без браузерных рамок, с моментальной загрузкой и сохранением всех данных локально на устройстве.
          </p>
        )}
      </div>

      {/* iOS / Browser Guided Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl relative text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">
                    Установка на {isIOS ? 'iPhone / iPad' : 'устройство'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Быстрое добавление иконки на экран «Домой»
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  {isIOS ? (
                    <span>
                      Нажмите кнопку <strong className="text-amber-400">«Поделиться»</strong>{' '}
                      <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-stone-300" /> (значок со стрелкой вверх внизу или вверху экрана Safari).
                    </span>
                  ) : (
                    <span>
                      В меню браузера (кнопка <strong className="text-amber-400">⋮</strong>) выберите <strong className="text-amber-400">«Установить приложение»</strong> или <strong className="text-amber-400">«Добавить на главный экран»</strong>.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  {isIOS ? (
                    <span>
                      В открывшемся меню прокрутите вниз и выберите <strong className="text-amber-400">«На экран "Домой"»</strong> (Add to Home Screen).
                    </span>
                  ) : (
                    <span>
                      Подтвердите установку в появившемся окне браузера.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span>
                    Нажмите <strong className="text-emerald-400">«Добавить»</strong>. Иконка <strong className="text-white">StrikeZone</strong> появится на рабочем столе!
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
