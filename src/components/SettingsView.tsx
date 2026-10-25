import React from 'react';
import { AppSettings, AppLanguage, AppTheme } from '../types/bowling';
import { getTranslation } from '../utils/i18n';
import { playPinCrashSound } from '../utils/audio';
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
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onResetDemo: () => void;
  onNotification?: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetDemo,
  onNotification,
}) => {
  const t = getTranslation(settings.language);

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
      name: t.themeDark,
      desc: t.themeDarkDesc,
      primaryColor: '#f59e0b',
      accentColor: '#fbbf24',
      bgColor: '#0c0a09',
    },
    {
      id: 'obsidian',
      name: t.themeObsidian,
      desc: t.themeObsidianDesc,
      primaryColor: '#06b6d4',
      accentColor: '#22d3ee',
      bgColor: '#050505',
    },
    {
      id: 'retro',
      name: t.themeRetro,
      desc: t.themeRetroDesc,
      primaryColor: '#ef4444',
      accentColor: '#f97316',
      bgColor: '#171210',
    },
    {
      id: 'slate',
      name: t.themeSlate,
      desc: t.themeSlateDesc,
      primaryColor: '#eab308',
      accentColor: '#ca8a04',
      bgColor: '#0f172a',
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
              accept=".json"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onResetDemo}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors flex items-center gap-2 border border-stone-800 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDemoBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
