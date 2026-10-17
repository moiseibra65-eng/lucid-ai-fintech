import React, { useState } from 'react';
import {
  X,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { ScenarioConfig } from '../types/financial';
import { calculateDeterministicScenario, formatCurrency } from '../utils/engine';

interface CompareScenariosModalProps {
  scenarios: ScenarioConfig[];
  currentScenarioId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: ScenarioConfig) => void;
  onDeleteScenario: (id: string) => void;
}

export const CompareScenariosModal: React.FC<CompareScenariosModalProps> = ({
  scenarios,
  currentScenarioId,
  isOpen,
  onClose,
  onSelectScenario,
  onDeleteScenario,
}) => {
  if (!isOpen) return null;

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const defaultIds = [currentScenarioId];
    for (const sc of scenarios) {
      if (defaultIds.length >= 3) break;
      if (!defaultIds.includes(sc.id)) defaultIds.push(sc.id);
    }
    return defaultIds;
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[1], selectedIds[2], id]);
      }
    }
  };

  const comparedScenarios = scenarios.filter((s) => selectedIds.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0D121D] border border-violet-500/30 shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Matrice comparative des scénarios</h3>
              <p className="text-xs text-slate-400">
                Évaluez les arbitrages, les creux de trésorerie et les capitaux finaux côte à côte.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélecteur de scénarios à comparer */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Sélectionnez jusqu'à 3 scénarios à comparer :</span>
          {scenarios.map((sc) => {
            const isSelected = selectedIds.includes(sc.id);
            return (
              <button
                key={sc.id}
                onClick={() => toggleSelect(sc.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600/30 border border-violet-500 text-violet-200'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{sc.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
              </button>
            );
          })}
        </div>

        {/* Tableau comparatif */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparedScenarios.map((sc) => {
              const calcs = calculateDeterministicScenario(sc);
              const totalPurchases = sc.purchases
                .filter((p) => p.active)
                .reduce((sum, p) => sum + p.amount, 0);

              const isCurrent = sc.id === currentScenarioId;
              const conTrough = calcs.conservative.minBalance;
              const isBreach = conTrough < sc.safetyFloor;

              return (
                <div
                  key={sc.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-slate-900/90 border-cyan-500/50 glow-cyan-sm'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-bold text-white text-base flex items-center gap-1.5">
                          <span>{sc.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-mono">
                              Actif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{sc.description}</p>
                      </div>

                      {!sc.isDefault && (
                        <button
                          onClick={() => onDeleteScenario(sc.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Supprimer ce scénario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 space-y-3 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] font-sans block">
                          Solde final attendu à horizon
                        </span>
                        <div className="text-xl font-extrabold text-cyan-300">
                          {formatCurrency(calcs.expected.endBalance)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Trajectoire nette : {calcs.expected.netDelta >= 0 ? '+' : ''}
                          {formatCurrency(calcs.expected.netDelta)}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">Solde initial :</span>
                          <span className="text-slate-200 font-bold">
                            {formatCurrency(sc.startingBalance)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">Engagements simulés :</span>
                          <span className="text-slate-200 font-bold">
                            {formatCurrency(totalPurchases)} ({sc.purchases.filter((p) => p.active).length} dépenses)
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">Creux (Conservateur) :</span>
                          <span
                            className={`font-bold ${
                              isBreach ? 'text-rose-400 font-extrabold' : 'text-slate-200'
                            }`}
                          >
                            {formatCurrency(conTrough)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">Plancher de sécurité :</span>
                          <span className="text-amber-400 font-bold">
                            {formatCurrency(sc.safetyFloor)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                          <span className="text-slate-400 font-sans">Évaluation de liquidité :</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold flex items-center gap-1 ${
                              isBreach
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isBreach ? (
                              <>
                                <AlertTriangle className="w-3 h-3 text-rose-400" /> Vigilance
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Robuste
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                    {!isCurrent ? (
                      <button
                        onClick={() => {
                          onSelectScenario(sc);
                          onClose();
                        }}
                        className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Passer à ce scénario</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="text-center w-full text-xs text-cyan-400 font-semibold py-1">
                        Plan actuellement actif
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-5 py-3.5 bg-[#111726] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Fermer la matrice
          </button>
        </div>
      </div>
    </div>
  );
};
