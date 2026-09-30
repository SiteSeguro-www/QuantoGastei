import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthCycle } from '../utils/cycleHelper';
import { Calendar, Check, X, Sparkles } from 'lucide-react';

interface MonthCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthCycleModal: React.FC<MonthCycleModalProps> = ({ isOpen, onClose }) => {
  const { monthCycleStartDay, updateMonthCycleStartDay } = useFinance();
  const [selectedDay, setSelectedDay] = useState<number>(monthCycleStartDay || 1);

  // Sync selected day whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDay(monthCycleStartDay || 1);
    }
  }, [isOpen, monthCycleStartDay]);

  // Live preview of cycle calculation for the chosen day
  const previewCycle = useMemo(() => {
    return calculateMonthCycle(selectedDay);
  }, [selectedDay]);

  if (!isOpen) return null;

  const quickPresets = [
    { day: 1, label: 'Dia 1 (Padrão)', desc: '1º ao fim do mês' },
    { day: 5, label: 'Dia 5 (5º dia útil)', desc: 'Dia 5 ao dia 4' },
    { day: 10, label: 'Dia 10 (Salário)', desc: 'Dia 10 ao dia 9' },
    { day: 15, label: 'Dia 15 (Quinzena)', desc: 'Dia 15 ao dia 14' },
    { day: 20, label: 'Dia 20 (Fechamento)', desc: 'Dia 20 ao dia 19' },
    { day: 25, label: 'Dia 25 (Fim de mês)', desc: 'Dia 25 ao dia 24' },
  ];

  const handleSave = () => {
    updateMonthCycleStartDay(selectedDay);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] rounded-3xl bg-[#121622] border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 flex flex-col overflow-hidden">
        {/* Header - Fixed top */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-white/10 shrink-0 bg-[#121622]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">Configurar Ciclo do Mês</h2>
              <p className="text-[11px] text-slate-400">Defina o dia que seu mês financeiro inicia</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-3.5 flex-1 custom-scrollbar">
          {/* Explanation Banner */}
          <div className="text-[11px] sm:text-xs text-slate-300 leading-snug bg-white/[0.03] p-2.5 sm:p-3 rounded-2xl border border-white/5 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Gastos, receitas e metas serão calculados com base no dia de início escolhido (ideal para quem recebe no <strong>dia 5, 10 ou 20</strong>).
            </span>
          </div>

          {/* Quick Preset Options */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sugestões Mais Usadas:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {quickPresets.map((preset) => {
                const isSelected = selectedDay === preset.day;
                return (
                  <button
                    key={preset.day}
                    type="button"
                    onClick={() => setSelectedDay(preset.day)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40'
                        : 'bg-black/30 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <span className="text-xs font-bold block leading-tight truncate">{preset.label}</span>
                      <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">{preset.desc}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Day Slider & Stepper */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Escolha qualquer dia (1 a 31):</span>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDay((prev) => Math.max(1, prev - 1))}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all"
                  title="Diminuir dia"
                >
                  -
                </button>

                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-extrabold text-xs sm:text-sm">
                  Dia {selectedDay}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedDay((prev) => Math.min(31, prev + 1))}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition-all"
                  title="Aumentar dia"
                >
                  +
                </button>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="31"
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {/* Quick day chips */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5">
              {[1, 5, 10, 15, 20, 25, 28, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono font-medium transition-colors ${
                    selectedDay === d
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  Dia {d}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 min-w-0">
              <span className="text-[11px] sm:text-xs">
                Período resultante:{' '}
                <strong className="text-white font-bold underline decoration-emerald-500/50">
                  {previewCycle.cycleLabel}
                </strong>
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              {previewCycle.daysRemaining === 0
                ? 'Fechamento hoje'
                : `Faltam ${previewCycle.daysRemaining} dias`}
            </span>
          </div>
        </div>

        {/* Footer Actions - Fixed Bottom */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-white/10 bg-[#10141e] shrink-0 flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-950/50 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Salvar Ciclo do Mês</span>
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
