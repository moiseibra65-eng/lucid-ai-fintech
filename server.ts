import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Helper to initialize Gemini SDK cleanly
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback deterministic simulation explainer in French
function generateDeterministicFinancialExplanation(
  userQuery: string,
  scenario: any,
  calcs: any
): string {
  const query = userQuery.toLowerCase();
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const expEnd = calcs?.expected?.endBalance ?? 0;
  const conEnd = calcs?.conservative?.endBalance ?? 0;
  const optEnd = calcs?.optimistic?.endBalance ?? 0;
  const expTrough = calcs?.expected?.minBalance ?? 0;
  const conTrough = calcs?.conservative?.minBalance ?? 0;
  const expTroughDate = calcs?.expected?.minBalanceDate || 'mois 3';
  const conTroughDate = calcs?.conservative?.minBalanceDate || 'mois 2';
  const safetyFloor = scenario?.safetyFloor ?? 15000;
  const purchases = scenario?.purchases || [];
  const totalPurchases = purchases.reduce((sum: number, p: any) => sum + (p.active ? p.amount : 0), 0);

  if (
    query.includes('permettre') ||
    query.includes('acheter') ||
    query.includes('achat') ||
    query.includes('payer') ||
    query.includes('afford') ||
    query.includes('sécurité')
  ) {
    const isSafe = conTrough >= safetyFloor;
    const isBorderline = expTrough >= safetyFloor && conTrough < safetyFloor;

    if (isSafe) {
      return `### Évaluation de faisabilité financière : **Forte confiance (Achat sécurisé)**\n\n` +
        `D'après le moteur de simulation déterministe pour **"${scenario.name || 'Plan actuel'}"** :\n\n` +
        `- **Trésorerie attendue à terme :** Votre solde final s'établit à **${formatCurrency(expEnd)}**, avec un point le plus bas (creux) de **${formatCurrency(expTrough)}** vers **${expTroughDate}**.\n` +
        `- **Test de résistance conservateur :** Même en cas de choc défavorable (-10 % de volatilité des revenus, +15 % de hausse des coûts), votre trésorerie ne descend jamais en dessous de votre réserve de sécurité de **${formatCurrency(safetyFloor)}** (point bas : **${formatCurrency(conTrough)}**).\n\n` +
        `**Recommandation stratégique :** Vous disposez d'un coussin de sécurité suffisant pour engager cette dépense sans compromettre votre résilience financière.`;
    } else if (isBorderline) {
      return `### Évaluation de faisabilité financière : **Prudence recommandée (Coussin de sécurité sous tension)**\n\n` +
        `D'après l'analyse de votre scénario :\n\n` +
        `- Dans le **Scénario Attendu**, votre solde reste au-dessus du plancher de sécurité, avec un minimum à **${formatCurrency(expTrough)}** (pour un plancher ciblé de **${formatCurrency(safetyFloor)}**).\n` +
        `- En revanche, dans le **Scénario Conservateur**, votre trésorerie passe sous le seuil d'alerte pour toucher un point bas à **${formatCurrency(conTrough)}** vers **${conTroughDate}**.\n\n` +
        `**Arbitrage stratégique :** L'achat est réalisable si les rentrées se déroulent comme prévu, mais vous expose à un risque d'érosion de réserve en cas d'imprévu. Il est conseillé d'étaler le paiement en plusieurs mensualités ou de différer de 60 jours afin de reconstituer votre trésorerie de précaution.`;
    } else {
      return `### Évaluation de faisabilité financière : **Risque élevé (Déficit de liquidité anticipé)**\n\n` +
        `La simulation signale une contraction critique de vos réserves :\n\n` +
        `- **Creux minimal attendu :** Votre solde descend à **${formatCurrency(expTrough)}**, franchissant à la baisse votre plancher de **${formatCurrency(safetyFloor)}**.\n` +
        `- **Autonomie sous contrainte (Conservateur) :** Le solde chute à **${formatCurrency(conTrough)}**, créant un risque direct de déficit vers **${conTroughDate}**.\n\n` +
        `**Pistes d'atténuation :**\n` +
        `1. Différez cet engagement jusqu'à ce que votre épargne disponible atteigne au moins **${formatCurrency(safetyFloor + totalPurchases)}**.\n` +
        `2. Privilégiez un financement fractionné sur 6 à 12 mois pour amortir l'impact immédiat sur votre fonds de roulement.`;
    }
  }

  if (query.includes('creux') || query.includes('bas') || query.includes('trough') || query.includes('quand')) {
    return `### Analyse du point le plus bas de trésorerie (Creux)\n\n` +
      `- **Scénario Attendu :** Creux à **${formatCurrency(expTrough)}** en **${expTroughDate}**.\n` +
      `- **Scénario Conservateur :** Creux à **${formatCurrency(conTrough)}** en **${conTroughDate}**.\n` +
      `- **Scénario Optimiste :** Creux préservé à **${formatCurrency(calcs?.optimistic?.minBalance ?? 0)}**.\n\n` +
      `Ce creux s'explique par la synchronisation des engagements programmés (totalisant **${formatCurrency(totalPurchases)}** de dépenses simulées) conjuguée aux charges fixes mensuelles de **${formatCurrency(scenario?.monthlyExpenses || 0)}/mois**. Cette période requiert un pilotage serré.`;
  }

  if (query.includes('comparer') || query.includes('différence') || query.includes('versus') || query.includes('vs')) {
    const spread = optEnd - conEnd;
    return `### Synthèse comparative des trajectoires\n\n` +
      `| Trajectoire | Solde final (Horizon) | Point le plus bas (Creux) | Marge de sécurité |\n` +
      `| :--- | :--- | :--- | :--- |\n` +
      `| **Conservateur** | **${formatCurrency(conEnd)}** | ${formatCurrency(conTrough)} | ${conTrough >= safetyFloor ? 'Robuste' : 'Sous tension'} |\n` +
      `| **Attendu (Base)** | **${formatCurrency(expEnd)}** | ${formatCurrency(expTrough)} | Conforme |\n` +
      `| **Optimiste** | **${formatCurrency(optEnd)}** | ${formatCurrency(calcs?.optimistic?.minBalance ?? 0)} | Excédent élevé |\n\n` +
      `**Dispersion du risque :** Il existe un écart de **${formatCurrency(spread)}** entre le potentiel de croissance optimiste et le scénario sous contrainte. Le principal levier d'action réside dans vos charges fixes courantes (**${formatCurrency(scenario?.monthlyExpenses || 0)}/mois**).`;
  }

  // General comprehensive scenario overview in French
  return `### Synthèse stratégique des projections de trésorerie\n\n` +
    `Voici l'analyse quantitative du scénario **"${scenario?.name || 'Simulation active'}"** sur un horizon de ${scenario?.horizonMonths || 12} mois :\n\n` +
    `- **Capital initial disponible :** ${formatCurrency(scenario?.startingBalance || 0)}\n` +
    `- **Résultat projeté (Attendu) :** Solde final de **${formatCurrency(expEnd)}** (Variation nette : ${expEnd >= (scenario?.startingBalance || 0) ? '+' : ''}${formatCurrency(expEnd - (scenario?.startingBalance || 0))})\n` +
    `- **Plancher de précaution :** Minimum conservateur à **${formatCurrency(conTrough)}** (seuil de sécurité ciblé : **${formatCurrency(safetyFloor)}**)\n` +
    `- **Engagements simulés :** ${purchases.length} dépense(s) pour un total cumulé de **${formatCurrency(totalPurchases)}**\n\n` +
    `Posez-moi des questions ciblées comme : *"Puis-je me permettre cet achat en toute sécurité ?"*, *"Quand mon solde sera-t-il au plus bas ?"*, ou *"Que se passe-t-il si mes dépenses augmentent de 500 € ?"*`;
}

