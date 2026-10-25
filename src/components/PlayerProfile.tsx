import React, { useState, useRef } from 'react';
import {
  UserPersonalConfig,
  BowlerStyle,
  MatchRecord,
  AppLanguage,
  SavedTournament,
} from '../types/bowling';
import { getTranslation, formatBowlerStyle } from '../utils/i18n';
import { ProfileStats } from './ProfileStats';
import { ArsenalManager } from './ArsenalManager';
import { OilPatternsManager } from './OilPatternsManager';
import { CentersManager } from './CentersManager';
import {
  User,
  Edit3,
  Check,
  X,
  TrendingUp,
  CircleDot,
  Trophy,
  Target,
  Flame,
  Award,
  Droplets,
  Building2,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface PlayerProfileProps {
  userConfig: UserPersonalConfig;
  onUpdateConfig: (newConfig: UserPersonalConfig) => void;
  matches: MatchRecord[];
  savedTournaments?: SavedTournament[];
  language?: AppLanguage;
  onNotification?: (msg: string) => void;
  initialSubTab?: 'stats' | 'arsenal' | 'centers' | 'patterns';
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({
  userConfig,
  onUpdateConfig,
  matches,
  savedTournaments = [],
  language = 'ru',
  onNotification,
  initialSubTab,
}) => {
  const t = getTranslation(language);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sub-tabs within player profile: Stats, Arsenal, Centers, or Oil Patterns
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'arsenal' | 'centers' | 'patterns'>(
    initialSubTab || 'stats'
  );

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Profile editing form state
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userConfig.name);
  const [tempStyle, setTempStyle] = useState<BowlerStyle>(userConfig.style || 'Правша');
  const [tempBio, setTempBio] = useState(userConfig.bio || '');
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | undefined>(userConfig.avatarUrl);

  const handleAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      if (onNotification) onNotification('Пожалуйста, выберите файл изображения (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (!raw) return;

      const img = new Image();
      img.onload = () => {
        // Crop & resize to square 512x512
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        const targetSize = Math.min(size, 512);
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetSize, targetSize);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setTempAvatarUrl(compressed);
          onUpdateConfig({
            ...userConfig,
            avatarUrl: compressed,
          });
          if (onNotification) onNotification('Фотография профиля успешно прикреплена!');
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setTempAvatarUrl(undefined);
    onUpdateConfig({
      ...userConfig,
      avatarUrl: undefined,
    });
    if (onNotification) onNotification('Фотография профиля удалена');
  };

  // Calculate quick summary stats
  const totalGames = matches.length;
  const scores = matches.map((m) => m.players[0]?.totalScore || 0).filter((s) => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highScore = scores.length > 0 ? Math.max(...scores) : 0;

  const styleOptions: {
    value: BowlerStyle;
    title: string;
    description: string;
    icon: string;
    tag: string;
  }[] = [
    {
      value: 'Правша',
      title: t.styleRight,
      description: 'Классический бросок правой рукой с использованием упора для большого пальца',
      icon: '👉',
      tag: '1-Hand R',
    },
    {
      value: 'Левша',
      title: t.styleLeft,
      description: 'Классический бросок левой рукой по левой траектории дорожки',
      icon: '👈',
      tag: '1-Hand L',
    },
    {
      value: 'Двурукий правша',
      title: t.styleTwoHandedRight,
      description: 'Современный двуручный бросок (Two-Hander), правая рука доминирует, высокий rev-rate',
      icon: '👐',
      tag: '2-Hand R',
    },
    {
      value: 'Двурукий левша',
      title: t.styleTwoHandedLeft,
      description: 'Современный двуручный бросок (Two-Hander), левая рука доминирует, мощное вращение',
      icon: '👐',
      tag: '2-Hand L',
    },
    {
      value: 'Двурукий игрок',
      title: t.styleTwoHanded,
      description: 'Симметричный двуручный хват без отверстия под большой палец',
      icon: '⚡',
      tag: '2-Hand',
    },
  ];

  const handleStartEdit = () => {
    setTempName(userConfig.name);
    setTempStyle(userConfig.style || 'Правша');
    setTempBio(userConfig.bio || '');
    setTempAvatarUrl(userConfig.avatarUrl);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserPersonalConfig = {
      ...userConfig,
      name: tempName.trim() || 'Игрок',
      style: tempStyle,
      hand: tempStyle.includes('Левша') ? 'Левша' : 'Правша',
      bio: tempBio.trim(),
      avatarUrl: tempAvatarUrl,
    };
    onUpdateConfig(updated);
    setIsEditing(false);
    if (onNotification) {
      onNotification(t.profileSavedToast);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Main Bowler Profile Header Card */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar Badge with Click-to-Upload */}
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarFile(file);
                  e.target.value = '';
                }}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-stone-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-amber-500/20 border-2 border-amber-300/40 overflow-hidden cursor-pointer relative"
                title="Нажмите, чтобы прикрепить или изменить фотографию профиля"
              >
                {userConfig.avatarUrl ? (
                  <img
                    src={userConfig.avatarUrl}
                    alt={userConfig.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userConfig.name ? userConfig.name.charAt(0).toUpperCase() : 'B'}</span>
                )}
                {/* Camera hover badge */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-tight">Фото</span>
                </div>
              </div>

              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-stone-950 border border-stone-700 text-[10px] font-bold text-amber-400 pointer-events-none">
                PRO
              </div>
            </div>

            {/* Name and bio */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display tracking-tight">
                {userConfig.name}
              </h1>

              <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-xl">
                {userConfig.bio || 'Персональный профиль боулера · Личный арсенал и детальная статистика партий'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 mt-2.5">
                <span className="flex items-center gap-1 text-stone-300">
                  <CircleDot className="w-3.5 h-3.5 text-amber-400" />
                  <strong>{userConfig.balls.length}</strong> шаров в арсенале
                </span>
                <span className="text-stone-600">·</span>
                <span className="flex items-center gap-1 text-stone-300">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <strong>{userConfig.oilPatterns.length}</strong> программ масла
                </span>
                <span className="text-stone-600">·</span>
                <span className="flex items-center gap-1 text-stone-300">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>{userConfig.centers.length}</strong> центров
                </span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <div className="shrink-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700/80 transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 shadow-md"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>{t.editProfile}</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-800/80">
          <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium block">
              {t.gamesPlayed}
            </span>
            <div className="text-2xl font-black font-mono text-stone-100 mt-0.5">
              {totalGames}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium block">
              {t.averageScore}
            </span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
              {avgScore}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium block">
              {t.highScore}
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {highScore}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium block">
              Стиль
            </span>
            <div className="text-sm font-bold text-cyan-300 mt-1 truncate" title={formatBowlerStyle(userConfig.style || 'Правша', language)}>
              {formatBowlerStyle(userConfig.style || 'Правша', language)}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Inline Edit Profile Form (When opened) */}
        {/* ========================================================================= */}
        {isEditing && (
          <form
            onSubmit={handleSaveEdit}
            className="mt-6 pt-6 border-t border-stone-800 space-y-5 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Настройка параметров игрока</span>
              </h3>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.cancelEdit}</span>
              </button>
            </div>

            {/* Avatar photo management block */}
            <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 overflow-hidden flex items-center justify-center shrink-0">
                  {tempAvatarUrl ? (
                    <img src={tempAvatarUrl} alt="Аватар" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-stone-400" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-200 block">
                    Фотография профиля
                  </span>
                  <span className="text-[11px] text-stone-400 block">
                    {tempAvatarUrl ? 'Фото загружено и отображается в профиле' : 'Вы можете прикрепить снимок или аватар'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{tempAvatarUrl ? 'Заменить фото' : 'Прикрепить фото'}</span>
                </button>
                {tempAvatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Удалить фото"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                  {t.nameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Bio / Club */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                  {t.bioLabel}
                </label>
                <input
                  type="text"
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  placeholder={t.bioPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Bowling Style & Hand Options */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                {t.styleLabel} *
              </label>
              <p className="text-xs text-stone-400 mb-3">
                {t.styleDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {styleOptions.map((opt) => {
                  const isSelected = tempStyle === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTempStyle(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                          : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                          <span>{opt.icon}</span>
                          <span>{opt.title}</span>
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {opt.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-snug">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-400 hover:text-stone-200 transition-colors"
              >
                {t.cancelEdit}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t.saveProfile}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. Sub-Navigation Tabs: Statistics / My Arsenal / My Centers / My Oil Patterns */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-900/90 border border-stone-800/80 max-w-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'stats'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Статистика</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('arsenal')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'arsenal'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>Мой арсенал ({userConfig.balls.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('centers')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'centers'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Мои боулинг-центры ({userConfig.centers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('patterns')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'patterns'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Мои программы масла ({userConfig.oilPatterns.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. Sub-Tab Content */}
      {/* ========================================================================= */}
      {activeSubTab === 'stats' && (
        <div className="animate-in fade-in duration-150">
          <ProfileStats
            matches={matches}
            userConfig={userConfig}
            savedTournaments={savedTournaments}
          />
        </div>
      )}

      {activeSubTab === 'arsenal' && (
        <div className="animate-in fade-in duration-150">
          <ArsenalManager
            userConfig={userConfig}
            onUpdateConfig={onUpdateConfig}
            onNotification={onNotification}
          />
        </div>
      )}

      {activeSubTab === 'centers' && (
        <div className="animate-in fade-in duration-150">
          <CentersManager
            userConfig={userConfig}
            onUpdateConfig={onUpdateConfig}
            onNotification={onNotification}
          />
        </div>
      )}

      {activeSubTab === 'patterns' && (
        <div className="animate-in fade-in duration-150">
          <OilPatternsManager
            userConfig={userConfig}
            onUpdateConfig={onUpdateConfig}
            onNotification={onNotification}
          />
        </div>
      )}
    </div>
  );
};
