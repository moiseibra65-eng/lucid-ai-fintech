export type PurchaseCategory = 
  | 'vehicle'
  | 'real_estate'
  | 'tech'
  | 'travel'
  | 'investment'
  | 'education'
  | 'medical'
  | 'other';

export type PaymentType = 'lump_sum' | 'installments';

export interface PurchaseItem {
  id: string;
  title: string;
  amount: number;
  targetMonth: number; // 1 to horizonMonths
  dateStr?: string;
  category: PurchaseCategory;
  paymentType: PaymentType;
  installmentsCount?: number; // e.g. 3, 6, 12 months
  active: boolean;
  notes?: string;
}

export type IncomeFrequency = 'monthly' | 'bi-weekly' | 'one-time';

export interface IncomeStream {
  id: string;
  title: string;
  amount: number; // Monthly equivalent
  frequency: IncomeFrequency;
  category: 'salary' | 'freelance' | 'bonus' | 'investments' | 'other';
  growthRateAnnual: number; // e.g. 0.03 for 3%
  active: boolean;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number; // Monthly equivalent
  category: 'housing' | 'utilities' | 'food' | 'transport' | 'subscriptions' | 'discretionary' | 'debt';
  active: boolean;
}

export interface ScenarioSensitivity {
  conservativeIncomeShockPct: number; // e.g. 10 (means -10%)
  conservativeExpenseCreepPct: number; // e.g. 15 (means +15%)
  optimisticIncomeBoostPct: number; // e.g. 8 (means +8%)
  optimisticExpenseCutPct: number; // e.g. 5 (means -5%)
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  startingBalance: number;
  safetyFloor: number;
  horizonMonths: 3 | 6 | 12 | 24;
  purchases: PurchaseItem[];
  incomeStreams: IncomeStream[];
  expenses: ExpenseItem[];
  sensitivity: ScenarioSensitivity;
}

export interface TimelineEvent {
  title: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category?: string;
}

export interface TimelinePoint {
  monthIndex: number; // 0 (current) to N
  dateStr: string; // e.g. "Nov 2026"
  fullDate: string;
  conservativeBalance: number;
  expectedBalance: number;
  optimisticBalance: number;
  baselineBalance: number;
  monthlyIncomeExpected: number;
  monthlyExpenseExpected: number;
  monthlyNetExpected: number;
  events: TimelineEvent[];
}

export interface ScenarioResultMetrics {
  endBalance: number;
  minBalance: number;
  minBalanceDate: string;
  maxBalance: number;
  totalInflow: number;
  totalOutflow: number;
  runwayMonths: number;
  dangerZonesCount: number;
  netDelta: number;
}

export interface DeterministicCalculations {
  timeline: TimelinePoint[];
  conservative: ScenarioResultMetrics;
  expected: ScenarioResultMetrics;
  optimistic: ScenarioResultMetrics;
  baseline: {
    endBalance: number;
    minBalance: number;
  };
  safetyFloorViolations: {
    conservative: boolean;
    expected: boolean;
  };
}

export interface CopilotChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: 'gemini' | 'demo';
  calculationsSummary?: {
    expectedEnd: number;
    expectedMin: number;
    conservativeEnd: number;
  };
}
