import React, { useState, useRef } from 'react';
import {
  Calendar,
  Eye,
  EyeOff,
  Table as TableIcon,
  LineChart as ChartIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Layers,
} from 'lucide-react';
import { DeterministicCalculations, ScenarioConfig, TimelinePoint } from '../types/financial';
import { formatCurrency } from '../utils/engine';

interface InteractiveCashflowChartProps {
  scenario: ScenarioConfig;
  calculations: DeterministicCalculations;
  onUpdateHorizon: (horizon: 3 | 6 | 12 | 24) => void;
  onOpenLab: () => void;
}

export const InteractiveCashflowChart: React.FC<InteractiveCashflowChartProps> = ({
  scenario,
  calculations,
  onUpdateHorizon,
  onOpenLab,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [showTableView, setShowTableView] = useState(false);

  // Sélecteur de visibilité des courbes
  const [visibleSeries, setVisibleSeries] = useState({
    expected: true,
    conservative: true,
    optimistic: true,
    baseline: true,
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const timeline = calculations.timeline;
  const safetyFloor = scenario.safetyFloor;

  // Dimensions SVG
  const width = 860;
  const height = 340;
  const padding = { top: 25, right: 30, bottom: 45, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Calcul des échelles
  const allValues = timeline.flatMap((pt) => [
    pt.conservativeBalance,
    pt.expectedBalance,
    pt.optimisticBalance,
    pt.baselineBalance,
    safetyFloor,
  ]);

  const rawMin = Math.min(...allValues, 0);
  const rawMax = Math.max(...allValues, startingRoundedMax(scenario.startingBalance));

  const yMin = Math.floor(rawMin * 0.95);
  const yMax = Math.ceil(rawMax * 1.08);

  function startingRoundedMax(val: number) {
    return Math.max(val * 1.4, 50000);
  }

  const getX = (index: number) => {
    if (timeline.length <= 1) return padding.left;
    return padding.left + (index / (timeline.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    if (yMax === yMin) return padding.top + innerHeight / 2;
    const ratio = (val - yMin) / (yMax - yMin);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const generatePath = (accessor: (pt: TimelinePoint) => number) => {
    return timeline.reduce((path, pt, i) => {
      const x = getX(i);
      const y = getY(accessor(pt));
      return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  };

  const generateAreaPath = (accessor: (pt: TimelinePoint) => number) => {
    if (timeline.length === 0) return '';
    const linePath = generatePath(accessor);
    const lastX = getX(timeline.length - 1);
    const zeroY = getY(Math.max(0, yMin));
    const firstX = getX(0);
    return `${linePath} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
  };

  // Curseur interactif
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    const clampedX = Math.max(padding.left, Math.min(width - padding.right, svgX));
    const ratio = (clampedX - padding.left) / innerWidth;
    const index = Math.round(ratio * (timeline.length - 1));
    setHoveredPointIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  const activeIndex = hoveredPointIndex !== null ? hoveredPointIndex : timeline.length - 1;
  const activePoint = timeline[activeIndex] || timeline[0];

  const yFloor = getY(safetyFloor);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => {
    const val = yMin + r * (yMax - yMin);
    return { val, y: getY(val) };
  });

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 relative">
      {/* En-tête du graphique & Sélecteur d'horizon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-cyan-400" />
              Projection des trajectoires de trésorerie
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Simulation sur {scenario.horizonMonths} mois
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulation déterministe en temps réel comparant les trajectoires Conservatrice, Attendue et Optimiste.
          </p>
        </div>

        {/* Boutons d'horizon & Bascule de vue */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800">
            {([3, 6, 12, 24] as const).map((h) => (
              <button
                key={h}
                onClick={() => onUpdateHorizon(h)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  scenario.horizonMonths === h
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h} mois
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTableView(!showTableView)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Basculer entre le graphique interactif et le tableau de données"
          >
            {showTableView ? (
              <>
                <ChartIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vue graphique</span>
              </>
            ) : (
              <>
                <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Données du tableau</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Légende & Filtres de séries */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 pb-3 border-y border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={() => toggleSeries('expected')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              visibleSeries.expected
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="font-semibold">Scénario Attendu (Base)</span>
            {visibleSeries.expected ? <Eye className="w-3 h-3 ml-1" /> : <EyeOff className="w-3 h-3 ml-1" />}
          </button>

          <button
            onClick={() => toggleSeries('conservative')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              visibleSeries.conservative
                ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                : 'bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="font-semibold">Conservateur (Stress)</span>
            {visibleSeries.conservative ? <Eye className="w-3 h-3 ml-1" /> : <EyeOff className="w-3 h-3 ml-1" />}
          </button>

          <button
            onClick={() => toggleSeries('optimistic')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              visibleSeries.optimistic
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-semibold">Optimiste (Croissance)</span>
            {visibleSeries.optimistic ? <Eye className="w-3 h-3 ml-1" /> : <EyeOff className="w-3 h-3 ml-1" />}
          </button>

          <button
            onClick={() => toggleSeries('baseline')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              visibleSeries.baseline
                ? 'bg-slate-800 border border-slate-700 text-slate-300'
                : 'bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-slate-400" />
            <span>Référence (Sans achat)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="flex items-center gap-1 text-amber-400/90 font-medium">
            <span className="w-3 h-0.5 border-t border-dashed border-amber-400" />
            Plancher de sécurité ({formatCurrency(safetyFloor, true)})
          </span>
        </div>
      </div>

      {/* Graphique principal ou tableau */}
      {!showTableView ? (
        <div className="mt-4 relative" ref={chartContainerRef}>
          {/* Bandeau d'inspection active au survol */}
          <div className="mb-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white text-sm">{activePoint.dateStr}</span>
              <span className="text-slate-400">({activePoint.fullDate})</span>
              {activePoint.events.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-medium">
                  {activePoint.events.length} événement{activePoint.events.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-6 font-mono">
              <div>
                <span className="text-slate-400 text-[11px] block">Attendu</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {formatCurrency(activePoint.expectedBalance)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Conservateur</span>
                <span
                  className={`font-bold text-sm ${
                    activePoint.conservativeBalance < safetyFloor
                      ? 'text-rose-400 font-extrabold'
                      : 'text-slate-300'
                  }`}
                >
                  {formatCurrency(activePoint.conservativeBalance)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Optimiste</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(activePoint.optimisticBalance)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Flux net</span>
                <span
                  className={`font-semibold text-xs ${
                    activePoint.monthlyNetExpected >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activePoint.monthlyNetExpected >= 0 ? '+' : ''}
                  {formatCurrency(activePoint.monthlyNetExpected)}
                </span>
              </div>
            </div>
          </div>

          {/* Canvas SVG du graphique */}
          <div className="w-full overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto cursor-crosshair overflow-visible"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.28" />
                  <stop offset="90%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>

                <pattern
                  id="dangerHatch"
                  width="10"
                  height="10"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(244, 63, 94, 0.12)" strokeWidth="2" />
                </pattern>
              </defs>

              {/* Hachures de zone de danger sous le plancher de sécurité */}
              {yFloor < height - padding.bottom && (
                <rect
                  x={padding.left}
                  y={yFloor}
                  width={innerWidth}
                  height={height - padding.bottom - yFloor}
                  fill="url(#dangerHatch)"
                />
              )}

              {/* Lignes de quadrillage horizontales */}
              {yTicks.map(({ val, y }, idx) => (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {formatCurrency(val, true)}
                  </text>
                </g>
              ))}

              {/* Ligne horizontale du plancher de sécurité */}
              <line
                x1={padding.left}
                y1={yFloor}
                x2={width - padding.right}
                y2={yFloor}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                opacity="0.8"
              />
              <text
                x={width - padding.right - 8}
                y={yFloor - 6}
                textAnchor="end"
                fill="#F59E0B"
                fontSize="10"
                fontWeight="600"
              >
                Plancher de sécurité : {formatCurrency(safetyFloor)}
              </text>

              {/* Courbe de référence (sans achat) */}
              {visibleSeries.baseline && (
                <path
                  d={generatePath((pt) => pt.baselineBalance)}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}

              {/* Courbe Optimiste */}
              {visibleSeries.optimistic && (
                <>
                  <path
                    d={generateAreaPath((pt) => pt.optimisticBalance)}
                    fill="url(#emeraldGradient)"
                  />
                  <path
                    d={generatePath((pt) => pt.optimisticBalance)}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Courbe Conservatrice */}
              {visibleSeries.conservative && (
                <path
                  d={generatePath((pt) => pt.conservativeBalance)}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Courbe Attendue lumineuse */}
              {visibleSeries.expected && (
                <>
                  <path
                    d={generateAreaPath((pt) => pt.expectedBalance)}
                    fill="url(#cyanGradient)"
                  />
                  <path
                    d={generatePath((pt) => pt.expectedBalance)}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="drop-shadow(0px 0px 6px rgba(0, 240, 255, 0.45))"
                  />
                </>
              )}

              {/* Jalons d'événements */}
              {timeline.map((pt, i) => {
                if (pt.events.length === 0) return null;
                const cx = getX(i);
                const cy = getY(pt.expectedBalance);
                return (
                  <g key={`event-pin-${i}`} className="cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="7"
                      fill="#0B0E14"
                      stroke="#00F0FF"
                      strokeWidth="2"
                    />
                    <circle cx={cx} cy={cy} r="3" fill="#00F0FF" />
                    <rect
                      x={cx - 14}
                      y={cy - 24}
                      width="28"
                      height="16"
                      rx="4"
                      fill="#1E293B"
                      stroke="#00F0FF"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 13}
                      textAnchor="middle"
                      fill="#00F0FF"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {pt.events.length}
                    </text>
                  </g>
                );
              })}

              {/* Ligne verticale de suivi */}
              {hoveredPointIndex !== null && (
                <g>
                  <line
                    x1={getX(hoveredPointIndex)}
                    y1={padding.top}
                    x2={getX(hoveredPointIndex)}
                    y2={height - padding.bottom}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.75"
                  />

                  {visibleSeries.expected && (
                    <circle
                      cx={getX(hoveredPointIndex)}
                      cy={getY(activePoint.expectedBalance)}
                      r="5.5"
                      fill="#00F0FF"
                      stroke="#0B0E14"
                      strokeWidth="2.5"
                    />
                  )}

                  {visibleSeries.conservative && (
                    <circle
                      cx={getX(hoveredPointIndex)}
                      cy={getY(activePoint.conservativeBalance)}
                      r="5"
                      fill="#F43F5E"
                      stroke="#0B0E14"
                      strokeWidth="2"
                    />
                  )}

                  {visibleSeries.optimistic && (
                    <circle
                      cx={getX(hoveredPointIndex)}
                      cy={getY(activePoint.optimisticBalance)}
                      r="5"
                      fill="#10B981"
                      stroke="#0B0E14"
                      strokeWidth="2"
                    />
                  )}
                </g>
              )}

              {/* Étiquettes des mois sur l'axe X */}
              {timeline.map((pt, i) => {
                const interval = timeline.length > 13 ? 2 : 1;
                if (i % interval !== 0 && i !== timeline.length - 1) return null;

                const x = getX(i);
                const y = height - padding.bottom + 18;
                const isHovered = hoveredPointIndex === i;

                return (
                  <text
                    key={`label-${i}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fill={isHovered ? '#38BDF8' : '#94A3B8'}
                    fontSize="11"
                    fontWeight={isHovered ? '700' : '500'}
                    fontFamily="monospace"
                  >
                    {pt.dateStr}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Bandeau d'événements prévus sous le graphique */}
          {activePoint.events.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold text-cyan-300">
                  Événements programmés en {activePoint.dateStr} :
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {activePoint.events.map((ev, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                    >
                      <span>{ev.title}</span>
                      <strong className="text-rose-400">-{formatCurrency(ev.amount)}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={onOpenLab}
                className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4 cursor-pointer"
              >
                Modifier dans le laboratoire
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Tableau de données accessible */
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Mois</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Solde attendu</th>
                <th className="py-2.5 px-3 text-right">Conservateur</th>
                <th className="py-2.5 px-3 text-right">Optimiste</th>
                <th className="py-2.5 px-3 text-right">Flux net</th>
                <th className="py-2.5 px-3">Événements jalons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {timeline.map((pt) => (
                <tr
                  key={pt.monthIndex}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-3 font-sans font-medium text-white">
                    Mois {pt.monthIndex}
                  </td>
                  <td className="py-2 px-3">{pt.dateStr}</td>
                  <td className="py-2 px-3 text-right font-bold text-cyan-300">
                    {formatCurrency(pt.expectedBalance)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right ${
                      pt.conservativeBalance < safetyFloor
                        ? 'text-rose-400 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {formatCurrency(pt.conservativeBalance)}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400">
                    {formatCurrency(pt.optimisticBalance)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right ${
                      pt.monthlyNetExpected >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pt.monthlyNetExpected >= 0 ? '+' : ''}
                    {formatCurrency(pt.monthlyNetExpected)}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    {pt.events.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {pt.events.map((e, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] text-slate-200"
                          >
                            {e.title} (-{formatCurrency(e.amount)})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
