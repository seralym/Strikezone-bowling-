import React from 'react';
import { HelpCircle, Award, Target, Flame, Sparkles } from 'lucide-react';

export const RulesGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-4 border-b border-stone-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display flex items-center gap-2.5">
          <HelpCircle className="w-7 h-7 text-amber-500" />
          <span>Правила подсчёта очков в боулинге (USBC)</span>
        </h2>
        <p className="text-sm text-stone-400 mt-1">
          Официальная система подсчёта 10-кегельного классического боулинга
        </p>
      </div>

      {/* Grid of rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strike */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-black text-amber-400 text-lg">
              X
            </div>
            <div>
              <h3 className="font-bold text-stone-100">Страйк (Strike)</h3>
              <p className="text-xs text-stone-400">Сбиты все 10 кеглей с первого броска</p>
            </div>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Фрейм сразу завершается. За этот фрейм начисляется <strong className="text-amber-400">10 очков + сумма очков за следующие 2 броска</strong>.
            Три страйка подряд называются «Turkey» (Индейка) и приносят 30 очков за фрейм.
          </p>
        </div>

        {/* Spare */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-emerald-400 text-lg">
              /
            </div>
            <div>
              <h3 className="font-bold text-stone-100">Спэр (Spare)</h3>
              <p className="text-xs text-stone-400">Все 10 кеглей сбиты за два броска</p>
            </div>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Если после первого броска остались кегли, и вторым броском вы сбиваете их все — это спэр.
            За фрейм начисляется <strong className="text-emerald-400">10 очков + очки за 1 следующий бросок</strong>.
          </p>
        </div>

        {/* 10th Frame */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-mono font-black text-purple-400 text-lg">
              10
            </div>
            <div>
              <h3 className="font-bold text-stone-100">Особый 10-й фрейм</h3>
              <p className="text-xs text-stone-400">Возможность сделать до 3 бросков</p>
            </div>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Если в 10-м фрейме вы выбиваете страйк или спэр, вы получаете <strong className="text-purple-300">призовой третий бросок</strong>.
            Бонусы за страйки в 10-м фрейме считаются сразу же внутри этого же фрейма!
          </p>
        </div>

        {/* Splits */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center font-mono font-black text-red-400 text-lg">
              ○
            </div>
            <div>
              <h3 className="font-bold text-stone-100">Сплит (Split)</h3>
              <p className="text-xs text-stone-400">Сложная расстановка оставшихся кеглей</p>
            </div>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Сплит возникает, когда первая кегля (Headpin #1) сбита, а среди оставшихся есть разрыв (например, кегли 7 и 10 по краям дорожки). На табло первый бросок со сплитом обводится красным кружком.
          </p>
        </div>
      </div>

      {/* Pin diagram explanation */}
      <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 space-y-4">
        <h3 className="font-bold text-stone-100 text-base font-display">
          Схема нумерации кеглей в треугольнике
        </h3>
        <p className="text-xs text-stone-400">
          Кегли нумеруются от вершины треугольника (кегля 1 ближе всего к бросающему) к основанию:
        </p>

        <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-center font-mono text-sm space-y-2 select-none">
          <div className="text-amber-400 font-bold tracking-widest">[ 7 ] &nbsp; [ 8 ] &nbsp; [ 9 ] &nbsp; [ 10 ]</div>
          <div className="text-stone-300 tracking-widest">[ 4 ] &nbsp; [ 5 ] &nbsp; [ 6 ]</div>
          <div className="text-stone-300 tracking-widest">[ 2 ] &nbsp; [ 3 ]</div>
          <div className="text-amber-500 font-bold tracking-widest">[ 1 (Headpin) ]</div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
          <span>Максимально возможный счёт в игре: <strong className="text-amber-400 font-mono">300 очков</strong> (12 страйков подряд)</span>
          <span>Чистая игра (Clean Game): <strong className="text-emerald-400">без открытых фреймов</strong></span>
        </div>
      </div>
    </div>
  );
};
