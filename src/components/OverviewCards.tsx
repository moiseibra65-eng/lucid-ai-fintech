import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { DeterministicCalculations, ScenarioConfig } from '../types/financial';
import { formatCurrency } from '../utils/engine';

interface OverviewCardsProps {
  scenario: ScenarioConfig;
  calculations: DeterministicCalculations;
  onOpenLab: () => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  scenario,
  calculations,
  onOpenLab,
}) => {
  const activeIncome = scenario.incomeStreams
    .filter((i) => i.active)
    .reduce((sum, item) => sum + item.amount, 0);

  const activeExpenses = scenario.expenses
    .filter((e) => e.active)
    .reduce((sum, item) => sum + item.amount, 0);

  const netMonthly = activeIncome - activeExpenses;
  const expTrough = calculations.expected.minBalance;
  const conTrough = calculations.conservative.minBalance;
  const safetyFloor = scenario.safetyFloor;

  const isSafe = conTrough >= safetyFloor;
  const isModerate = expTrough >= safetyFloor && conTrough < safetyFloor;

  const activePurchasesTotal = scenario.purchases
    .filter((p) => p.active)
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Solde liquide initial */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-600/70 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Solde liquide initial</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(scenario.startingBalance)}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
          <span className="text-slate-400">Plancher de sécurité :</span>
          <span className="font-mono font-medium text-slate-300">
            {formatCurrency(scenario.safetyFloor)}
          </span>
        </div>
      </div>

      {/* 2. Flux de trésorerie mensuel */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-600/70 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Flux net mensuel</span>
          <div
            className={`p-2 rounded-xl border ${
              netMonthly >= 0
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {netMonthly >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              netMonthly >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netMonthly >= 0 ? '+' : ''}
            {formatCurrency(netMonthly)}
            <span className="text-xs font-normal text-slate-400 ml-1">/mois</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
          <span className="flex items-center gap-1 text-slate-400">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            {formatCurrency(activeIncome)} entrées
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <ArrowDownRight className="w-3 h-3 text-rose-400" />
            {formatCurrency(activeExpenses)} sorties
          </span>
        </div>
      </div>

      {/* 3. Point le plus bas (Creux) */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-600/70 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Point le plus bas (Creux)
          </span>
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {formatCurrency(calculations.expected.minBalance)}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
            {calculations.expected.minBalanceDate}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
          <span className="text-slate-400">Creux conservateur :</span>
          <span
            className={`font-mono font-medium ${
              conTrough < safetyFloor ? 'text-amber-400 font-bold' : 'text-slate-300'
            }`}
          >
            {formatCurrency(conTrough)} ({calculations.conservative.minBalanceDate})
          </span>
        </div>
      </div>

      {/* 4. Santé de la liquidité & Alerte */}
      <div
        className={`glass-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden group transition-all border ${
          isSafe
            ? 'border-emerald-500/30'
            : isModerate
            ? 'border-amber-500/30'
            : 'border-rose-500/30'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Santé de la liquidité</span>
          <div
            className={`p-2 rounded-xl border ${
              isSafe
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : isModerate
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {isSafe ? (
              <ShieldCheck className="w-4 h-4" />
            ) : isModerate ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isSafe
                  ? 'text-emerald-400'
                  : isModerate
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {isSafe ? 'Coussin sécurisé' : isModerate ? 'Prudence requise' : 'Risque de déficit'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSafe
                ? 'Réserve préservée sur les 3 scénarios'
                : isModerate
                ? 'Le scénario conservateur franchit le plancher'
                : 'Le solde projeté passe sous le plancher de réserve'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
          <span className="text-slate-400">Engagements simulés :</span>
          <button
            onClick={onOpenLab}
            className="flex items-center gap-1 font-mono font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            {formatCurrency(activePurchasesTotal)}
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
