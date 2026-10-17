import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CopilotChatMessage, DeterministicCalculations, ScenarioConfig } from '../types/financial';
import { formatCurrency } from '../utils/engine';

interface AiCopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ScenarioConfig;
  calculations: DeterministicCalculations;
  onQuickPrompt?: (prompt: string) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export const AiCopilotPanel: React.FC<AiCopilotPanelProps> = ({
  isOpen,
  onClose,
  scenario,
  calculations,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<CopilotChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Bienvenue sur le **Copilote LUCID**\n\nJe suis votre stratège financier prédictif. L'ensemble des chiffres est calculé avec rigueur mathématique par le moteur déterministe de LUCID, sans aucune invention artificielle.\n\nPosez-moi vos questions sur **"${scenario.name}"** ou sélectionnez l'une des requêtes suggérées ci-dessous pour évaluer l'accessibilité de vos achats, vos creux de trésorerie et vos marges de sécurité.`,
      timestamp: 'À l’instant',
      mode: 'demo',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'gemini' | 'demo'>('gemini');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalPrompt) {
      sendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: CopilotChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          scenario,
          calculations,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Le serveur a renvoyé ${response.status}`);
      }

      const data = await response.json();
      setActiveMode(data.mode || 'demo');

      const botMsg: CopilotChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        mode: data.mode,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Erreur Copilot :', err);
      const errorMsg: CopilotChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `### Synthèse du moteur de simulation\n\nD'après les calculs déterministes pour **${scenario.name}** :\n- **Solde final attendu :** ${formatCurrency(calculations.expected.endBalance)}\n- **Point le plus bas (creux) :** ${formatCurrency(calculations.expected.minBalance)} (${calculations.expected.minBalanceDate})\n- **Statut du plancher de sécurité :** ${calculations.conservative.minBalance < scenario.safetyFloor ? 'Franchi dans le scénario Conservateur' : 'Préservé sur l’ensemble des trajectoires'}.\n\n*(Service IA externe indisponible ; réponse générée par l'évaluateur mathématique local)*`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        mode: 'demo',
      };
      setMessages((prev) => [...prev, errorMsg]);
      setActiveMode('demo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickQuestions = [
    'Puis-je me permettre cet achat en toute sécurité ?',
    'Quand mon solde atteindra-t-il son niveau le plus bas ?',
    'Comparer le scénario Conservateur et le scénario Attendu',
    'Combien de mois d’autonomie en cas de crise ?',
    'Que se passe-t-il si mes dépenses augmentent de 500 € ?',
  ];

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Panneau stratégique du Copilote IA LUCID"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-[#0B0E14]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
    >
      {/* En-tête du Copilote */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#111726]/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 glow-violet-md">
            <Sparkles className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Copilote IA LUCID</h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                  activeMode === 'gemini'
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}
              >
                {activeMode === 'gemini' ? 'Gemini 3.8 Flash' : 'Démo déterministe'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Ancrage mathématique déterministe</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  role: 'assistant',
                  content: `Historique de discussion réinitialisé. Contexte actif : **"${scenario.name}"** avec ${scenario.purchases.length} dépense(s) simulée(s).`,
                  timestamp: 'Maintenant',
                  mode: 'demo',
                },
              ])
            }
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Effacer la discussion"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer le Copilote"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bandeau de contexte du scénario actif */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400">Contexte :</span>
          <span className="font-semibold text-white truncate">{scenario.name}</span>
        </div>
        <div className="font-mono text-cyan-400 shrink-0 text-[11px]">
          Attendu : {formatCurrency(calculations.expected.endBalance)}
        </div>
      </div>

      {/* Zone de défilement des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-slate-200 border ${
                msg.role === 'user'
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-100 rounded-tr-sm'
                  : 'bg-slate-900/90 border-slate-800/90 rounded-tl-sm'
              }`}
            >
              <div className="prose prose-invert prose-xs max-w-none space-y-2">
                {msg.content.split('\n\n').map((block, idx) => {
                  if (block.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="font-bold text-white text-xs mt-1 mb-1 text-cyan-300">
                        {block.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (block.startsWith('- ')) {
                    const items = block.split('\n- ');
                    return (
                      <ul key={idx} className="list-disc pl-4 space-y-1">
                        {items.map((it, i) => (
                          <li key={i}>{formatInline(it.replace(/^- /, ''))}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.startsWith('|')) {
                    const rows = block.split('\n').filter((r) => !r.includes(':---'));
                    return (
                      <div key={idx} className="overflow-x-auto my-2">
                        <table className="w-full border-collapse border border-slate-800 text-[11px]">
                          <tbody>
                            {rows.map((row, rIdx) => {
                              const cells = row.split('|').filter((c) => c.trim() !== '');
                              return (
                                <tr
                                  key={rIdx}
                                  className={rIdx === 0 ? 'bg-slate-800 font-bold' : 'border-t border-slate-800'}
                                >
                                  {cells.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-1 px-2 border-r border-slate-800">
                                      {formatInline(cell.trim())}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return <p key={idx}>{formatInline(block)}</p>;
                })}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                <span>{msg.timestamp}</span>
                {msg.mode && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                    {msg.mode === 'gemini' ? 'Gemini 3.8 Flash' : 'Math Déterministe'}
                  </span>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyse des mathématiques du scénario et de l’autonomie de trésorerie...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Questions suggérées en puces */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Questions stratégiques fréquentes :</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 shrink-0 transition-colors text-[11px] cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-800 bg-[#111726]">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Posez une question sur la faisabilité, le creux de trésorerie..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Le Copilote IA s'appuie sur des calculs déterministes. Prototype basé sur des données financières fictives.
        </p>
      </form>
    </aside>
  );
};

function formatInline(str: string): React.ReactNode {
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
