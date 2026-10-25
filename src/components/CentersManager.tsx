import React, { useState } from 'react';
import { BowlingCenter, UserPersonalConfig } from '../types/bowling';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Sparkles,
  X,
  Check,
} from 'lucide-react';

interface CentersManagerProps {
  userConfig: UserPersonalConfig;
  onUpdateConfig: (newConfig: UserPersonalConfig) => void;
  onNotification?: (msg: string) => void;
}

export const CentersManager: React.FC<CentersManagerProps> = ({
  userConfig,
  onUpdateConfig,
  onNotification,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<BowlingCenter | null>(null);

  const [form, setForm] = useState<{
    name: string;
    city: string;
    address: string;
    lanesCount: number;
    surface: BowlingCenter['surface'];
  }>({
    name: '',
    city: 'Москва',
    address: '',
    lanesCount: 16,
    surface: 'Синтетика (Synthetic)',
  });

  const centers = userConfig.centers || [];

  const handleOpenAdd = () => {
    setEditingCenter(null);
    setForm({
      name: '',
      city: 'Москва',
      address: '',
      lanesCount: 16,
      surface: 'Синтетика (Synthetic)',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (center: BowlingCenter) => {
    setEditingCenter(center);
    setForm({
      name: center.name,
      city: center.city || '',
      address: center.address || '',
      lanesCount: center.lanesCount || 16,
      surface: center.surface || 'Синтетика (Synthetic)',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    let updated: BowlingCenter[];
    if (editingCenter) {
      updated = centers.map((c) =>
        c.id === editingCenter.id
          ? {
              ...c,
              name: form.name.trim(),
              city: form.city.trim() || undefined,
              address: form.address.trim() || undefined,
              lanesCount: form.lanesCount > 0 ? form.lanesCount : undefined,
              surface: form.surface,
            }
          : c
      );
      if (onNotification) onNotification(`Боулинг-центр «${form.name.trim()}» обновлён`);
    } else {
      const newCenter: BowlingCenter = {
        id: `center_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: form.name.trim(),
        city: form.city.trim() || undefined,
        address: form.address.trim() || undefined,
        lanesCount: form.lanesCount > 0 ? form.lanesCount : undefined,
        surface: form.surface,
      };
      updated = [...centers, newCenter];
      if (onNotification) onNotification(`Боулинг-центр «${form.name.trim()}» добавлен`);
    }

    onUpdateConfig({
      ...userConfig,
      centers: updated,
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (centers.length <= 1) {
      if (onNotification) onNotification('В списке должен оставаться хотя бы один боулинг-центр');
      return;
    }
    const updated = centers.filter((c) => c.id !== id);
    onUpdateConfig({
      ...userConfig,
      centers: updated,
    });
    if (onNotification) onNotification(`Центр «${name}» удалён`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-extrabold text-stone-100 font-display flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>Боулинг-центры и клубы</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Список клубов для тренировок и турниров с указанием количества дорожек и типа покрытия
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить боулинг-центр</span>
        </button>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centers.map((center) => (
          <div
            key={center.id}
            className="rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 p-5 space-y-4 transition-all shadow-md relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-stone-100 text-base leading-snug truncate">
                      {center.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="truncate">
                        {center.city || 'Город не указан'}
                        {center.address ? ` · ${center.address}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(center)}
                    className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                    title="Редактировать центр"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(center.id, center.name)}
                    className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Удалить центр"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom info stats */}
            <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400">Всего дорожек:</span>
                <span className="font-mono font-bold text-amber-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                  {center.lanesCount || '—'}
                </span>
              </div>

              <span className="text-[11px] font-medium text-stone-300">
                {center.surface || 'Синтетика'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{editingCenter ? 'Редактирование боулинг-центра' : 'Добавить боулинг-центр'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Название центра / клуба *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например: Боулинг-центр «Галактика»"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-semibold text-stone-400 mb-1">
                    Город
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Москва, СПб..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block uppercase font-semibold text-stone-300">
                      Общее количество дорожек *
                    </label>
                    <span className="text-[10px] text-stone-400">1–120</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={form.lanesCount || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lanesCount: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                      })
                    }
                    placeholder="Например: 24"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-amber-500 focus:outline-none font-mono"
                  />
                  {/* Quick lane count pills */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-stone-500">Частые:</span>
                    {[8, 12, 16, 20, 24, 32, 48].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setForm({ ...form, lanesCount: num })}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                          form.lanesCount === num
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Адрес
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="ул. Спортивная, дом 10"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase font-semibold text-stone-400 mb-1">
                  Покрытие дорожек
                </label>
                <select
                  value={form.surface}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      surface: e.target.value as BowlingCenter['surface'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="Синтетика (Synthetic)">Синтетика (Synthetic - Brunswick Pro Anvilane / AMF HPL)</option>
                  <option value="Дерево (Wood)">Дерево (Wood / Клён и сосна)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCenter ? 'Сохранить изменения' : 'Добавить центр'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