// Copilot endpoint
app.post('/api/copilot', async (req: Request, res: Response) => {
  try {
    const { message, scenario, calculations, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Le message est obligatoire.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Deterministic demo mode response
      const fallbackText = generateDeterministicFinancialExplanation(message, scenario, calculations);
      return res.json({
        response: fallbackText,
        mode: 'demo',
        note: 'Fonctionnement en mode démo déterministe (sans clé API externe requise).',
      });
    }

    // System instruction strictly in French with mathematical boundary
    const systemInstruction = `Tu es le Copilote IA de LUCID, un laboratoire de simulation financière prédictive d'élite.
Tu dois t'exprimer INTÉGRALEMENT ET EXCLUSIVEMENT EN FRANÇAIS, avec un ton professionnel, précis et élégant, adapté au secteur fintech.
RÈGLE ABSOLUE ET CRITIQUE : Tu ne dois JAMAIS inventer, extrapoler ou fabriquer des chiffres, des taux d'intérêt ou des soldes qui ne figurent pas explicitement dans les données déterministes transmises.
Tous les calculs ont déjà été calculés avec rigueur mathématique par le moteur de l'application et sont fournis ci-dessous dans l'objet de contexte.
Tes responsabilités :
1. Répondre directement aux questions de l'utilisateur sur la faisabilité, les dates de creux de liquidité (trough) et les arbitrages en citant fidèlement les montants en euros (€).
2. Comparer les 3 trajectoires : Conservateur (test de résistance / stress-test), Attendu (trajectoire de référence) et Optimiste (potentiel de croissance).
3. Structurer tes réponses avec un formatage Markdown clair (titres en gras, puces, petits tableaux de synthèse si pertinent).
4. Proposer des conseils stratégiques d'atténuation (étaler les paiements, synchroniser avec les rentrées, optimiser les coûts fixes).
5. Rappeler brièvement et avec tact que LUCID est un outil de simulation basé sur des données fictives.`;

    const contextData = {
      scenarioMeta: {
        nom: scenario?.name,
        horizonMois: scenario?.horizonMonths,
        soldeInitial: scenario?.startingBalance,
        plancherSecurite: scenario?.safetyFloor,
        revenusMensuels: scenario?.monthlyIncome,
        depensesMensuelles: scenario?.monthlyExpenses,
        fluxNetMensuel: (scenario?.monthlyIncome || 0) - (scenario?.monthlyExpenses || 0),
        achatsSimules: scenario?.purchases || [],
      },
      calculsDeterministes: {
        conservateur: calculations?.conservative,
        attendu: calculations?.expected,
        optimiste: calculations?.optimistic,
      },
    };

    const formattedPrompt = `Question de l'utilisateur : "${message}"

Résultats des calculs déterministes fournis par le moteur financier LUCID :
${JSON.stringify(contextData, null, 2)}

Rédige une réponse d'analyse financière experte en français, rigoureusement alignée sur ces données chiffrées exactes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedPrompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high factual precision
      },
    });

    const replyText = response.text || generateDeterministicFinancialExplanation(message, scenario, calculations);

    return res.json({
      response: replyText,
      mode: 'gemini',
    });
  } catch (error: any) {
    console.error('Erreur API Copilot :', error?.message || error);
    const fallback = generateDeterministicFinancialExplanation(
      req.body?.message || '',
      req.body?.scenario,
      req.body?.calculations
    );
    return res.json({
      response: fallback,
      mode: 'demo',
      error: 'Service IA externe momentanément indisponible ; analyse déterministe fournie.',
    });
  }
});

// Full-stack Vite development middleware mounting or production static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LUCID] Laboratoire de scénarios financiers démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
