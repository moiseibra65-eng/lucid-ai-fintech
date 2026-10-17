import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Save,
  RotateCcw,
  Tag,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  ExpenseItem,
  IncomeStream,
  PurchaseCategory,
  PurchaseItem,
  ScenarioConfig,
} from '../types/financial';
import { formatCurrency, getMonthDate } from '../utils/engine';

interface ScenarioLabModalProps {
  scenario: ScenarioConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveScenario: (updated: ScenarioConfig) => void;
  onSaveAsNew: (name: string, updated: ScenarioConfig) => void;
  onResetToDefaults: () => void;
}

export const ScenarioLabModal: React.FC<ScenarioLabModalProps> = ({
  scenario,
  isOpen,
  onClose,
  onSaveScenario,
  onSaveAsNew,
  onResetToDefaults,
}) => {
  if (!isOpen) return null;

  // État local de travail
  const [draft, setDraft] = useState<ScenarioConfig>({
    ...scenario,
    purchases: scenario.purchases.map((p) => ({ ...p })),
    incomeStreams: scenario.incomeStreams.map((i) => ({ ...i })),
    expenses: scenario.expenses.map((e) => ({ ...e })),
    sensitivity: { ...scenario.sensitivity },
  });

  const [activeTab, setActiveTab] = useState<'purchases' | 'income' | 'expenses' | 'sensitivity'>('purchases');
  const [saveAsModalOpen, setSaveAsModalOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Formulaire d'ajout d'achat
  const [newPurchaseTitle, setNewPurchaseTitle] = useState('');
  const [newPurchaseAmount, setNewPurchaseAmount] = useState<number | ''>('');
  const [newPurchaseMonth, setNewPurchaseMonth] = useState<number>(2);
  const [newPurchaseCategory, setNewPurchaseCategory] = useState<PurchaseCategory>('tech');
  const [newPurchaseType, setNewPurchaseType] = useState<'lump_sum' | 'installments'>('lump_sum');
  const [newPurchaseInstallments, setNewPurchaseInstallments] = useState<number>(6);

  // Gestionnaires de validation
  const handleStartingBalanceChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val) || val < 0) {
      setValidationError('Le solde initial doit être un nombre positif ou nul.');
    } else {
      setValidationError(null);
      setDraft((prev) => {
        const next = { ...prev, startingBalance: val };
        onSaveScenario(next);
        return next;
      });
    }
  };

  const handleSafetyFloorChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val) && val >= 0) {
      setDraft((prev) => {
        const next = { ...prev, safetyFloor: val };
        onSaveScenario(next);
        return next;
      });
    }
  };

  // Ajout d'achat simulé
  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchaseTitle.trim()) {
      setValidationError("L'intitulé de l'achat est obligatoire.");
      return;
    }
    const amt = typeof newPurchaseAmount === 'number' ? newPurchaseAmount : parseFloat(newPurchaseAmount);
    if (isNaN(amt) || amt <= 0) {
      setValidationError('Veuillez saisir un montant valide et strictement positif.');
      return;
    }

    const item: PurchaseItem = {
      id: `purch-${Date.now()}`,
      title: newPurchaseTitle.trim(),
      amount: amt,
      targetMonth: newPurchaseMonth,
      category: newPurchaseCategory,
      paymentType: newPurchaseType,
      installmentsCount: newPurchaseType === 'installments' ? newPurchaseInstallments : undefined,
      active: true,
    };

    const nextPurchases = [item, ...draft.purchases];
    const updated = { ...draft, purchases: nextPurchases };
    setDraft(updated);
    onSaveScenario(updated);

    setNewPurchaseTitle('');
    setNewPurchaseAmount('');
    setValidationError(null);
  };

  const injectPresetPurchase = (title: string, amount: number, category: PurchaseCategory, month = 2) => {
    const item: PurchaseItem = {
      id: `purch-${Date.now()}`,
      title,
      amount,
      targetMonth: month,
      category,
      paymentType: 'lump_sum',
      active: true,
    };
    const nextPurchases = [item, ...draft.purchases];
    const updated = { ...draft, purchases: nextPurchases };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const togglePurchaseActive = (id: string) => {
    const next = draft.purchases.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    const updated = { ...draft, purchases: next };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const deletePurchase = (id: string) => {
    const next = draft.purchases.filter((p) => p.id !== id);
    const updated = { ...draft, purchases: next };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const updateIncomeAmount = (id: string, amount: number) => {
    const next = draft.incomeStreams.map((i) => (i.id === id ? { ...i, amount: Math.max(0, amount) } : i));
    const updated = { ...draft, incomeStreams: next };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const toggleIncomeActive = (id: string) => {
    const next = draft.incomeStreams.map((i) => (i.id === id ? { ...i, active: !i.active } : i));
    const updated = { ...draft, incomeStreams: next };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const updateExpenseAmount = (id: string, amount: number) => {
    const next = draft.expenses.map((e) => (e.id === id ? { ...e, amount: Math.max(0, amount) } : e));
    const updated = { ...draft, expenses: next };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const toggleExpenseActive = (id: string) => {
    const next = draft.expenses.map((e) => (e.id === id ? { ...e, active: !e.active } : e));
    const updated = { ...draft, expenses: next };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const adjustAllExpenses = (factor: number) => {
    const next = draft.expenses.map((e) => ({
      ...e,
      amount: Math.round(e.amount * factor),
    }));
    const updated = { ...draft, expenses: next };
    setDraft(updated);
    onSaveScenario(updated);
  };

  const updateSensitivity = (key: keyof typeof draft.sensitivity, value: number) => {
    const nextSens = { ...draft.sensitivity, [key]: value };
    const updated = { ...draft, sensitivity: nextSens };
    setDraft(updated);
    onSaveScenario(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0D121D] border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* En-tête du modal */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Laboratoire de scénarios</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                  Calculateur en temps réel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulez des achats, modulez vos rentrées, ajustez vos charges et inspectez les variations immédiates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewScenarioName(`${draft.name} (Personnalisé)`);
                setSaveAsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enregistrer sous</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paramètres clés : Solde initial & Plancher de réserve */}
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Solde liquide initial (€)</label>
            <div className="relative">
              <span className="text-cyan-400 absolute left-2.5 top-2 font-mono font-bold">€</span>
              <input
                type="number"
                min="0"
                step="500"
                value={draft.startingBalance}
                onChange={(e) => handleStartingBalanceChange(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Plancher de sécurité (€)</label>
            <div className="relative">
              <span className="text-amber-400 absolute left-2.5 top-2 font-mono font-bold">€</span>
              <input
                type="number"
                min="0"
                step="500"
                value={draft.safetyFloor}
                onChange={(e) => handleSafetyFloorChange(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Horizon temporel de simulation</label>
            <div className="grid grid-cols-4 gap-1">
              {([3, 6, 12, 24] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    const updated = { ...draft, horizonMonths: h };
                    setDraft(updated);
                    onSaveScenario(updated);
                  }}
                  className={`py-1.5 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                    draft.horizonMonths === h
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {h}M
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message d'erreur de validation */}
        {validationError && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="px-5 pt-3 border-b border-slate-800 flex gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'purchases'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Simuler des dépenses</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
              {draft.purchases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={`pb-3 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'income'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Flux de revenus attendus</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
              {draft.incomeStreams.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'expenses'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Charges récurrentes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
              {draft.expenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`pb-3 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'sensitivity'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Sensibilité & Stress tests</span>
          </button>
        </div>

        {/* Zone de contenu des onglets */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ONGLET 1 : DÉPENSES SIMULÉES */}
          {activeTab === 'purchases' && (
            <div className="space-y-5">
              {/* Formulaire d'ajout d'achat */}
              <form
                onSubmit={handleAddPurchase}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Simuler un nouvel achat ou engagement
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Intitulé de l'achat</label>
                    <input
                      type="text"
                      placeholder="ex. Station de travail M4 Max"
                      value={newPurchaseTitle}
                      onChange={(e) => setNewPurchaseTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Montant total (€)</label>
                    <div className="relative">
                      <span className="text-cyan-400 absolute left-2.5 top-2 font-mono font-bold">€</span>
                      <input
                        type="number"
                        min="1"
                        step="50"
                        placeholder="3500"
                        value={newPurchaseAmount}
                        onChange={(e) =>
                          setNewPurchaseAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                        }
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Échéance cible (Mois)</label>
                    <select
                      value={newPurchaseMonth}
                      onChange={(e) => setNewPurchaseMonth(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                    >
                      {Array.from({ length: draft.horizonMonths }, (_, i) => i + 1).map((m) => {
                        const { label } = getMonthDate(m);
                        return (
                          <option key={m} value={m}>
                            Mois {m} ({label})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Catégorie</label>
                    <select
                      value={newPurchaseCategory}
                      onChange={(e) => setNewPurchaseCategory(e.target.value as PurchaseCategory)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="tech">Technologie & Matériel</option>
                      <option value="vehicle">Véhicule & Mobilité</option>
                      <option value="real_estate">Immobilier & Logement</option>
                      <option value="travel">Voyage & Déménagement</option>
                      <option value="education">Formation & Carrière</option>
                      <option value="investment">Investissement en capital</option>
                      <option value="other">Dépense discrétionnaire / Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Modalité de paiement</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewPurchaseType('lump_sum')}
                        className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                          newPurchaseType === 'lump_sum'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        Comptant
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPurchaseType('installments')}
                        className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                          newPurchaseType === 'installments'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        Mensualités
                      </button>
                    </div>
                  </div>

                  {newPurchaseType === 'installments' ? (
                    <div>
                      <label className="block text-slate-400 mb-1">Nombre de mensualités</label>
                      <select
                        value={newPurchaseInstallments}
                        onChange={(e) => setNewPurchaseInstallments(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      >
                        <option value={3}>3 mensualités</option>
                        <option value={6}>6 mensualités</option>
                        <option value={10}>10 mensualités</option>
                        <option value={12}>12 mensualités</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                      >
                        Ajouter à la simulation
                      </button>
                    </div>
                  )}
                </div>

                {newPurchaseType === 'installments' && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                    >
                      Ajouter l'achat échelonné
                    </button>
                  </div>
                )}
              </form>

              {/* Raccourcis d'essais rapides */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400">Achats d'essai rapides :</span>
                <button
                  type="button"
                  onClick={() => injectPresetPurchase('Station Studio M4 Max', 3800, 'tech', 2)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  + 3,8 k€ Station M4
                </button>
                <button
                  type="button"
                  onClick={() => injectPresetPurchase('Expédition voyage & séjour', 4200, 'travel', 4)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  + 4,2 k€ Voyage
                </button>
                <button
                  type="button"
                  onClick={() => injectPresetPurchase('Acompte rénovation logement', 6500, 'real_estate', 3)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  + 6,5 k€ Rénovation
                </button>
              </div>

              {/* Liste des achats simulés */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Achats simulés en cours ({draft.purchases.length})</span>
                  <span className="text-cyan-400 lowercase">cochez/décochez pour mesurer l'impact immédiat</span>
                </div>

                {draft.purchases.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                    Aucun achat simulé pour l'instant. Utilisez le formulaire ci-dessus pour modéliser une décision financière.
                  </div>
                ) : (
                  draft.purchases.map((p) => {
                    const { label } = getMonthDate(p.targetMonth);
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                          p.active
                            ? 'bg-slate-900/80 border-slate-700/80'
                            : 'bg-slate-950/50 border-slate-800/40 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={p.active}
                            onChange={() => togglePurchaseActive(p.id)}
                            className="w-4 h-4 rounded text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{p.title}</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 uppercase">
                                {p.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>
                                Mois {p.targetMonth} ({label})
                              </span>
                              <span>•</span>
                              <span>
                                {p.paymentType === 'lump_sum'
                                  ? 'Paiement comptant'
                                  : `${p.installmentsCount || 6} mensualités`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-cyan-300">
                            {formatCurrency(p.amount)}
                          </span>
                          <button
                            onClick={() => deletePurchase(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Supprimer la dépense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ONGLET 2 : FLUX DE REVENUS */}
          {activeTab === 'income' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Ajustez vos salaires réguliers et vos honoraires de conseil. Toute modification se répercute instantanément sur les calculs déterministes.
              </div>

              <div className="space-y-2.5">
                {draft.incomeStreams.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={inc.active}
                        onChange={() => toggleIncomeActive(inc.id)}
                        className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-semibold text-white">{inc.title}</div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                          {inc.category} • {inc.frequency === 'monthly' ? 'mensuel' : inc.frequency}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative w-36">
                        <span className="text-emerald-400 absolute left-2 top-1.5 font-mono font-bold">€</span>
                        <input
                          type="number"
                          step="100"
                          value={inc.amount}
                          onChange={(e) => updateIncomeAmount(inc.id, parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <span className="text-slate-400">/mois</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 3 : CHARGES RÉCURRENTES */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-slate-400">Charges fixes de logement, alimentation et abonnements :</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustAllExpenses(1.1)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-300 font-medium cursor-pointer"
                  >
                    +10 % Stress global
                  </button>
                  <button
                    onClick={() => adjustAllExpenses(0.9)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-300 font-medium cursor-pointer"
                  >
                    -10 % Optimisation frugale
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {draft.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={exp.active}
                        onChange={() => toggleExpenseActive(exp.id)}
                        className="w-4 h-4 rounded text-cyan-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-semibold text-white">{exp.title}</div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                          {exp.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative w-36">
                        <span className="text-rose-400 absolute left-2 top-1.5 font-mono font-bold">€</span>
                        <input
                          type="number"
                          step="50"
                          value={exp.amount}
                          onChange={(e) => updateExpenseAmount(exp.id, parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-400"
                        />
                      </div>
                      <span className="text-slate-400">/mois</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET 4 : SENSIBILITÉ ET STRESS TESTS */}
          {activeTab === 'sensitivity' && (
            <div className="space-y-5 text-xs">
              <p className="text-slate-400">
                Paramétrez les coefficients de stress test conservateurs et les facteurs de hausse optimistes.
              </p>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Facteurs de stress test conservateurs
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-300">Volatilité / Choc sur revenus :</span>
                    <span className="font-mono font-bold text-rose-400">
                      -{draft.sensitivity.conservativeIncomeShockPct} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={draft.sensitivity.conservativeIncomeShockPct}
                    onChange={(e) =>
                      updateSensitivity('conservativeIncomeShockPct', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-300">Dérive des coûts / Inflation :</span>
                    <span className="font-mono font-bold text-rose-400">
                      +{draft.sensitivity.conservativeExpenseCreepPct} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={draft.sensitivity.conservativeExpenseCreepPct}
                    onChange={(e) =>
                      updateSensitivity('conservativeExpenseCreepPct', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Facteurs de croissance optimistes
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-300">Primes / Accélération des revenus :</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{draft.sensitivity.optimisticIncomeBoostPct} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={draft.sensitivity.optimisticIncomeBoostPct}
                    onChange={(e) =>
                      updateSensitivity('optimisticIncomeBoostPct', parseInt(e.target.value, 10))
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page du modal */}
        <div className="px-5 py-3.5 bg-[#111726] border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser aux valeurs d'origine</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Terminé
            </button>
          </div>
        </div>

        {/* Modal "Enregistrer sous" */}
        {saveAsModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="max-w-md w-full rounded-2xl bg-[#111622] border border-cyan-500/40 p-5 shadow-2xl">
              <h4 className="text-base font-bold text-white mb-2">Enregistrer une copie du scénario</h4>
              <p className="text-xs text-slate-400 mb-3">
                Conservez ce scénario dans votre stockage local avec ses paramètres d'achats et ses hypothèses spécifiques.
              </p>

              <input
                type="text"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="Nom du scénario"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400 mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSaveAsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (newScenarioName.trim()) {
                      onSaveAsNew(newScenarioName.trim(), draft);
                      setSaveAsModalOpen(false);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Enregistrer le scénario
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
