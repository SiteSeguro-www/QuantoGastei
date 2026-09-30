import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  BarChart,
  Lightbulb,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useFinance, getTodayString } from '../context/FinanceContext';
import { CategoryIcon } from '../components/CategoryIcon';

export const AnalyticsView: React.FC = () => {
  const { transactions, formatCurrency, activeProfile } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return getTodayString().substring(0, 7); // '2026-09'
  });

  const [activeCategorySlice, setActiveCategorySlice] = useState<string | null>(null);

  // Filter transactions by selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const expenseTransactions = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'expense');
  }, [monthTransactions]);

  const incomeTransactions = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'income');
  }, [monthTransactions]);

  // Totals
  const totalExpense = useMemo(() => {
    return expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [expenseTransactions]);

  const totalIncome = useMemo(() => {
    const directIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
    return directIncome > 0 ? directIncome : (activeProfile.monthlyIncomeGoal || 4500);
  }, [incomeTransactions, activeProfile]);

  const netBalance = totalIncome - totalExpense;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: { [id: string]: { name: string; icon: string; color: string; amount: number; count: number } } = {};

    expenseTransactions.forEach((tx) => {
      if (!map[tx.categoryId]) {
        map[tx.categoryId] = {
          name: tx.categoryName,
          icon: tx.categoryIcon,
          color: tx.categoryColor,
          amount: 0,
          count: 0,
        };
      }
      map[tx.categoryId].amount += tx.amount;
      map[tx.categoryId].count += 1;
    });

    const list = Object.entries(map).map(([id, val]) => ({
      id,
      ...val,
      percentage: totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0,
    }));

    return list.sort((a, b) => b.amount - a.amount);
  }, [expenseTransactions, totalExpense]);

  // Top category
  const topCategory = categoryBreakdown[0] || null;

  // Largest individual expense
  const largestIndividualExpense = useMemo(() => {
    if (expenseTransactions.length === 0) return null;
    return [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0];
  }, [expenseTransactions]);

  // Daily evolution data
  const dailyEvolution = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const daysMap: { [day: number]: number } = {};
    for (let i = 1; i <= daysInMonth; i++) {
      daysMap[i] = 0;
    }

    expenseTransactions.forEach((tx) => {
      const day = parseInt(tx.date.split('-')[2], 10);
      if (daysMap[day] !== undefined) {
        daysMap[day] += tx.amount;
      }
    });

    const maxDayAmount = Math.max(...Object.values(daysMap), 10);

    return {
      days: Object.entries(daysMap).map(([day, amount]) => ({
        day: parseInt(day, 10),
        amount,
        heightPercent: Math.min(100, Math.round((amount / maxDayAmount) * 100)),
      })),
      maxDayAmount,
    };
  }, [selectedMonth, expenseTransactions]);

  // Financial Insights calculations (based purely on real user data)
  const insights = useMemo(() => {
    const list: string[] = [];

    if (topCategory) {
      list.push(
        `Sua maior categoria de gasto este mês é ${topCategory.name}, correspondendo a ${topCategory.percentage.toFixed(1)}% (${formatCurrency(topCategory.amount)}) de todas as despesas.`
      );
    }

    if (largestIndividualExpense) {
      list.push(
        `Seu maior gasto individual foi ${largestIndividualExpense.categoryName} no valor de ${formatCurrency(largestIndividualExpense.amount)}${
          largestIndividualExpense.description ? ` (${largestIndividualExpense.description})` : ''
        }.`
      );
    }

    const uniqueCategoriesCount = categoryBreakdown.length;
    if (uniqueCategoriesCount > 0) {
      list.push(`Você registrou despesas em ${uniqueCategoriesCount} categorias diferentes este mês.`);
    }

    // Daily average based on days passed in the month
    const today = new Date();
    const isCurrentMonth = selectedMonth === getTodayString().substring(0, 7);
    const daysPassed = isCurrentMonth ? Math.max(1, today.getDate()) : 30;
    const dailyAverage = totalExpense / daysPassed;

    if (totalExpense > 0) {
      list.push(`Seu gasto médio diário neste período foi de ${formatCurrency(dailyAverage)} por dia.`);
    }

    if (netBalance > 0) {
      const savingsRate = ((netBalance / totalIncome) * 100).toFixed(0);
      list.push(`Excelente! Você está poupando ${savingsRate}% de suas receitas mensais (${formatCurrency(netBalance)} restante).`);
    } else if (netBalance < 0) {
      list.push(`Atenção: seus gastos superaram suas receitas cadastradas em ${formatCurrency(Math.abs(netBalance))}.`);
    }

    return list;
  }, [
    topCategory,
    largestIndividualExpense,
    categoryBreakdown,
    totalExpense,
    totalIncome,
    netBalance,
    selectedMonth,
    formatCurrency,
  ]);

  // SVG Donut Chart Coordinates Calculation
  const donutSegments = useMemo(() => {
    let cumulativeAngle = 0;
    const radius = 64;
    const center = 80;
    const strokeWidth = 24;

    return categoryBreakdown.map((cat) => {
      const angle = (cat.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      // Arc calculation
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((startAngle + angle - 90) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return {
        ...cat,
        d,
        startAngle,
        angle,
      };
    });
  }, [categoryBreakdown]);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header and Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Resumo & Análises
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visão detalhada de onde seu dinheiro está sendo gasto
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#121622] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main 3 High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Entradas */}
        <div className="p-4 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Entradas do Mês
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="font-mono-nums text-xl sm:text-2xl font-extrabold text-emerald-400 block">
            + {formatCurrency(totalIncome)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Salário, freelance e entradas
          </span>
        </div>

        {/* Saídas */}
        <div className="p-4 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              Gastos do Mês
            </span>
            <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="font-mono-nums text-xl sm:text-2xl font-extrabold text-rose-400 block">
            − {formatCurrency(totalExpense)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {expenseTransactions.length} gastos contabilizados
          </span>
        </div>

        {/* Saldo Líquido */}
        <div className="p-4 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              Saldo Restante
            </span>
            <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <span
            className={`font-mono-nums text-xl sm:text-2xl font-extrabold block ${
              netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netBalance)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {netBalance >= 0 ? 'Economia positiva' : 'Déficit no período'}
          </span>
        </div>
      </div>

      {/* Top Category & Largest Single Expense Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topCategory && (
          <div className="p-4 rounded-2xl bg-[#121622]/80 border border-white/[0.07] flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${topCategory.color}25`,
                borderColor: topCategory.color,
                color: topCategory.color,
              }}
            >
              <CategoryIcon icon={topCategory.icon} className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Maior Categoria de Gasto
              </span>
              <span className="text-sm font-bold text-white block truncate">
                {topCategory.name}
              </span>
              <span className="font-mono-nums text-sm font-extrabold text-rose-400 block">
                {formatCurrency(topCategory.amount)} ({topCategory.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        )}

        {largestIndividualExpense && (
          <div className="p-4 rounded-2xl bg-[#121622]/80 border border-white/[0.07] flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${largestIndividualExpense.categoryColor}25`,
                borderColor: largestIndividualExpense.categoryColor,
                color: largestIndividualExpense.categoryColor,
              }}
            >
              <CategoryIcon icon={largestIndividualExpense.categoryIcon} className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Maior Gasto Individual
              </span>
              <span className="text-sm font-bold text-white block truncate">
                {largestIndividualExpense.categoryName}
              </span>
              <span className="font-mono-nums text-sm font-extrabold text-rose-400 block">
                {formatCurrency(largestIndividualExpense.amount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Donut Chart & Category Breakdown */}
      <div className="p-5 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Gastos por Categoria
            </h3>
          </div>
          <span className="text-xs font-mono-nums font-bold text-slate-400">
            Total: {formatCurrency(totalExpense)}
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Nenhum gasto registrado neste mês ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* SVG Donut Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                  {donutSegments.map((segment) => (
                    <path
                      key={segment.id}
                      d={segment.d}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="20"
                      strokeLinecap="round"
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() =>
                        setActiveCategorySlice(
                          activeCategorySlice === segment.id ? null : segment.id
                        )
                      }
                    />
                  ))}
                </svg>

                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                  <span className="font-mono-nums text-[11px] sm:text-xs font-bold text-white leading-tight text-center break-words">
                    {formatCurrency(totalExpense)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Progress Bars List */}
            <div className="lg:col-span-7 space-y-2.5">
              {categoryBreakdown.slice(0, 7).map((cat) => {
                const isActive = activeCategorySlice === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() =>
                      setActiveCategorySlice(isActive ? null : cat.id)
                    }
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/10 border-white/20'
                        : 'bg-black/20 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}30`, color: cat.color }}
                        >
                          <CategoryIcon icon={cat.icon} className="w-3 h-3" />
                        </div>
                        <span className="font-semibold text-white truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono-nums font-bold text-slate-200">
                          {formatCurrency(cat.amount)}
                        </span>
                        <span className="font-mono-nums text-[11px] text-slate-400 w-10 text-right">
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, cat.percentage)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Daily Evolution Bar Chart */}
      <div className="p-5 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Evolução Diária dos Gastos
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Dias do mês ({dailyEvolution.days.length} dias)
          </span>
        </div>

        <div className="h-40 flex items-end gap-1.5 overflow-x-auto pt-6 pb-1 px-1 no-scrollbar">
          {dailyEvolution.days.map((item) => (
            <div
              key={item.day}
              className="flex-1 min-w-[20px] sm:min-w-[24px] flex flex-col items-center gap-1 group relative cursor-pointer"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/10 text-white text-[10px] font-mono font-bold py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                Dia {item.day}: {formatCurrency(item.amount)}
              </div>

              {/* Bar */}
              <div className="w-full bg-white/5 rounded-t-sm flex items-end h-28 overflow-hidden">
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    item.amount > 0
                      ? 'bg-gradient-to-t from-rose-500 to-amber-400 group-hover:brightness-125'
                      : 'bg-transparent'
                  }`}
                  style={{
                    height: `${Math.max(item.amount > 0 ? 8 : 0, item.heightPercent)}%`,
                  }}
                />
              </div>

              {/* Day label */}
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-white">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Insights Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#171D2D] border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Insights Financeiros Personalizados
          </h3>
        </div>

        <div className="space-y-2.5">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300"
            >
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
