import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  GitCompare,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Wallet,
  RotateCcw,
  Download,
  AlertTriangle,
  Info,
  DollarSign,
} from 'lucide-react';
import { ScenarioConfig } from './types/financial';
import {
  calculateDeterministicScenario,
  formatCurrency,
  PRESET_SCENARIOS,
} from './utils/engine';
import { Header } from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { InteractiveCashflowChart } from './components/InteractiveCashflowChart';
import { ScenarioCards } from './components/ScenarioCards';
import { ScenarioLabModal } from './components/ScenarioLabModal';
import { CompareScenariosModal } from './components/CompareScenariosModal';
import { AiCopilotPanel } from './components/AiCopilotPanel';

const LOCAL_STORAGE_KEY = 'lucid_fintech_scenarios_fr_v1';

export default function App() {
  // Chargement des scénarios sauvegardés ou des préréglages français
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Impossible de charger depuis localStorage, utilisation des préréglages', e);
    }
    return PRESET_SCENARIOS;
  });

  const [currentScenarioId, setCurrentScenarioId] = useState<string>(
    scenarios[0]?.id || PRESET_SCENARIOS[0].id
  );

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenarios));
    } catch (e) {
      console.warn('Impossible de sauvegarder dans localStorage', e);
    }
  }, [scenarios]);

  const currentScenario = useMemo(() => {
    const found = scenarios.find((s) => s.id === currentScenarioId);
    return found || scenarios[0] || PRESET_SCENARIOS[0];
  }, [scenarios, currentScenarioId]);

  const calculations = useMemo(() => {
    return calculateDeterministicScenario(currentScenario);
  }, [currentScenario]);

  // États d'interface
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [externalCopilotPrompt, setExternalCopilotPrompt] = useState<string | null>(null);

  // Formulaire rapide d'achat sur le tableau de bord
  const [quickPurchaseTitle, setQuickPurchaseTitle] = useState('');
  const [quickPurchaseAmount, setQuickPurchaseAmount] = useState('');
  const [quickPurchaseMonth, setQuickPurchaseMonth] = useState('2');

  const handleUpdateScenario = (updated: ScenarioConfig) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : s))
    );
  };

  const handleSaveAsNewScenario = (name: string, draft: ScenarioConfig) => {
    const newSc: ScenarioConfig = {
      ...draft,
      id: `sc-custom-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: false,
    };
    setScenarios((prev) => [newSc, ...prev]);
    setCurrentScenarioId(newSc.id);
  };

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    if (currentScenarioId === id) {
      const remaining = scenarios.filter((s) => s.id !== id);
      setCurrentScenarioId(remaining[0]?.id || PRESET_SCENARIOS[0].id);
    }
  };

  const handleResetCurrentScenario = () => {
    const matchingPreset = PRESET_SCENARIOS.find((p) => p.id === currentScenario.id);
    if (matchingPreset) {
      handleUpdateScenario({ ...matchingPreset });
    } else {
      handleUpdateScenario({
        ...currentScenario,
        purchases: [],
        startingBalance: 38450,
        safetyFloor: 15000,
      });
    }
  };

  const handleResetAllToFactory = () => {
    setScenarios(PRESET_SCENARIOS);
    setCurrentScenarioId(PRESET_SCENARIOS[0].id);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      // ignorer
    }
  };

  const handleAskCopilot = (prompt: string) => {
    setExternalCopilotPrompt(prompt);
    setIsCopilotOpen(true);
  };

  const handleQuickAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(quickPurchaseAmount);
    if (!quickPurchaseTitle.trim() || isNaN(amt) || amt <= 0) return;

    const newPurchase = {
      id: `purch-${Date.now()}`,
      title: quickPurchaseTitle.trim(),
      amount: amt,
      targetMonth: parseInt(quickPurchaseMonth, 10) || 2,
      category: 'other' as const,
      paymentType: 'lump_sum' as const,
      active: true,
    };

    const updated: ScenarioConfig = {
      ...currentScenario,
      purchases: [newPurchase, ...currentScenario.purchases],
    };

    handleUpdateScenario(updated);
    setQuickPurchaseTitle('');
    setQuickPurchaseAmount('');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Barre de navigation supérieure */}
      <Header
        currentScenario={currentScenario}
        allScenarios={scenarios}
        onSelectScenario={(s) => setCurrentScenarioId(s.id)}
        onOpenLab={() => setIsLabOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onNewScenario={() => {
          handleSaveAsNewScenario('Nouvelle simulation personnalisée', {
            ...PRESET_SCENARIOS[1],
            name: 'Nouvelle simulation personnalisée',
            description: 'Scénario personnalisé créé dans le laboratoire.',
            isDefault: false,
          });
          setIsLabOpen(true);
        }}
        onResetScenario={handleResetCurrentScenario}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
      />

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bannière de bienvenue & Synthèse du scénario */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#121828] via-[#0E1320] to-[#15112B] border border-cyan-500/20 glow-cyan-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                  SIMULATEUR DE PORTEFEUILLE
                </span>
                <span className="text-xs text-slate-400">
                  Profil : Elena Vance (Architecte systèmes d'entreprise)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Simulez vos décisions. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Maîtrisez votre trésorerie future.</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Scénario actif : <strong className="text-white">{currentScenario.name}</strong>. {currentScenario.description}
              </p>
            </div>

            {/* Boutons d'action rapide */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsLabOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Ouvrir le laboratoire</span>
              </button>

              <button
                onClick={() => handleAskCopilot('Puis-je me permettre mes décisions prévues en toute sécurité ?')}
                className="px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Consulter le Copilote</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4 Cartes métriques financières clés */}
        <section aria-label="Indicateurs financiers clés">
          <OverviewCards
            scenario={currentScenario}
            calculations={calculations}
            onOpenLab={() => setIsLabOpen(true)}
          />
        </section>

        {/* Formulaire rapide "Simuler un achat à venir" */}
        <section className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Simuler un achat à venir
                  <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-500/10 px-2 py-0.5 rounded">
                    Calcul instantané
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Intégrez un engagement financier pour recalculer immédiatement la trajectoire de trésorerie.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleQuickAddPurchase}
              className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto"
            >
              <input
                type="text"
                placeholder="Objet (ex. Station de travail M4 Max)"
                value={quickPurchaseTitle}
                onChange={(e) => setQuickPurchaseTitle(e.target.value)}
                className="flex-1 sm:w-56 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

              <div className="relative w-28">
                <span className="text-cyan-400 absolute left-2 top-1.5 font-mono font-bold text-xs">€</span>
                <input
                  type="number"
                  placeholder="3200"
                  min="1"
                  step="50"
                  value={quickPurchaseAmount}
                  onChange={(e) => setQuickPurchaseAmount(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <select
                value={quickPurchaseMonth}
                onChange={(e) => setQuickPurchaseMonth(e.target.value)}
                className="w-28 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="1">Mois 1</option>
                <option value="2">Mois 2</option>
                <option value="3">Mois 3</option>
                <option value="4">Mois 4</option>
                <option value="6">Mois 6</option>
                <option value="12">Mois 12</option>
              </select>

              <button
                type="submit"
                disabled={!quickPurchaseTitle || !quickPurchaseAmount}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
              >
                Simuler
              </button>
            </form>
          </div>
        </section>

        {/* Graphique interactif de trésorerie */}
        <section aria-label="Graphique interactif des flux de trésorerie">
          <InteractiveCashflowChart
            scenario={currentScenario}
            calculations={calculations}
            onUpdateHorizon={(h) => handleUpdateScenario({ ...currentScenario, horizonMonths: h })}
            onOpenLab={() => setIsLabOpen(true)}
          />
        </section>

        {/* Cartes des trois piliers de scénarios : Conservateur, Attendu, Optimiste */}
        <section aria-label="Cartes des trajectoires de scénarios">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Analyse comparative des trois trajectoires
              </h2>
              <p className="text-xs text-slate-400">
                Comparaison quantitative rigoureuse entre résultats sous contrainte, cas de référence et potentiel de croissance.
              </p>
            </div>
            <button
              onClick={() => setIsLabOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Modifier les hypothèses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ScenarioCards
            scenario={currentScenario}
            calculations={calculations}
            onAskCopilot={handleAskCopilot}
            onOpenLab={() => setIsLabOpen(true)}
          />
        </section>

        {/* Barre de gestion des scénarios sauvegardés */}
        <section className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>
              Scénarios enregistrés : <strong className="text-white">{scenarios.length}</strong> disponibles dans le stockage local.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAllToFactory}
              className="hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Réinitialiser tous les scénarios aux préréglages d'usine"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les préréglages d'usine</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentScenario, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', `${currentScenario.name.toLowerCase().replace(/\s+/g, '_')}_scenario.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter le scénario en JSON</span>
            </button>
          </div>
        </section>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-white/5 bg-[#080B10] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">LUCID</span>
            <span>— Laboratoire de scénarios financiers par IA</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400/80">Démo : Données fictives uniquement</span>
          </div>
          <div>
            Conçu avec des algorithmes mathématiques déterministes et l'intelligence de Gemini 3.8 Flash.
          </div>
        </div>
      </footer>

      {/* Modal du laboratoire de scénarios */}
      <ScenarioLabModal
        scenario={currentScenario}
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        onSaveScenario={handleUpdateScenario}
        onSaveAsNew={handleSaveAsNewScenario}
        onResetToDefaults={handleResetCurrentScenario}
      />

      {/* Modal de comparaison des scénarios */}
      <CompareScenariosModal
        scenarios={scenarios}
        currentScenarioId={currentScenario.id}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectScenario={(s) => setCurrentScenarioId(s.id)}
        onDeleteScenario={handleDeleteScenario}
      />

      {/* Tiroir latéral persistant du Copilote IA */}
      <AiCopilotPanel
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        scenario={currentScenario}
        calculations={calculations}
        externalPrompt={externalCopilotPrompt}
        onClearExternalPrompt={() => setExternalCopilotPrompt(null)}
      />
    </div>
  );
}
