import {
  DeterministicCalculations,
  ExpenseItem,
  IncomeStream,
  PurchaseItem,
  ScenarioConfig,
  ScenarioResultMetrics,
  TimelineEvent,
  TimelinePoint,
} from '../types/financial';

export const INITIAL_BASE_DATE = new Date(2026, 9, 1); // Octobre 2026

export const DEFAULT_INCOME_STREAMS: IncomeStream[] = [
  {
    id: 'inc-1',
    title: 'Salaire principal (Architecte systèmes)',
    amount: 7200,
    frequency: 'monthly',
    category: 'salary',
    growthRateAnnual: 0.03,
    active: true,
  },
  {
    id: 'inc-2',
    title: 'Conseil technique & Veille tech',
    amount: 1000,
    frequency: 'monthly',
    category: 'freelance',
    growthRateAnnual: 0.05,
    active: true,
  },
];

export const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'Loyer loft urbain',
    amount: 2400,
    category: 'housing',
    active: true,
  },
  {
    id: 'exp-2',
    title: 'Alimentation, courses & restaurants',
    amount: 950,
    category: 'food',
    active: true,
  },
  {
    id: 'exp-3',
    title: 'Fibre optique, électricité & charges',
    amount: 320,
    category: 'utilities',
    active: true,
  },
  {
    id: 'exp-4',
    title: 'SaaS, serveurs cloud & abonnements média',
    amount: 180,
    category: 'subscriptions',
    active: true,
  },
  {
    id: 'exp-5',
    title: 'Santé, bien-être & loisirs discrétionnaires',
    amount: 800,
    category: 'discretionary',
    active: true,
  },
];

