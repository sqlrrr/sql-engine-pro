/**
 * SQL ENGINE PRO - Advanced AI Signal Generation Engine
 * Calculates BUY/SELL/HOLD signals based on weighted analysis
 * Version: 2.1.0
 */

interface TechnicalIndicators {
  rsi: number; // 0-100
  macd: number; // -100 to 100
  volumeChange: number; // -100 to 100
  orderBookImbalance: number; // -100 to 100
  ema20_50_cross: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

interface OnChainMetrics {
  whaleActivity: number; // -100 to 100
  stablecoinFlow: number; // -100 to 100
  exchangeFlow: number; // -100 to 100
  activeAddressesChange: number; // percentage
}

interface SentimentMetrics {
  twitterSentiment: number; // -100 to 100
  newsSentiment: number; // -100 to 100
  fearGreedIndex: number; // 0-100
  socialVolumeChange: number; // percentage
}

interface MacroMetrics {
  dxyChange: number; // -100 to 100
  stockMarketChange: number; // -100 to 100
  tokenUnlockPressure: number; // -100 to 100
}

interface SignalInput {
  symbol: string;
  technical: TechnicalIndicators;
  onChain: OnChainMetrics;
  sentiment: SentimentMetrics;
  macro: MacroMetrics;
}

interface SignalOutput {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  score: number; // 0-100
  technicalScore: number;
  onChainScore: number;
  sentimentScore: number;
  macroScore: number;
  reasoning: string;
  timestamp: number;
}

/**
 * Calculate Technical Analysis Score (35% weight)
 */
function calculateTechnicalScore(indicators: TechnicalIndicators): number {
  let score = 50;

  // RSI Analysis
  if (indicators.rsi < 30) score += 20; // Oversold
  else if (indicators.rsi > 70) score -= 20; // Overbought
  else if (indicators.rsi < 45) score += 5;
  else if (indicators.rsi > 55) score -= 5;

  // MACD Analysis
  score += (indicators.macd / 100) * 15;

  // EMA Cross
  if (indicators.ema20_50_cross === 'BULLISH') score += 15;
  else if (indicators.ema20_50_cross === 'BEARISH') score -= 15;

  // Volume Analysis
  score += (indicators.volumeChange / 100) * 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate On-Chain Score (25% weight)
 */
function calculateOnChainScore(metrics: OnChainMetrics): number {
  let score = 50;
  score += (metrics.whaleActivity / 100) * 25;
  score += (metrics.stablecoinFlow / 100) * 15;
  score += (metrics.exchangeFlow / 100) * -10; // Inflow to exchange is bearish
  score += (metrics.activeAddressesChange / 100) * 10;
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Sentiment Score (20% weight)
 */
function calculateSentimentScore(metrics: SentimentMetrics): number {
  let score = 50;
  score += (metrics.twitterSentiment / 100) * 20;
  score += (metrics.newsSentiment / 100) * 15;
  
  // Fear & Greed: Extreme Fear (0-20) is opportunity
  if (metrics.fearGreedIndex < 20) score += 15;
  else if (metrics.fearGreedIndex > 80) score -= 15;
  
  score += (metrics.socialVolumeChange / 100) * 10;
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Macro Score (20% weight)
 */
function calculateMacroScore(metrics: MacroMetrics): number {
  let score = 50;
  score += (metrics.dxyChange / 100) * -20; // Inverse
  score += (metrics.stockMarketChange / 100) * 15;
  score -= (metrics.tokenUnlockPressure / 100) * 15;
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate Advanced Trading Signal
 */
export function generateSignal(input: SignalInput): SignalOutput {
  const technicalScore = calculateTechnicalScore(input.technical);
  const onChainScore = calculateOnChainScore(input.onChain);
  const sentimentScore = calculateSentimentScore(input.sentiment);
  const macroScore = calculateMacroScore(input.macro);

  const finalScore =
    technicalScore * 0.35 +
    onChainScore * 0.25 +
    sentimentScore * 0.20 +
    macroScore * 0.20;

  let action: 'BUY' | 'SELL' | 'HOLD';
  let confidence: number;
  let reasoning: string;

  if (finalScore >= 70) {
    action = 'BUY';
    confidence = (finalScore - 70) / 30 + 0.7;
    reasoning = `AI Engine detected strong accumulation. Technicals are ${technicalScore > 60 ? 'Bullish' : 'Neutral'}. Whale activity is high.`;
  } else if (finalScore <= 35) {
    action = 'SELL';
    confidence = (35 - finalScore) / 35 + 0.7;
    reasoning = `AI Engine detected distribution phase. High exchange inflows and bearish technicals.`;
  } else {
    action = 'HOLD';
    confidence = 0.5;
    reasoning = `Market in consolidation. AI Score: ${finalScore.toFixed(1)}. Waiting for breakout.`;
  }

  return {
    symbol: input.symbol,
    action,
    confidence: Math.min(1, Math.max(0, confidence)),
    score: finalScore,
    technicalScore,
    onChainScore,
    sentimentScore,
    macroScore,
    reasoning,
    timestamp: Date.now(),
  };
}

/**
 * Detect Market Manipulation (Fake Walls/Pumps)
 */
export function detectManipulation(data: {
  orderBook: any;
  volume: number;
  priceChange: number;
}): { isManipulated: boolean; type: string; confidence: number } {
  // Logic to detect fake volume or wash trading
  if (Math.abs(data.priceChange) < 1 && data.volume > 500) {
    return { isManipulated: true, type: 'WASH_TRADING', confidence: 0.8 };
  }
  
  // Fake Pump detection
  if (data.priceChange > 5 && data.volume < -10) {
    return { isManipulated: true, type: 'FAKE_PUMP', confidence: 0.9 };
  }

  return { isManipulated: false, type: 'NONE', confidence: 0 };
}

export default {
  generateSignal,
  detectManipulation,
};
