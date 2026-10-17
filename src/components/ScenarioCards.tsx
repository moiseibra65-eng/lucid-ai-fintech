import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { DeterministicCalculations, ScenarioConfig } from '../types/financial';
import { formatCurrency } from '../utils/engine';

interface ScenarioCardsProps {
  scenario: ScenarioConfig;
  calculations: DeterministicCalculations;
  onAskCopilot: (prompt: string) => void;
  onOpenLab: () => void;
}

export const ScenarioCards: React.FC<ScenarioCardsProps> = ({
  scenario,
  calculations,
  onAskCopilot,
  onOpenLab,
}) => {
  const [expandedCard, setExpandedCard] = useState<'conservative' | 'expected' | 'optimistic' | null>(null);

  const toggleExpand = (card: 'conservative' | 'expected' | 'optimistic') => {
    setExpandedCard((prev) => (prev === card ? null : card));
  };

  const { conservative, expected, optimistic } = calculations;
  const safetyFloor = scenario.safetyFloor;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Scénario Conservateur (Stress Test) */}
      <div
        className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all flex flex-col justify-between border ${
          conservative.minBalance < safetyFloor
            ? 'border-rose-500/40 hover:border-rose-500/60'
            : 'border-slate-700/60 hover:border-slate-600'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-500/15 border border-rose-500/30 text-rose-300">
              Scénario Conservateur
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Trajectoire sous contrainte avec volatilité des encaissements et inflation imprévue des charges.
          </p>

          <div className="space-y-3 font-mono">
            <div>
              <span className="text-xs text-slate-400 block font-sans">Solde final projeté</span>
              <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
                <span>{formatCurrency(conservative.endBalance)}</span>
                <span
                  className={`text-xs font-semibold ${
                    conservative.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {conservative.netDelta >= 0 ? '+' : ''}
                  {formatCurrency(conservative.netDelta)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Point le plus bas (Creux) :</span>
                <span
                  className={`font-bold ${
                    conservative.minBalance < safetyFloor
                      ? 'text-rose-400 font-extrabold'
                      : 'text-slate-200'
                  }`}
                >
                  {formatCurrency(conservative.minBalance)} ({conservative.minBalanceDate})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Statut du runway :</span>
                <span
                  className={`font-semibold ${
                    conservative.minBalance < safetyFloor ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {conservative.minBalance < safetyFloor ? 'Plancher de sécurité franchi' : 'Coussin de sécurité préservé'}
                </span>
              </div>
            </div>
          </div>

          {/* Panneau accordéon des hypothèses */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => toggleExpand('conservative')}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-rose-400" />
                Hypothèses de projection (Choc de -{scenario.sensitivity.conservativeIncomeShockPct} %)
              </span>
              {expandedCard === 'conservative' ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedCard === 'conservative' && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-rose-500/20 text-xs text-slate-300 space-y-1.5 leading-relaxed animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>
                    Décote sur revenus : -{scenario.sensitivity.conservativeIncomeShockPct} % de retards ou volatilité d'encaissement.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>
                    Dérive des coûts : +{scenario.sensitivity.conservativeExpenseCreepPct} % d'inflation et de dépenses imprévues.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>
                    Friction de précaution : 150 €/mois provisionnés pour l'entretien d'urgence.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => onAskCopilot('Explique les risques et le runway de mon scénario Conservateur.')}
            className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Demander un audit IA
          </button>
          <span className="text-[11px] text-slate-500 font-mono">Défensif</span>
        </div>
      </div>

      {/* 2. Scénario Attendu (Base / Recommandé) */}
      <div className="glass-panel-elevated rounded-2xl p-5 relative overflow-hidden transition-all flex flex-col justify-between border border-cyan-500/50 glow-cyan-sm">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20">
              Scénario Attendu (Base)
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Prévision la plus probable basée sur vos revenus réguliers, une inflation standard et vos engagements programmés.
          </p>

          <div className="space-y-3 font-mono">
            <div>
              <span className="text-xs text-slate-400 block font-sans">Solde final projeté</span>
              <div className="text-3xl font-extrabold text-cyan-300 flex items-baseline gap-2">
                <span>{formatCurrency(expected.endBalance)}</span>
                <span
                  className={`text-xs font-semibold ${
                    expected.netDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {expected.netDelta >= 0 ? '+' : ''}
                  {formatCurrency(expected.netDelta)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/25 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Point le plus bas (Creux) :</span>
                <span className="font-bold text-white">
                  {formatCurrency(expected.minBalance)} ({expected.minBalanceDate})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Accumulation nette de trésorerie :</span>
                <span className="font-semibold text-emerald-400">
                  +{formatCurrency(expected.totalInflow - expected.totalOutflow)}
                </span>
              </div>
            </div>
          </div>

          {/* Panneau accordéon des hypothèses */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => toggleExpand('expected')}
              className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Hypothèses de projection (Trajectoire standard)
              </span>
              {expandedCard === 'expected' ? (
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </button>

            {expandedCard === 'expected' && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/25 text-xs text-slate-300 space-y-1.5 leading-relaxed animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Exécution à 100 % dans les temps des flux de revenus programmés.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Inflation organique de base prise en compte à +0,2 % par mois cumulé.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    Achats simulés décaissés rigoureusement aux mois prévus.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => onAskCopilot('Explique les étapes clés de mon scénario Attendu.')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Expliquer le scénario attendu
          </button>
          <span className="text-[11px] text-cyan-400/80 font-mono">Plan de référence</span>
        </div>
      </div>

      {/* 3. Scénario Optimiste (Croissance & Opportunités) */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-500/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              Scénario Optimiste
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Trajectoire favorable intégrant des contrats de conseil, des primes et une optimisation des dépenses.
          </p>

          <div className="space-y-3 font-mono">
            <div>
              <span className="text-xs text-slate-400 block font-sans">Solde final projeté</span>
              <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
                <span>{formatCurrency(optimistic.endBalance)}</span>
                <span className="text-xs font-semibold text-emerald-400">
                  +{formatCurrency(optimistic.endBalance - expected.endBalance)} vs Attendu
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Pic de liquidité atteint :</span>
                <span className="font-bold text-emerald-400">
                  {formatCurrency(optimistic.maxBalance)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Excédent de réserve :</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(optimistic.endBalance - safetyFloor)} au-dessus du plancher
                </span>
              </div>
            </div>
          </div>

          {/* Panneau accordéon des hypothèses */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => toggleExpand('optimistic')}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Hypothèses de projection (+{scenario.sensitivity.optimisticIncomeBoostPct} % de dynamique)
              </span>
              {expandedCard === 'optimistic' ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedCard === 'optimistic' && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5 leading-relaxed animate-in fade-in duration-150">
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    Accélération des revenus : +{scenario.sensitivity.optimisticIncomeBoostPct} % via primes et contrats additionnels.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    Optimisation discrétionnaire : -{scenario.sensitivity.optimisticExpenseCutPct} % d'économies sur les dépenses variables.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Réinvestissement des surplus pour consolider le fonds de sécurité.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => onAskCopilot('Quels sont les leviers pour atteindre le scénario Optimiste ?')}
            className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Leviers de croissance
          </button>
          <span className="text-[11px] text-slate-500 font-mono">Potentiel haussier</span>
        </div>
      </div>
    </div>
  );
};
