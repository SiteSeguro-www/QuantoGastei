import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Calendar,
  Clock,
  Check,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { useFinance, getTodayString, getCurrentTimeString } from '../context/FinanceContext';
import { Category, TransactionType } from '../types/finance';
import { CategoryIcon, AVAILABLE_ICONS, AVAILABLE_COLORS } from './CategoryIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    categories,
    addCategory,
    addTransaction,
    updateTransaction,
    editingTransaction,
    setEditingTransaction,
    presetPreload,
    setPresetPreload,
  } = useFinance();

  const isEditing = !!editingTransaction;

  // Form states
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [useCurrentDateTime, setUseCurrentDateTime] = useState<boolean>(true);
  const [date, setDate] = useState<string>(getTodayString());
  const [time, setTime] = useState<string>(getCurrentTimeString());

  // Category search filter in modal
  const [categorySearch, setCategorySearch] = useState<string>('');

  // Create custom category sub-modal
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatIcon, setNewCatIcon] = useState<string>('Tag');
  const [newCatColor, setNewCatColor] = useState<string>('#3B82F6');
  const [newCatEmoji, setNewCatEmoji] = useState<string>('✨');

  // Initialize form when opening or editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(editingTransaction.amount.toString());
      setSelectedCategoryId(editingTransaction.categoryId);
      setDescription(editingTransaction.description || '');
      setDate(editingTransaction.date);
      setTime(editingTransaction.time);
      setUseCurrentDateTime(false);
    } else if (presetPreload) {
      setType('expense');
      setAmountStr(presetPreload.amount ? presetPreload.amount.toString() : '0');
      setSelectedCategoryId(presetPreload.categoryId || categories[0]?.id || '');
      setDescription(presetPreload.description || '');
      setDate(getTodayString());
      setTime(getCurrentTimeString());
      setUseCurrentDateTime(true);
    } else {
      setType('expense');
      setAmountStr('0');
      setSelectedCategoryId(categories[0]?.id || '');
      setDescription('');
      setDate(getTodayString());
      setTime(getCurrentTimeString());
      setUseCurrentDateTime(true);
    }
  }, [editingTransaction, presetPreload, isOpen, categories]);

  if (!isOpen) return null;

  // Parse amount number
  const parsedAmount = parseFloat(amountStr.replace(',', '.')) || 0;

  // Quick adjust amount
  const handleDelta = (delta: number) => {
    const current = Math.max(0, parsedAmount);
    const updated = Math.max(0, Math.round((current + delta) * 100) / 100);
    setAmountStr(updated.toString());
  };

  // Set direct amount
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Allow digits, comma and point
    if (/^[0-9]*[.,]?[0-9]*$/.test(val) || val === '') {
      setAmountStr(val);
    }
  };

  // Filter categories by type and search query
  const filteredCategories = categories.filter((c) => {
    const matchesType = c.type === 'both' || c.type === type;
    const matchesSearch = c.name.toLowerCase().includes(categorySearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Save new custom category
  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const created = addCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      emoji: newCatEmoji || '📌',
      color: newCatColor,
      type: type,
    });

    setSelectedCategoryId(created.id);
    setIsCreatingCategory(false);
    setNewCatName('');
  };

  // Submit transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    const finalDate = useCurrentDateTime ? getTodayString() : date;
    const finalTime = useCurrentDateTime ? getCurrentTimeString() : time;

    if (isEditing && editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: parsedAmount,
        categoryId: selectedCategory?.id || 'cat_outros',
        categoryName: selectedCategory?.name || 'Outros',
        categoryIcon: selectedCategory?.icon || 'Tag',
        categoryColor: selectedCategory?.color || '#71717A',
        description: description.trim(),
        date: finalDate,
        time: finalTime,
      });
    } else {
      addTransaction({
        type,
        amount: parsedAmount,
        categoryId: selectedCategory?.id || 'cat_outros',
        categoryName: selectedCategory?.name || 'Outros',
        categoryIcon: selectedCategory?.icon || 'Tag',
        categoryColor: selectedCategory?.color || '#71717A',
        description: description.trim(),
        date: finalDate,
        time: finalTime,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setEditingTransaction(null);
    setPresetPreload(null);
    setIsCreatingCategory(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0F131D] border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {type === 'expense' ? (
                <ArrowDownLeft className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {isEditing
                ? 'Editar Registro'
                : type === 'expense'
                ? 'Novo Gasto'
                : 'Nova Receita'}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Expense vs Income Type Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Gasto (Saída)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Receita (Entrada)
            </button>
          </div>

          {/* Large Amount Display & Input */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/30 border border-white/5 text-center">
            <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5 sm:mb-1 block">
              Valor da movimentação
            </label>
            <div className="flex items-center justify-center gap-1.5 mt-0.5 sm:mt-1">
              <span
                className={`text-xl sm:text-2xl font-bold font-mono-nums ${
                  type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus={!isEditing}
                placeholder="0,00"
                value={amountStr === '0' ? '' : amountStr}
                onChange={handleAmountInputChange}
                className={`w-full max-w-[220px] text-center text-3xl sm:text-4xl font-extrabold font-mono-nums bg-transparent border-none outline-none focus:ring-0 ${
                  type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              />
            </div>

            {/* Rapid increment / decrement buttons requested */}
            <div className="grid grid-cols-6 sm:flex sm:flex-wrap items-center justify-center gap-1 sm:gap-1.5 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => handleDelta(-5)}
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleDelta(-1)}
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => handleDelta(1)}
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => handleDelta(5)}
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => handleDelta(10)}
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => handleDelta(50)}
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center"
              >
                +50
              </button>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Categoria ({filteredCategories.length})
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar categoria
              </button>
            </div>

            {/* Inline Custom Category Creator */}
            {isCreatingCategory && (
              <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 mb-3 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Nova Categoria Personalizada
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nome da categoria (ex: Livros, Natação)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  {/* Icon selection */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Escolha um ícone:</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {AVAILABLE_ICONS.slice(0, 14).map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setNewCatIcon(ic)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                            newCatIcon === ic
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                          }`}
                        >
                          <CategoryIcon icon={ic} className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color selection */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Escolha uma cor:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {AVAILABLE_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewCatColor(col)}
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-transform"
                          style={{ backgroundColor: col }}
                        >
                          {newCatColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveCustomCategory}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
                  >
                    Salvar e usar esta categoria
                  </button>
                </div>
              </div>
            )}

            {/* Quick search inside categories */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar categoria (ex: McDonald's, Mercado, Roupa)..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-white/10 border-emerald-500 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-white shrink-0"
                      style={{
                        backgroundColor: `${cat.color}25`,
                        borderColor: cat.color,
                      }}
                    >
                      <CategoryIcon icon={cat.icon} emoji={cat.emoji} className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Descrição (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Chocolate para assistir filme, Almoço de domingo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/25"
            />
          </div>

          {/* Date and Time Settings */}
          <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Usar data e hora atuais
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCurrentDateTime}
                  onChange={(e) => setUseCurrentDateTime(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {!useCurrentDateTime && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" /> Hora
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={parsedAmount <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                parsedAmount <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : type === 'expense'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-rose-950/50 hover:brightness-110'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-950/50 hover:brightness-110'
              }`}
            >
              <Check className="w-4 h-4" />
              {isEditing
                ? 'Salvar Alterações'
                : type === 'expense'
                ? 'Confirmar Gasto'
                : 'Confirmar Receita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
