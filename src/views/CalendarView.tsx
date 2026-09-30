import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
} from 'lucide-react';
import { useFinance, getTodayString } from '../context/FinanceContext';
import { TransactionItem } from '../components/TransactionItem';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Transaction } from '../types/finance';

export const CalendarView: React.FC = () => {
  const { transactions, formatCurrency, setIsAddModalOpen, setEditingTransaction } = useFinance();

  const todayStr = getTodayString();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 = September
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Calculate days in month and starting day of week
  const { daysInMonth, startDayOfWeek } = useMemo(() => {
    const daysCount = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return { daysInMonth: daysCount, startDayOfWeek: firstDay };
  }, [currentYear, currentMonth]);

  // Aggregate expenses per day in this month
  const dailyTotals = useMemo(() => {
    const map: { [day: number]: { expense: number; income: number; count: number } } = {};
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    transactions.forEach((tx) => {
      if (tx.date.startsWith(monthPrefix)) {
        const day = parseInt(tx.date.split('-')[2], 10);
        if (!map[day]) {
          map[day] = { expense: 0, income: 0, count: 0 };
        }
        if (tx.type === 'expense') {
          map[day].expense += tx.amount;
        } else {
          map[day].income += tx.amount;
        }
        map[day].count += 1;
      }
    });

    return map;
  }, [transactions, currentYear, currentMonth]);

  // Transactions on selected date
  const selectedDateTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const selectedDayTotalExpense = useMemo(() => {
    return selectedDateTransactions
      .filter((t) => t.type === 'expense')
      .reduce((a, b) => a + b.amount, 0);
  }, [selectedDateTransactions]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header and Month Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
            Calendário Financeiro
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize seus gastos dia a dia no calendário
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 bg-[#121622] border border-white/10 rounded-xl p-1 self-stretch sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white px-2 flex-1 sm:flex-initial text-center sm:min-w-[120px]">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="p-2 xs:p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-0.5 xs:gap-1 text-center mb-2">
          {daysOfWeek.map((dow, idx) => (
            <div
              key={dow}
              className={`text-[9px] xs:text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider py-1 ${
                idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {dow}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0.5 xs:gap-1 sm:gap-2">
          {/* Empty spacer cells before day 1 */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[42px] xs:min-h-[48px] sm:min-h-[64px] rounded-lg sm:rounded-xl bg-transparent" />
          ))}

          {/* Actual days in month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayData = dailyTotals[day];

            return (
              <button
                key={day}
                onClick={() => handleSelectDay(day)}
                className={`min-h-[42px] xs:min-h-[48px] sm:min-h-[68px] p-0.5 xs:p-1 sm:p-2 rounded-lg sm:rounded-xl text-left flex flex-col justify-between transition-all border relative ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : isToday
                    ? 'bg-white/[0.06] border-white/20 text-white'
                    : 'bg-black/20 border-white/5 text-slate-300 hover:border-white/15 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] xs:text-[11px] sm:text-xs font-bold font-mono ${
                      isToday
                        ? 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] sm:text-xs'
                        : 'text-slate-300'
                    }`}
                  >
                    {day}
                  </span>

                  {dayData && dayData.count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  )}
                </div>

                {/* Daily Total Spend display */}
                {dayData && dayData.expense > 0 ? (
                  <div className="mt-0.5 sm:mt-1 w-full">
                    {/* Full currency on tablet/desktop */}
                    <span className="hidden sm:block font-mono-nums text-[11px] font-bold text-rose-400 truncate">
                      {formatCurrency(dayData.expense)}
                    </span>
                    {/* Compact currency on mobile so it fits in 40px cell */}
                    <span className="sm:hidden font-mono-nums text-[9px] font-extrabold text-rose-400 block truncate text-center leading-tight">
                      R${Math.round(dayData.expense)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600 block opacity-0 sm:opacity-50">
                    --
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Section */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121622]/90 border border-white/[0.07] space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Gastos em {selectedDate.split('-').reverse().join('/')}
              </h3>
              <span className="text-xs text-slate-400">
                Total do dia:{' '}
                <span className="font-mono-nums font-bold text-rose-400">
                  {formatCurrency(selectedDayTotalExpense)}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar neste dia
          </button>
        </div>

        {selectedDateTransactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Nenhum gasto ou movimentação registrada nesta data.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onOpenDelete={(t) => setTxToDelete(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      <DeleteConfirmModal
        transaction={txToDelete}
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
      />
    </div>
  );
};
