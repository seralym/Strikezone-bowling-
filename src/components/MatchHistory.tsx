import React, { useState, useRef } from 'react';
import { MatchRecord } from '../types/bowling';
import { ScoreBoard } from './ScoreBoard';
import {
  Calendar,
  Trophy,
  Trash2,
  Eye,
  Download,
  Upload,
  Search,
  X,
  FileSpreadsheet,
  Building2,
  Droplets,
  CircleDot,
} from 'lucide-react';

interface MatchHistoryProps {
  matches: MatchRecord[];
  onDeleteMatch: (id: string) => void;
  onImportMatches: (jsonStr: string) => void;
  onExportMatches: () => void;
  onResetDemo: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  onDeleteMatch,
  onImportMatches,
  onExportMatches,
  onResetDemo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState<string>('all');
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<MatchRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tournamentNames = Array.from(
    new Set(matches.map((m) => m.tournamentName).filter(Boolean) as string[])
  );

  const filteredMatches = matches.filter((m) => {
    if (tournamentFilter !== 'all') {
      if (tournamentFilter === 'none') {
        if (m.tournamentName) return false;
      } else if (m.tournamentName !== tournamentFilter) {
        return false;
      }
    }

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const matchTitle = (m.title || '').toLowerCase();
    const center = (m.centerName || '').toLowerCase();
    const pattern = (m.oilPatternName || '').toLowerCase();
    const comp = (m.competitionName || '').toLowerCase();
    const ball = (m.ballName || '').toLowerCase();
    const tourn = (m.tournamentName || '').toLowerCase();
    return (
      matchTitle.includes(term) ||
      center.includes(term) ||
      pattern.includes(term) ||
      comp.includes(term) ||
      ball.includes(term) ||
      tourn.includes(term)
    );
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportMatches(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-display">
            История сыгранных матчей
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            Архив всех сыгранных партий с привязкой к боулинг-центрам, программам масла и шарам
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={onExportMatches}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            title="Скачать историю в формате JSON"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Экспорт JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            title="Импортировать историю из JSON"
          >
            <Upload className="w-3.5 h-3.5 text-stone-400" />
            <span>Импорт JSON</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-800 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по центру, программе масла, турниру или шару..."
            className="bg-transparent border-none text-sm text-stone-100 placeholder-stone-500 focus:outline-none w-full"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-stone-400 hover:text-stone-200 text-xs"
            >
              Очистить
            </button>
          )}
        </div>

        {/* Tournament Filter Pills */}
        {tournamentNames.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-stone-500 text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">
              Турнир:
            </span>
            <button
              type="button"
              onClick={() => setTournamentFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                tournamentFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              Все ({matches.length})
            </button>
            {tournamentNames.map((tName) => {
              const count = matches.filter((m) => m.tournamentName === tName).length;
              return (
                <button
                  key={tName}
                  type="button"
                  onClick={() => setTournamentFilter(tName)}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors flex items-center gap-1.5 ${
                    tournamentFilter === tName
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  <Trophy className={`w-3 h-3 ${tournamentFilter === tName ? 'text-stone-950' : 'text-amber-400'}`} />
                  <span className="truncate max-w-[180px]">{tName}</span>
                  <span className="font-mono text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Matches List */}
      {filteredMatches.length > 0 ? (
        <div className="space-y-4">
          {filteredMatches.map((match, idx) => {
            const formattedDate = new Date(match.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const player = match.players[0];
            if (!player) return null;

            return (
              <div
                key={`${match.id}_${idx}`}
                className="rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-stone-700 p-4 sm:p-5 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-100 text-base">
                        {match.title || 'Одиночная партия'}
                      </span>
                      {match.laneNumber && (
                        <span className="text-xs text-stone-400 font-mono">
                          (Дорожка #{match.laneNumber})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Actions for match */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMatchForDetail(match)}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Открыть табло</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Удалить эту запись матча?')) {
                          onDeleteMatch(match.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Удалить матч"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Match Conditions + Result Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3">
                  {/* Left: Tags */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-400">
                    {match.tournamentName && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{match.tournamentName}</span>
                      </span>
                    )}
                    {match.centerName && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/70 border border-stone-800 text-emerald-400">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{match.centerName}</span>
                      </span>
                    )}
                    {match.oilPatternName && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/70 border border-stone-800 text-cyan-400">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>{match.oilPatternName}</span>
                      </span>
                    )}
                    {match.ballName && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/70 border border-stone-800 text-amber-300">
                        <CircleDot className="w-3.5 h-3.5" />
                        <span>{match.ballName}</span>
                      </span>
                    )}
                  </div>

                  {/* Right: Score and stats */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right text-xs text-stone-400">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-stone-300">{player.strikesCount} X</span>
                        <span>·</span>
                        <span className="text-stone-300">{player.sparesCount} /</span>
                        {player.openFramesCount === 0 && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-400 font-semibold">Clean Game</span>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Открытых фреймов: {player.openFramesCount}
                      </div>
                    </div>

                    <div className="text-right pl-3 border-l border-stone-800">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
                        {player.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-stone-900/40 rounded-2xl border border-stone-800/80 p-8">
          <FileSpreadsheet className="w-10 h-10 text-stone-500 mx-auto" />
          <h3 className="text-lg font-bold text-stone-200">
            {searchTerm ? 'Матчи не найдены' : 'История пуста'}
          </h3>
          <p className="text-sm text-stone-400 max-w-md mx-auto">
            {searchTerm
              ? 'Попробуйте изменить поисковый запрос'
              : 'Сыграйте и сохраните партию во вкладке «Игра» или загрузите примеры матчей.'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={onResetDemo}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-semibold text-sm hover:bg-amber-400 transition-colors shadow-sm"
            >
              Загрузить примеры матчей
            </button>
          )}
        </div>
      )}

      {/* Full Scoreboard Modal Preview */}
      {selectedMatchForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-2xl bg-stone-900 border border-stone-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-stone-100 font-display">
                  {selectedMatchForDetail.title || 'Детали матча'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {new Date(selectedMatchForDetail.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {selectedMatchForDetail.laneNumber && ` · Дорожка ${selectedMatchForDetail.laneNumber}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMatchForDetail(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ScoreBoard
              players={selectedMatchForDetail.players}
              activePlayerIndex={0}
              matchInfo={{
                centerName: selectedMatchForDetail.centerName,
                oilPatternName: selectedMatchForDetail.oilPatternName,
                ballName: selectedMatchForDetail.ballName,
                laneNumber: selectedMatchForDetail.laneNumber,
              }}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedMatchForDetail(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-200 text-sm font-semibold hover:bg-stone-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
