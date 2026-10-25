import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  Check,
  X,
  Sparkles,
  Flame,
  Layers,
  Target,
  Trophy,
  Sliders,
  FileText,
} from 'lucide-react';
import { BowlingNote, UserPersonalConfig } from '../types/bowling';
import {
  loadSavedNotes,
  saveNotes,
  addOrUpdateNote,
  deleteNote,
} from '../utils/storage';

interface BowlingNotesProps {
  userConfig: UserPersonalConfig;
  onNotification?: (msg: string) => void;
}

const CATEGORIES: Array<BowlingNote['category']> = [
  'Тренировка',
  'Турнир',
  'Техника и хват',
  'Шары и арсенал',
  'Паттерн масла',
  'Общее',
];

const TEMPLATES = [
  {
    name: '🎯 План тренировки',
    category: 'Тренировка' as const,
    title: 'Тренировка: Точность первой кегли и угловые спэары',
    content: `Цели на тренировку:
1. Стабильность точки сброса (release point)
2. Отработка 10-й кегли (серия из 20 бросков)
3. Скорость шара: поддерживать 26.5 – 27.5 км/ч

Результаты и выводы:
• Первые 30 мин: отличный тайминг
• 10-я кегля: 17 из 20 (85%)
• Замечено: при усталости плечо уходит вперёд`,
  },
  {
    name: '🏆 Анализ турнира',
    category: 'Турнир' as const,
    title: 'Отчёт по турнирной серии (6 игр)',
    content: `Турнир: 
Боулинг-центр: 
Программа масла: 

Игры и счета:
Игра 1:  | Шар: 
Игра 2:  | Шар: 
Игра 3:  | Шар: 

Что сработало:
• 

Что исправить к следующему этапу:
• `,
  },
  {
    name: '🎳 Поведение шара на масле',
    category: 'Шары и арсенал' as const,
    title: 'Реакция арсенала на переходе диаграммы масла',
    content: `Тестируемый шар: 
Поверхность: 

Наблюдения по брейкпоинту:
• На свежем масле (игры 1–2):
• На переходном масле (игры 3–4):
• На выбитом брейке (игры 5+):

Рекомендация по смене линии или шара:
• `,
  },
  {
    name: '⚡ Чек-лист техники',
    category: 'Техника и хват' as const,
    title: 'Ключевые точки фокуса перед броском',
    content: `1. Исходная стойка: вес на пятках, шар на уровне груди
2. Первый шаг: короткий, мягкий пуш шара
3. Высшая точка маха: свободная гравитация без рывка
4. Слайд: колено согнуто, корпус наклонен на 20°
5. Фиксация: удерживать позу до касания кеглей!`,
  },
];

