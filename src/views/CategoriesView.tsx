import React, { useState } from 'react';
import { Tag, Plus, Check, Trash2, Sparkles, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon, AVAILABLE_ICONS, AVAILABLE_COLORS } from '../components/CategoryIcon';
import { TransactionType } from '../types/finance';

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [emoji, setEmoji] = useState('📌');
  const [color, setColor] = useState('#3B82F6');
  const [type, setType] = useState<TransactionType>('expense');

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === 'both' || c.type === filterType;
  });

  const handleOpenModal = () => {
    setName('');
    setIcon('Tag');
    setEmoji('📌');
    setColor('#3B82F6');
    setType('expense');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name: name.trim(),
      icon,
      emoji,
      color,
      type,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-400" />
            Categorias de Gastos & Receitas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie e crie categorias personalizadas com ícones e cores exclusivas
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Criar Categoria
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-white/10 text-white'
              : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Todas ({categories.length})
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'expense'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Gastos
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'income'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Receitas
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="p-3.5 rounded-2xl bg-[#121622]/90 border border-white/[0.07] flex items-center justify-between gap-3 group hover:border-white/15 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${cat.color}20`,
                  borderColor: cat.color,
                  color: cat.color,
                }}
              >
                <CategoryIcon icon={cat.icon} emoji={cat.emoji} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-500 block capitalize">
                  {cat.type === 'expense' ? 'Gasto' : 'Receita'}
                  {cat.isCustom ? ' · Personalizada' : ''}
                </span>
              </div>
            </div>

            {cat.isCustom && (
              <button
                onClick={() => deleteCategory(cat.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Excluir categoria personalizada"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create Custom Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#121622] border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Nova Categoria Personalizada
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
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Livros, Natação, Padaria Gourmet..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tipo de Movimentação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      type === 'expense'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-white/5 text-slate-400 border-white/5'
                    }`}
                  >
                    Gasto (Saída)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 border-white/5'
                    }`}
                  >
                    Receita (Entrada)
                  </button>
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Ícone Lucide
                </label>
                <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`h-9 rounded-lg flex items-center justify-center border transition-all ${
                        icon === ic
                          ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                      }`}
                      title={ic}
                    >
                      <CategoryIcon icon={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Cor de Destaque
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {AVAILABLE_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-transform hover:scale-105"
                      style={{ backgroundColor: col }}
                    >
                      {color === col && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
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
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
