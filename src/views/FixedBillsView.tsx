import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon, AVAILABLE_ICONS, AVAILABLE_COLORS } from '../components/CategoryIcon';
import { FixedBill } from '../types/finance';

export const FixedBillsView: React.FC = () => {
  const {
    fixedBills,
    categories,
    addFixedBill,
    deleteFixedBill,
    toggleBillPaid,
    totalFixedBillsAmount,
    formatCurrency,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDay, setDueDay] = useState(10);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const todayDay = new Date().getDate();

  const handleOpenAdd = () => {
    setName('');
    setAmountStr('');
    setDueDay(10);
    setSelectedCategoryId(categories[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleQuickTemplate = (template: { name: string; amount: number; dueDay: number; categoryId: string }) => {
    setName(template.name);
    setAmountStr(template.amount.toFixed(2));
    setDueDay(template.dueDay);
    setSelectedCategoryId(template.categoryId);
    setIsModalOpen(true);
  };

  const UTILITY_TEMPLATES = [
    { name: 'Conta de Água (Saneamento)', amount: 78.50, dueDay: 12, categoryId: 'cat_agua', label: 'Água', emoji: '💧' },
    { name: 'Conta de Luz (Energia Elétrica)', amount: 143.20, dueDay: 5, categoryId: 'cat_luz', label: 'Luz', emoji: '⚡' },
    { name: 'Conta de Telefone / Celular', amount: 69.90, dueDay: 15, categoryId: 'cat_telefone', label: 'Telefone', emoji: '📱' },
    { name: 'Internet Fibra 600MB', amount: 99.90, dueDay: 10, categoryId: 'cat_internet', label: 'Internet', emoji: '🌐' },
    { name: 'TV a Cabo & Assinatura HD', amount: 89.90, dueDay: 20, categoryId: 'cat_tv_cabo', label: 'TV a Cabo', emoji: '📺' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.')) || 0;
    if (!name.trim() || amount <= 0) return;

    const cat = categories.find((c) => c.id === selectedCategoryId) || categories[0];

    addFixedBill({
      name: name.trim(),
      amount,
      dueDay,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
    });

    setIsModalOpen(false);
  };

  const pendingBills = fixedBills.filter((b) => !b.isPaidThisMonth);
  const paidBills = fixedBills.filter((b) => b.isPaidThisMonth);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-400" />
            Contas Fixas & Recorrentes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre e acompanhe contas mensais como aluguel, energia, água e internet
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Nova Conta Fixa
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Mensal em Contas
          </span>
          <span className="font-mono-nums text-xl sm:text-2xl font-extrabold text-white block">
            {formatCurrency(totalFixedBillsAmount)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {fixedBills.length} contas cadastradas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121622]/90 border border-amber-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block mb-1">
            Pendentes este Mês
          </span>
          <span className="font-mono-nums text-xl sm:text-2xl font-extrabold text-amber-400 block">
            {formatCurrency(pendingBills.reduce((a, b) => a + b.amount, 0))}
          </span>
          <span className="text-[10px] text-amber-400/70 mt-0.5 block">
            {pendingBills.length} contas a pagar
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121622]/90 border border-emerald-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
            Já Pagas este Mês
          </span>
          <span className="font-mono-nums text-xl sm:text-2xl font-extrabold text-emerald-400 block">
            {formatCurrency(paidBills.reduce((a, b) => a + b.amount, 0))}
          </span>
          <span className="text-[10px] text-emerald-400/70 mt-0.5 block">
            {paidBills.length} contas liquidadas
          </span>
        </div>
      </div>

      {/* Utility Bills Quick Templates */}
      <div className="p-4 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="text-sky-400">⚡</span> Contas Básicas Essenciais (Cadastrar Rápido)
          </span>
          <span className="text-[11px] text-slate-500">Toque para preencher</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {UTILITY_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleQuickTemplate(tmpl)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-sky-500/30 shrink-0 text-left transition-all active:scale-95"
            >
              <span className="text-base leading-none">{tmpl.emoji}</span>
              <div>
                <span className="text-xs font-semibold text-white block">{tmpl.label}</span>
                <span className="font-mono-nums text-[10px] text-slate-400 block">
                  ~R$ {tmpl.amount.toFixed(2).replace('.', ',')} · dia {tmpl.dueDay}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Bills List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Contas a Pagar ({pendingBills.length})
          </h3>
        </div>

        {pendingBills.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#121622]/50 border border-white/5 text-center text-xs text-slate-400">
            Parabéns! Todas as contas do mês já foram pagas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingBills.map((bill) => {
              const diff = bill.dueDay - todayDay;
              let badgeColor = 'text-slate-400';
              let badgeText = `Vence em ${diff} dias`;
              if (diff === 0) {
                badgeColor = 'text-rose-400 font-bold';
                badgeText = 'Vence HOJE!';
              } else if (diff < 0) {
                badgeColor = 'text-rose-500 font-bold';
                badgeText = `Atrasada há ${Math.abs(diff)} dias`;
              } else if (diff <= 3) {
                badgeColor = 'text-amber-400 font-bold';
                badgeText = `Vence em ${diff} dias`;
              }

              return (
                <div
                  key={bill.id}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121622]/90 border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center justify-between gap-2.5 w-full sm:w-auto min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{
                          backgroundColor: `${bill.categoryColor}20`,
                          color: bill.categoryColor,
                        }}
                      >
                        <CategoryIcon icon={bill.categoryIcon} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{bill.name}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                          <span>Dia {bill.dueDay}</span>
                          <span>·</span>
                          <span className={badgeColor}>{badgeText}</span>
                        </p>
                      </div>
                    </div>

                    {/* Trash on mobile top right */}
                    <button
                      onClick={() => deleteFixedBill(bill.id)}
                      className="sm:hidden p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Excluir conta fixa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto shrink-0">
                    <span className="font-mono-nums font-extrabold text-sm sm:text-base text-slate-100">
                      {formatCurrency(bill.amount)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBillPaid(bill.id, true)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95"
                        title="Marcar como paga e registrar como gasto"
                      >
                        Pagar
                      </button>
                      <button
                        onClick={() => deleteFixedBill(bill.id)}
                        className="hidden sm:inline-flex p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Excluir conta fixa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paid Bills List */}
      {paidBills.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Pagas este Mês ({paidBills.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paidBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-2.5 opacity-85 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-300 truncate line-through">
                      {bill.name}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] text-emerald-400 block truncate">
                      Paga · Vencimento dia {bill.dueDay}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono-nums text-xs font-bold text-slate-400 line-through whitespace-nowrap">
                    {formatCurrency(bill.amount)}
                  </span>
                  <button
                    onClick={() => toggleBillPaid(bill.id, false)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline px-1"
                  >
                    Desfazer
                  </button>
                  <button
                    onClick={() => deleteFixedBill(bill.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Fixed Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#121622] border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-400" />
                Cadastrar Conta Recorrente
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Internet Fibra, Energia Elétrica, Aluguel..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor Mensal (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono-nums"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Dia do Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500 font-mono-nums"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Categoria
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji ? `${c.emoji} ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-950/40"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
