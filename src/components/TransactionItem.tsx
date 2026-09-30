import React, { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { Transaction } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
  onOpenDelete: (tx: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onOpenDelete,
}) => {
  const { setEditingTransaction, setIsAddModalOpen, quickAdjustAmount, formatCurrency } = useFinance();
  const [isExpanded, setIsExpanded] = useState(false);

  const isExpense = transaction.type === 'expense';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDelete(transaction);
  };

  const handleAdjust = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    quickAdjustAmount(transaction.id, delta);
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative rounded-xl sm:rounded-2xl bg-[#121622]/80 hover:bg-[#181E2E] border border-white/[0.06] hover:border-white/[0.12] p-3 sm:p-3.5 transition-all duration-150 cursor-pointer shadow-sm select-none"
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Icon & Names */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${transaction.categoryColor}18`,
              borderColor: `${transaction.categoryColor}35`,
              color: transaction.categoryColor,
            }}
          >
            <CategoryIcon icon={transaction.categoryIcon} className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
              {transaction.categoryName}
            </h4>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 mt-0.5 min-w-0">
              {transaction.description && (
                <span className="truncate text-slate-300 min-w-0 flex-shrink">
                  {transaction.description}
                </span>
              )}
              {transaction.description && (
                <span aria-hidden="true" className="text-slate-600 shrink-0">·</span>
              )}
              <span className="font-mono-nums text-[10px] sm:text-[11px] text-slate-400 shrink-0">
                {transaction.time}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Quick expand chevron */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="text-right shrink-0">
            <span
              className={`font-mono-nums text-xs sm:text-base font-bold tracking-tight whitespace-nowrap ${
                isExpense ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isExpense ? '− ' : '+ '}
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          <div className="text-slate-500 group-hover:text-slate-300 p-0.5 sm:p-1 transition-colors shrink-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Quick-Adjust & Actions Drawer */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Quick Increment/Decrement Buttons */}
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 mr-1 shrink-0">Ajustar:</span>
            <button
              type="button"
              onClick={(e) => handleAdjust(e, -5)}
              className="flex-1 sm:flex-initial px-2 py-1 rounded-lg text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center shrink-0"
              title="Diminuir R$ 5,00"
            >
              − 5
            </button>
            <button
              type="button"
              onClick={(e) => handleAdjust(e, -1)}
              className="flex-1 sm:flex-initial px-2 py-1 rounded-lg text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center shrink-0"
              title="Diminuir R$ 1,00"
            >
              − 1
            </button>
            <button
              type="button"
              onClick={(e) => handleAdjust(e, 1)}
              className="flex-1 sm:flex-initial px-2 py-1 rounded-lg text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center shrink-0"
              title="Aumentar R$ 1,00"
            >
              + 1
            </button>
            <button
              type="button"
              onClick={(e) => handleAdjust(e, 5)}
              className="flex-1 sm:flex-initial px-2 py-1 rounded-lg text-xs font-mono font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95 transition-transform text-center shrink-0"
              title="Aumentar R$ 5,00"
            >
              + 5
            </button>
          </div>

          {/* Edit & Delete Controls */}
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto sm:ml-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-sky-400" />
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
