import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  SlidersHorizontal,
  Bot,
  Info,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Plus,
  GitCompare,
} from 'lucide-react';
import { ScenarioConfig } from '../types/financial';

interface HeaderProps {
  currentScenario: ScenarioConfig;
  allScenarios: ScenarioConfig[];
  onSelectScenario: (scenario: ScenarioConfig) => void;
  onOpenLab: () => void;
  onOpenCompare: () => void;
  onNewScenario: () => void;
  onResetScenario: () => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  allScenarios,
  onSelectScenario,
  onOpenLab,
  onOpenCompare,
  onNewScenario,
  onResetScenario,
  isCopilotOpen,
  onToggleCopilot,
}) => {
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0E14]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identité */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-violet-600/20 border border-cyan-500/40 glow-cyan-sm">
              <span className="text-cyan-400 font-extrabold text-lg tracking-wider">L</span>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  LUCID
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono tracking-normal">
                    LABORATOIRE
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Intelligence prédictive de trésorerie & liquidité
              </p>
            </div>

            {/* Pastille Démo Données Fictives */}
            <button
              onClick={() => setShowDisclaimerModal(true)}
              className="group ml-2 sm:ml-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs transition-all cursor-pointer"
              title="Afficher les mentions sur la simulation"
            >
              <Info className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-medium">Démo — données financières fictives</span>
              <span className="md:hidden font-medium">Démo</span>
            </button>
          </div>

          {/* Centre / Sélecteur de scénario */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-sm text-slate-200 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="font-medium max-w-[210px] truncate">{currentScenario.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showScenarioMenu && (
                <div
                  className="absolute left-0 mt-2 w-80 rounded-xl bg-[#111622] border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Scénarios prédéfinis et sauvegardés
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {allScenarios.map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          onSelectScenario(sc);
                          setShowScenarioMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start justify-between cursor-pointer ${
                          sc.id === currentScenario.id
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                            : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{sc.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{sc.description}</div>
                        </div>
                        {sc.id === currentScenario.id && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShowScenarioMenu(false);
                        onNewScenario();
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium px-2 py-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nouveau plan vierge
                    </button>
                    <button
                      onClick={() => {
                        setShowScenarioMenu(false);
                        onResetScenario();
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 cursor-pointer"
                      title="Réinitialiser les valeurs par défaut du scénario"
                    >
                      <RotateCcw className="w-3 h-3" /> Réinitialiser
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'actions à droite */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton Comparer */}
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-xs sm:text-sm text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Comparer les scénarios côte à côte"
            >
              <GitCompare className="w-4 h-4 text-violet-400" />
              <span className="hidden sm:inline">Comparer</span>
            </button>

            {/* Bouton Laboratoire de scénarios */}
            <button
              onClick={onOpenLab}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Laboratoire</span>
            </button>

            {/* Bouton Copilote IA */}
            <button
              onClick={onToggleCopilot}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-all cursor-pointer ${
                isCopilotOpen
                  ? 'bg-violet-600/30 border-violet-500 text-violet-200 glow-violet-md'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-400 animate-spin-slow" />
              <span className="hidden sm:inline font-medium">Copilote</span>
              <span className="w-2 h-2 rounded-full bg-violet-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal Mentions Fictives */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-2xl bg-[#111622] border border-cyan-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-cyan-400 mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Environnement de simulation fictif</h3>
                <p className="text-xs text-slate-400">Prototype de démonstration & portfolio</p>
              </div>
            </div>

            <div className="text-sm text-slate-300 space-y-3 leading-relaxed mt-4">
              <p>
                <strong className="text-white">LUCID</strong> est un outil fintech interactif conçu pour simuler l’impact des décisions financières sur la trésorerie future et explorer des hypothèses de liquidité.
              </p>
              <p>
                L’ensemble des soldes de compte, salaires, charges récurrentes et transactions sont <strong className="text-cyan-300">rigoureusement fictifs</strong>. Aucune connexion bancaire réelle ni traitement de fonds véritables ne sont engagés.
              </p>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                Les projections reposent sur un moteur de calcul déterministe côté client et serveur, complété par les analyses stratégiques du modèle Gemini 3.8 Flash.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDisclaimerModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
