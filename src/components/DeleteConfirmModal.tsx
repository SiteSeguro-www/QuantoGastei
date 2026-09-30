import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Transaction } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';

interface DeleteConfirmModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { deleteTransaction, formatCurrency } = useFinance();

  if (!isOpen || !transaction) return null;

  const handleConfirm = () => {
    deleteTransaction(transaction.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl bg-[#141824] border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          Excluir este {transaction.type === 'expense' ? 'gasto' : 'registro'}?
        </h3>
        <p className="text-sm text-slate-400 mb-5">
          Essa ação não poderá ser desfeita. O registro será removido permanentemente de suas finanças.
        </p>

        {/* Transaction details preview */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: `${transaction.categoryColor}25`, borderColor: transaction.categoryColor }}
            >
              <CategoryIcon icon={transaction.categoryIcon} className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{transaction.categoryName}</p>
              <p className="text-xs text-slate-400">
                {transaction.description || transaction.date}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono-nums font-bold text-sm text-rose-400">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
