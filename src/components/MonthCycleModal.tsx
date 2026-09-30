import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Calendar, Clock, Check, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface MonthCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthCycleModal: React.FC<MonthCycleModalProps> = ({ isOpen, onClose }) => {
  const { monthCycleStartDay, updateMonthCycleStartDay, cycleInfo } = useFinance();
  const [selectedDay, setSelectedDay] = useState<number>(monthCycleStartDay || 1);

  if (!isOpen) return null;

  const quickPresets = [
    { day: 1, label: 'Dia 1 (Calendário tradicional)', desc: '1º ao último dia do mês' },
    { day: 5, label: 'Dia 5 (5º dia útil / Pagamento)', desc: 'Dia 5 ao dia 4 do mês seguinte' },
    { day: 10, label: 'Dia 10 (Salário/Benefício)', desc: 'Dia 10 ao dia 9 do mês seguinte' },
    { day: 15, label: 'Dia 15 (Adiantamento/Quinzena)', desc: 'Dia 15 ao dia 14 do mês seguinte' },
    { day: 20, label: 'Dia 20 (Fatura / Fechamento)', desc: 'Dia 20 ao dia 19 do mês seguinte' },
    { day: 25, label: 'Dia 25 (Fim de mês)', desc: 'Dia 25 ao dia 24 do mês seguinte' },
  ];

  const handleSave = () => {
    updateMonthCycleStartDay(selectedDay);
    onClose();
  };

  // Preview cycle calculation for the selected day
  const previewEndDay = selectedDay === 1 ? 'Último dia' : String(selectedDay - 1).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg rounded-3xl bg-[#121622] border border-emerald-500/30 p-5 sm:p-6 shadow-2xl shadow-emerald-950/50 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Configurar Ciclo do Mês</h2>
              <p className="text-xs text-slate-400">Defina quando seu mês financeiro começa e termina</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanation */}
        <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/5">
          Muitas pessoas recebem salário no <strong>dia 5, 10 ou 20</strong>. Configure o dia de início para que os gastos do mês, receitas e saldo livre sejam calculados exatamente no período da sua fatura ou salário!
        </p>

        {/* Quick Options */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Opções Populares de Início do Mês:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPresets.map((preset) => {
              const isSelected = selectedDay === preset.day;
              return (
                <button
                  key={preset.day}
                  type="button"
                  onClick={() => setSelectedDay(preset.day)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-950/30'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold block">{preset.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{preset.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Day Slider / Input */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Escolha um dia específico (1 a 31):</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-sm">
              Dia {selectedDay}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="31"
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Dia 1</span>
            <span>Dia 10</span>
            <span>Dia 20</span>
            <span>Dia 31</span>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Ciclo escolhido:{' '}
              <strong>
                {selectedDay === 1
                  ? 'Mês Calendário (Dia 1 ao fim do mês)'
                  : `Todo dia ${selectedDay} até o dia ${previewEndDay} do mês seguinte`}
              </strong>
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-950/40 active:scale-95 flex items-center gap-1.5"
          >
            <span>Salvar Ciclo do Mês</span>
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