export const BowlingNotes: React.FC<BowlingNotesProps> = ({
  userConfig,
  onNotification,
}) => {
  const [notes, setNotes] = useState<BowlingNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<BowlingNote['category']>('Тренировка');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formTags, setFormTags] = useState('');

  // Load saved notes on mount
  useEffect(() => {
    const loaded = loadSavedNotes();
    setNotes(loaded);
  }, []);

  // Handle open editor for new note
  const handleStartNewNote = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormCategory('Тренировка');
    setFormContent('');
    setFormIsPinned(false);
    setFormTags('');
    setIsEditorOpen(true);
  };

  // Handle open editor for existing note
  const handleEditNote = (note: BowlingNote) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormContent(note.content);
    setFormIsPinned(!!note.isPinned);
    setFormTags(note.tags ? note.tags.join(', ') : '');
    setIsEditorOpen(true);
  };

  // Apply template
  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setFormTitle(tpl.title);
    setFormCategory(tpl.category);
    setFormContent(tpl.content);
  };

  // Save Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const noteToSave: BowlingNote = {
      id: editingNoteId || 'note_' + Date.now(),
      title: formTitle.trim(),
      category: formCategory,
      content: formContent.trim(),
      isPinned: formIsPinned,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      createdAt: editingNoteId
        ? notes.find((n) => n.id === editingNoteId)?.createdAt || Date.now()
        : Date.now(),
      updatedAt: Date.now(),
    };

    const updated = addOrUpdateNote(noteToSave);
    setNotes(updated);
    setIsEditorOpen(false);
    if (onNotification) {
      onNotification(editingNoteId ? 'Заметка обновлена' : 'Заметка сохранена');
    }
  };

  // Delete Note
  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    if (window.confirm(`Удалить заметку «${noteTitle}»?`)) {
      const updated = deleteNote(noteId);
      setNotes(updated);
      if (onNotification) onNotification('Заметка удалена');
    }
  };

  // Toggle Pin
  const handleTogglePin = (note: BowlingNote) => {
    const updatedNote = { ...note, isPinned: !note.isPinned };
    const updated = addOrUpdateNote(updatedNote);
    setNotes(updated);
    if (onNotification) {
      onNotification(updatedNote.isPinned ? 'Заметка закреплена' : 'Заметка откреплена');
    }
  };

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    let list = [...notes];

    if (selectedCategory !== 'Все') {
      list = list.filter((n) => n.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort: Pinned first, then newest updatedAt first
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

    return list;
  }, [notes, selectedCategory, searchQuery]);

  const getCategoryColor = (cat: BowlingNote['category']) => {
    switch (cat) {
      case 'Тренировка':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Турнир':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Техника и хват':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Шары и арсенал':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Паттерн масла':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-100 font-display tracking-tight flex items-center gap-2">
                <span>Заметки боулера</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400">
                  {notes.length}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Персональный дневник тренировок, турнирных наблюдений, техники и поведения шаров
              </p>
            </div>
          </div>
        </div>

        {/* Start New Note Button */}
        <button
          type="button"
          onClick={handleStartNewNote}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Новая заметка</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Все', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по заметкам и тегам..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-2xl bg-stone-900/50 border border-stone-800 p-8 sm:p-12 text-center text-stone-400 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-500">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-stone-200">
              {notes.length === 0 ? 'У вас пока нет сохранённых заметок' : 'Ничего не найдено'}
            </h4>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              {notes.length === 0
                ? 'Записывайте выводы после тренировок, переходы по доскам на турнирах, настройки хвата и поведение шаров.'
                : 'Попробуйте изменить поисковый запрос или выбрать другую категорию.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartNewNote}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            + Начать новую заметку
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`rounded-2xl bg-stone-900/90 border p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all shadow-lg group hover:border-amber-500/40 ${
                note.isPinned ? 'border-amber-500/50 bg-stone-900/95 ring-1 ring-amber-500/20' : 'border-stone-800'
              }`}
            >
              <div className="space-y-2.5">
                {/* Note Header: Category + Pinned + Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(
                        note.category
                      )}`}
                    >
                      {note.category}
                    </span>
                    {note.isPinned && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        <span>Закреплено</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(note)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        note.isPinned
                          ? 'text-amber-400 hover:text-amber-300 hover:bg-stone-800'
                          : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'
                      }`}
                      title={note.isPinned ? 'Открепить заметку' : 'Закрепить наверху'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                      title="Редактировать"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Title */}
                <h3 className="font-extrabold text-stone-100 text-base leading-tight font-display group-hover:text-amber-300 transition-colors">
                  {note.title}
                </h3>

                {/* Note Content */}
                <p className="text-xs text-stone-300 whitespace-pre-line line-clamp-5 leading-relaxed">
                  {note.content}
                </p>
              </div>

              {/* Note Footer: Tags & Date */}
              <div className="pt-2.5 border-t border-stone-800/80 space-y-2 text-[11px] text-stone-500">
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.2 rounded text-[10px] bg-stone-950 text-stone-400 border border-stone-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-500" />
                    <span>{formatDate(note.updatedAt)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEditNote(note)}
                    className="text-amber-400/90 hover:text-amber-300 font-semibold"
                  >
                    Открыть →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE / EDIT NOTE */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100 font-display">
                    {editingNoteId ? 'Редактировать заметку' : 'Новая заметка боулера'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Зафиксируйте наблюдения, корректировки или план игры
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates */}
            {!editingNoteId && (
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Быстрые шаблоны заметок:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => handleApplyTemplate(t)}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-[11px] text-stone-300 hover:text-amber-300 font-medium text-left truncate transition-all"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                    Заголовок заметки *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Например: План на длинную диаграмму масла..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                    Категория:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BowlingNote['category'])}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:border-amber-500 focus:outline-none font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content textarea */}
              <div>
                <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                  Текст заметки / наблюдения:
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Опишите ваши мысли, поведение дорожки, скорость и траекторию шара..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 text-xs leading-relaxed focus:border-amber-500 focus:outline-none font-sans"
                />
              </div>

              {/* Tags & Pin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block uppercase text-[10px] text-stone-400 mb-1 font-semibold">
                    Теги (через запятую):
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Масло, Шаги, Phaze II, Турнир"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 sm:pt-4">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-stone-900 border-stone-700"
                    />
                    <span className="text-stone-200 font-semibold flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Закрепить заметку вверху списка</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-stone-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingNoteId ? 'Сохранить изменения' : 'Сохранить заметку'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