export const PRESET_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'preset-ev',
    name: 'Acquisition d’un véhicule électrique',
    description: 'Simulation de l’apport initial et du financement mensuel pour une berline électrique.',
    createdAt: '2026-10-17T00:00:00Z',
    updatedAt: '2026-10-17T00:00:00Z',
    isDefault: true,
    startingBalance: 38450,
    safetyFloor: 15000,
    horizonMonths: 12,
    purchases: [
      {
        id: 'purch-ev-down',
        title: 'Apport initial véhicule électrique',
        amount: 8500,
        targetMonth: 2,
        category: 'vehicle',
        paymentType: 'lump_sum',
        active: true,
        notes: 'Permet d’obtenir un TAEG promotionnel de 2,9 %',
      },
      {
        id: 'purch-ev-finance',
        title: 'Mensualité crédit auto électrique',
        amount: 580,
        targetMonth: 3,
        category: 'vehicle',
        paymentType: 'installments',
        installmentsCount: 10,
        active: true,
        notes: '580 €/mois sur le reste de la période',
      },
      {
        id: 'purch-charger',
        title: 'Borne de recharge à domicile & pose',
        amount: 1400,
        targetMonth: 2,
        category: 'tech',
        paymentType: 'lump_sum',
        active: true,
      },
    ],
    incomeStreams: [...DEFAULT_INCOME_STREAMS],
    expenses: [...DEFAULT_EXPENSES],
    sensitivity: {
      conservativeIncomeShockPct: 10,
      conservativeExpenseCreepPct: 12,
      optimisticIncomeBoostPct: 8,
      optimisticExpenseCutPct: 5,
    },
  },
  {
    id: 'preset-baseline',
    name: 'Trésorerie de référence (Statu quo)',
    description: 'Trajectoire organique sans dépenses d’investissement majeures programmées.',
    createdAt: '2026-10-17T00:00:00Z',
    updatedAt: '2026-10-17T00:00:00Z',
    startingBalance: 38450,
    safetyFloor: 15000,
    horizonMonths: 12,
    purchases: [],
    incomeStreams: [...DEFAULT_INCOME_STREAMS],
    expenses: [...DEFAULT_EXPENSES],
    sensitivity: {
      conservativeIncomeShockPct: 8,
      conservativeExpenseCreepPct: 10,
      optimisticIncomeBoostPct: 6,
      optimisticExpenseCutPct: 4,
    },
  },
  {
    id: 'preset-sabbatical',
    name: 'Congé sabbatique & Création de startup',
    description: 'Suspension de salaire de 4 mois pour prototyper et lancer un projet entrepreneurial.',
    createdAt: '2026-10-17T00:00:00Z',
    updatedAt: '2026-10-17T00:00:00Z',
    startingBalance: 42000,
    safetyFloor: 18000,
    horizonMonths: 12,
    purchases: [
      {
        id: 'purch-cloud-seed',
        title: 'Infrastructure Cloud & Crédits serveurs',
        amount: 3200,
        targetMonth: 3,
        category: 'tech',
        paymentType: 'lump_sum',
        active: true,
      },
      {
        id: 'purch-legal-entity',
        title: 'Frais juridiques & Immatriculation SAS',
        amount: 1800,
        targetMonth: 4,
        category: 'other',
        paymentType: 'lump_sum',
        active: true,
      },
    ],
    incomeStreams: [
      {
        id: 'inc-sab-salary',
        title: 'Salaire maintenu (50 % pendant 4 mois)',
        amount: 3600,
        frequency: 'monthly',
        category: 'salary',
        growthRateAnnual: 0,
        active: true,
      },
      {
        id: 'inc-sab-consult',
        title: 'Contrat de conseil fractionné',
        amount: 2800,
        frequency: 'monthly',
        category: 'freelance',
        growthRateAnnual: 0.1,
        active: true,
      },
    ],
    expenses: [
      { id: 'exp-s1', title: 'Part de coliving / logement optimisé', amount: 1900, category: 'housing', active: true },
      { id: 'exp-s2', title: 'Courses alimentaires & repas préparés', amount: 750, category: 'food', active: true },
      { id: 'exp-s3', title: 'Charges et utilités essentielles', amount: 260, category: 'utilities', active: true },
      { id: 'exp-s4', title: 'Outils et abonnements développeur', amount: 240, category: 'subscriptions', active: true },
    ],
    sensitivity: {
      conservativeIncomeShockPct: 18,
      conservativeExpenseCreepPct: 15,
      optimisticIncomeBoostPct: 14,
      optimisticExpenseCutPct: 8,
    },
  },
  {
    id: 'preset-relocation',
    name: 'Déménagement métropolitain & Studio',
    description: 'Dépôt de garantie, frais de déménagement et aménagement d’un espace de travail pro.',
    createdAt: '2026-10-17T00:00:00Z',
    updatedAt: '2026-10-17T00:00:00Z',
    startingBalance: 36000,
    safetyFloor: 12000,
    horizonMonths: 12,
    purchases: [
      {
        id: 'purch-reloc-dep',
        title: 'Premier loyer & Dépôt de garantie',
        amount: 5600,
        targetMonth: 1,
        category: 'real_estate',
        paymentType: 'lump_sum',
        active: true,
      },
      {
        id: 'purch-reloc-move',
        title: 'Société de déménagement & logistique',
        amount: 1950,
        targetMonth: 1,
        category: 'other',
        paymentType: 'lump_sum',
        active: true,
      },
      {
        id: 'purch-studio-setup',
        title: 'Bureau ergonomique & Écran haute fidélité',
        amount: 3400,
        targetMonth: 2,
        category: 'tech',
        paymentType: 'lump_sum',
        active: true,
      },
    ],
    incomeStreams: [...DEFAULT_INCOME_STREAMS],
    expenses: [
      { id: 'exp-r1', title: 'Loyer nouvel appartement', amount: 2800, category: 'housing', active: true },
      { id: 'exp-r2', title: 'Alimentation & sorties', amount: 1050, category: 'food', active: true },
      { id: 'exp-r3', title: 'Charges & abonnement très haut débit', amount: 350, category: 'utilities', active: true },
      { id: 'exp-r4', title: 'Mobilité, transports & abonnements', amount: 320, category: 'transport', active: true },
    ],
    sensitivity: {
      conservativeIncomeShockPct: 10,
      conservativeExpenseCreepPct: 12,
      optimisticIncomeBoostPct: 8,
      optimisticExpenseCutPct: 6,
    },
  },
];

export function getMonthDate(monthOffset: number): { label: string; fullDate: string } {
  const d = new Date(INITIAL_BASE_DATE);
  d.setMonth(d.getMonth() + monthOffset);
  const label = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  const fullDate = d.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' });
  return { label, fullDate };
}

