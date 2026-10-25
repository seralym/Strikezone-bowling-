import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, do not show
  if (isInstalled || dismissed) {
    return null;
  }

  // If neither installable nor iOS, return null
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="relative mx-auto max-w-7xl px-4 pt-3 pb-1">
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/60 border border-amber-500/30 p-3 sm:p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-100 font-display">
                  Установите StrikeZone как приложение
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  100% Offline PWA
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Быстрый запуск с домашнего экрана, полноэкранный режим и работа без интернета.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Установить</span>
              </button>
            )}

            {isIOS && !isInstallable && (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Инструкция для iOS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Скрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Установка на iPhone / iPad</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-stone-400 hover:text-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-stone-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                  1
                </span>
                <span>
                  Откройте приложение в браузере <strong>Safari</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                  2
                </span>
                <span>
                  Нажмите кнопку <strong>«Поделиться»</strong> (иконка со стрелкой вверх) на нижней панели Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                  3
                </span>
                <span>
                  Прокрутите список действий и выберите <strong>«На экран "Домой"»</strong> (Add to Home Screen).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                  4
                </span>
                <span>
                  Нажмите <strong>«Добавить»</strong> в правом верхнем углу. Готово!
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};