export function calculateDeterministicScenario(scenario: ScenarioConfig): DeterministicCalculations {
  const horizon = scenario.horizonMonths || 12;
  const starting = scenario.startingBalance || 0;
  const safetyFloor = scenario.safetyFloor || 15000;

  // Totaux mensuels actifs de base
  const activeIncomeStreams = scenario.incomeStreams.filter((i) => i.active);
  const activeExpenses = scenario.expenses.filter((e) => e.active);

  const baseMonthlyIncome = activeIncomeStreams.reduce((sum, item) => sum + item.amount, 0);
  const baseMonthlyExpense = activeExpenses.reduce((sum, item) => sum + item.amount, 0);

  const activePurchases = scenario.purchases.filter((p) => p.active);

  const timeline: TimelinePoint[] = [];

  let curConBalance = starting;
  let curExpBalance = starting;
  let curOptBalance = starting;
  let curBaseBalance = starting;

  let conMinBalance = starting;
  let conMinDate = 'Départ';
  let conMaxBalance = starting;
  let conTotalInflow = 0;
  let conTotalOutflow = 0;
  let conDangerCount = 0;

  let expMinBalance = starting;
  let expMinDate = 'Départ';
  let expMaxBalance = starting;
  let expTotalInflow = 0;
  let expTotalOutflow = 0;

  let optMinBalance = starting;
  let optMaxBalance = starting;
  let optTotalInflow = 0;
  let optTotalOutflow = 0;

  let baseMinBalance = starting;

  // Mois 0 : État initial
  const m0 = getMonthDate(0);
  timeline.push({
    monthIndex: 0,
    dateStr: m0.label,
    fullDate: m0.fullDate,
    conservativeBalance: starting,
    expectedBalance: starting,
    optimisticBalance: starting,
    baselineBalance: starting,
    monthlyIncomeExpected: baseMonthlyIncome,
    monthlyExpenseExpected: baseMonthlyExpense,
    monthlyNetExpected: baseMonthlyIncome - baseMonthlyExpense,
    events: [],
  });

  // Calcul du mois 1 au mois horizon
  for (let m = 1; m <= horizon; m++) {
    const { label, fullDate } = getMonthDate(m);
    const events: TimelineEvent[] = [];

    // Calcul des dépenses d'investissement ce mois-ci
    let monthPurchaseOutflow = 0;
    for (const p of activePurchases) {
      if (p.paymentType === 'lump_sum') {
        if (p.targetMonth === m) {
          monthPurchaseOutflow += p.amount;
          events.push({
            title: p.title,
            amount: p.amount,
            type: 'outflow',
            category: p.category,
          });
        }
      } else if (p.paymentType === 'installments') {
        const count = p.installmentsCount || 6;
        if (m >= p.targetMonth && m < p.targetMonth + count) {
          const installment = Math.round(p.amount / count);
          monthPurchaseOutflow += installment;
          events.push({
            title: `${p.title} (${m - p.targetMonth + 1}/${count})`,
            amount: installment,
            type: 'outflow',
            category: p.category,
          });
        }
      }
    }

    // Trajectoire Attendue
    const expMonthlyExpense = Math.round(baseMonthlyExpense * (1 + 0.002 * m));
    const expMonthlyIncome = Math.round(baseMonthlyIncome * (1 + 0.001 * m));
    const expNet = expMonthlyIncome - (expMonthlyExpense + monthPurchaseOutflow);

    curExpBalance += expNet;
    expTotalInflow += expMonthlyIncome;
    expTotalOutflow += expMonthlyExpense + monthPurchaseOutflow;

    if (curExpBalance < expMinBalance) {
      expMinBalance = curExpBalance;
      expMinDate = label;
    }
    if (curExpBalance > expMaxBalance) {
      expMaxBalance = curExpBalance;
    }

    // Trajectoire Conservatrice (Stress test)
    const shockIncomePct = (scenario.sensitivity?.conservativeIncomeShockPct ?? 10) / 100;
    const creepExpensePct = (scenario.sensitivity?.conservativeExpenseCreepPct ?? 12) / 100;
    const conMonthlyIncome = Math.round(baseMonthlyIncome * (1 - shockIncomePct));
    const conMonthlyExpense = Math.round((baseMonthlyExpense * (1 + creepExpensePct)) + 150);
    const conNet = conMonthlyIncome - (conMonthlyExpense + monthPurchaseOutflow);

    curConBalance += conNet;
    conTotalInflow += conMonthlyIncome;
    conTotalOutflow += conMonthlyExpense + monthPurchaseOutflow;

    if (curConBalance < conMinBalance) {
      conMinBalance = curConBalance;
      conMinDate = label;
    }
    if (curConBalance > conMaxBalance) {
      conMaxBalance = curConBalance;
    }
    if (curConBalance < safetyFloor) {
      conDangerCount++;
    }

    // Trajectoire Optimiste (Croissance)
    const boostIncomePct = (scenario.sensitivity?.optimisticIncomeBoostPct ?? 8) / 100;
    const cutExpensePct = (scenario.sensitivity?.optimisticExpenseCutPct ?? 5) / 100;
    const optMonthlyIncome = Math.round(baseMonthlyIncome * (1 + boostIncomePct + 0.004 * m));
    const optMonthlyExpense = Math.round(baseMonthlyExpense * (1 - cutExpensePct));
    const optNet = optMonthlyIncome - (optMonthlyExpense + monthPurchaseOutflow);

    curOptBalance += optNet;
    optTotalInflow += optMonthlyIncome;
    optTotalOutflow += optMonthlyExpense + monthPurchaseOutflow;

    if (curOptBalance < optMinBalance) {
      optMinBalance = curOptBalance;
    }
    if (curOptBalance > optMaxBalance) {
      optMaxBalance = curOptBalance;
    }

    // Trajectoire de Référence (Statu quo sans achat simulé)
    const baseNet = expMonthlyIncome - expMonthlyExpense;
    curBaseBalance += baseNet;
    if (curBaseBalance < baseMinBalance) {
      baseMinBalance = curBaseBalance;
    }

    timeline.push({
      monthIndex: m,
      dateStr: label,
      fullDate,
      conservativeBalance: curConBalance,
      expectedBalance: curExpBalance,
      optimisticBalance: curOptBalance,
      baselineBalance: curBaseBalance,
      monthlyIncomeExpected: expMonthlyIncome,
      monthlyExpenseExpected: expMonthlyExpense + monthPurchaseOutflow,
      monthlyNetExpected: expNet,
      events,
    });
  }

  // Calcul du runway en mois
  let expRunway: number = horizon;
  let conRunway: number = horizon;

  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].conservativeBalance <= 0) {
      conRunway = i;
      break;
    }
  }
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].expectedBalance <= 0) {
      expRunway = i;
      break;
    }
  }

  const conservativeMetrics: ScenarioResultMetrics = {
    endBalance: curConBalance,
    minBalance: conMinBalance,
    minBalanceDate: conMinDate,
    maxBalance: conMaxBalance,
    totalInflow: conTotalInflow,
    totalOutflow: conTotalOutflow,
    runwayMonths: conRunway,
    dangerZonesCount: conDangerCount,
    netDelta: curConBalance - starting,
  };

  const expectedMetrics: ScenarioResultMetrics = {
    endBalance: curExpBalance,
    minBalance: expMinBalance,
    minBalanceDate: expMinDate,
    maxBalance: expMaxBalance,
    totalInflow: expTotalInflow,
    totalOutflow: expTotalOutflow,
    runwayMonths: expRunway,
    dangerZonesCount: timeline.filter((t) => t.expectedBalance < safetyFloor).length,
    netDelta: curExpBalance - starting,
  };

  const optimisticMetrics: ScenarioResultMetrics = {
    endBalance: curOptBalance,
    minBalance: optMinBalance,
    minBalanceDate: expMinDate,
    maxBalance: optMaxBalance,
    totalInflow: optTotalInflow,
    totalOutflow: optTotalOutflow,
    runwayMonths: horizon,
    dangerZonesCount: 0,
    netDelta: curOptBalance - starting,
  };

  return {
    timeline,
    conservative: conservativeMetrics,
    expected: expectedMetrics,
    optimistic: optimisticMetrics,
    baseline: {
      endBalance: curBaseBalance,
      minBalance: baseMinBalance,
    },
    safetyFloorViolations: {
      conservative: conMinBalance < safetyFloor,
      expected: expMinBalance < safetyFloor,
    },
  };
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}
