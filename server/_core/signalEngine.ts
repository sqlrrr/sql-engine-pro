/**
 * Crypto Intelligence System - AI Signal Generation Engine
 * Calculates BUY/SELL/HOLD signals based on weighted analysis
 */

interface TechnicalIndicators {
  rsi: number; // 0-100
  macd: number; // -100 to 100
  volumeChange: number; // -100 to 100
  orderBookImbalance: number; // -100 to 100
}

interface OnChainMetrics {
  whaleActivity: number; // -100 to 100
  stablecoinFlow: number; // -100 to 100
  exchangeFlow: number; // -100 to 100
}

interface SentimentMetrics {
  twitterSentiment: number; // -100 to 100
  newsSentiment: number; // -100 to 100
  fearGreedIndex: number; // 0-100
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
}

/**
 * Calculate Technical Analysis Score (30% weight)
 */
function calculateTechnicalScore(indicators: TechnicalIndicators): number {
  let score = 50; // Neutral baseline

  // RSI Analysis (30% of technical score)
  if (indicators.rsi < 30) {
    score += 15; // Oversold = Bullish
  } else if (indicators.rsi > 70) {
    score -= 15; // Overbought = Bearish
  }

  // MACD Analysis (25% of technical score)
  score += (indicators.macd / 100) * 12.5;

  // Volume Analysis (25% of technical score)
  score += (indicators.volumeChange / 100) * 12.5;

  // Order Book Analysis (20% of technical score)
  score += (indicators.orderBookImbalance / 100) * 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate On-Chain Score (30% weight)
 */
function calculateOnChainScore(metrics: OnChainMetrics): number {
  let score = 50; // Neutral baseline

  // Whale Activity (40% of on-chain score)
  score += (metrics.whaleActivity / 100) * 20;

  // Stablecoin Flow (35% of on-chain score)
  score += (metrics.stablecoinFlow / 100) * 17.5;

  // Exchange Flow (25% of on-chain score)
  score += (metrics.exchangeFlow / 100) * 12.5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Sentiment Score (20% weight)
 */
function calculateSentimentScore(metrics: SentimentMetrics): number {
  let score = 50; // Neutral baseline

  // Twitter Sentiment (50% of sentiment score)
  score += (metrics.twitterSentiment / 100) * 25;

  // News Sentiment (30% of sentiment score)
  score += (metrics.newsSentiment / 100) * 15;

  // Fear & Greed Index (20% of sentiment score)
  // Extreme Fear (0-25) = Opportunity = Bullish
  // Extreme Greed (75-100) = Caution = Bearish
  const fearGreedAdjustment = metrics.fearGreedIndex < 25 ? 10 : (metrics.fearGreedIndex > 75 ? -10 : 0);
  score += fearGreedAdjustment;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Macro Score (20% weight)
 */
function calculateMacroScore(metrics: MacroMetrics): number {
  let score = 50; // Neutral baseline

  // DXY (Dollar Index) - 40% of macro score
  // DXY falling = Good for crypto = Bullish
  score += (metrics.dxyChange / 100) * -20; // Inverse relationship

  // Stock Market - 35% of macro score
  score += (metrics.stockMarketChange / 100) * 17.5;

  // Token Unlock Pressure - 25% of macro score
  score -= (metrics.tokenUnlockPressure / 100) * 12.5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate Trading Signal
 */
export function generateSignal(input: SignalInput): SignalOutput {
  // Calculate component scores
  const technicalScore = calculateTechnicalScore(input.technical);
  const onChainScore = calculateOnChainScore(input.onChain);
  const sentimentScore = calculateSentimentMetrics(input.sentiment);
  const macroScore = calculateMacroScore(input.macro);

  // Calculate weighted final score
  const finalScore =
    technicalScore * 0.3 +
    onChainScore * 0.3 +
    sentimentScore * 0.2 +
    macroScore * 0.2;

  // Determine action and confidence
  let action: 'BUY' | 'SELL' | 'HOLD';
  let confidence: number;
  let reasoning: string;

  if (finalScore >= 75) {
    action = 'BUY';
    confidence = (finalScore - 75) / 25;
    reasoning = `Strong buy signal detected. Technical indicators are bullish (RSI: ${input.technical.rsi.toFixed(1)}), on-chain data shows whale accumulation, and sentiment is positive.`;
  } else if (finalScore >= 60) {
    action = 'BUY';
    confidence = (finalScore - 60) / 15;
    reasoning = `Buy signal detected. Multiple indicators are aligned bullish. Consider entering with caution.`;
  } else if (finalScore >= 40) {
    action = 'HOLD';
    confidence = 0.5;
    reasoning = `Market is neutral. No clear directional bias. Wait for stronger signals.`;
  } else if (finalScore >= 25) {
    action = 'SELL';
    confidence = (40 - finalScore) / 15;
    reasoning = `Sell signal detected. Multiple bearish indicators present. Consider exiting positions.`;
  } else {
    action = 'SELL';
    confidence = (25 - finalScore) / 25;
    reasoning = `Strong sell signal detected. Technical indicators are bearish, on-chain shows whale distribution, and sentiment is negative.`;
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
  };
}

/**
 * Detect Fake Signals - Order Book Manipulation
 */
export function detectFakeWalls(
  orderBook: { bids: [number, number][]; asks: [number, number][] },
  historicalOrderBooks: any[]
): { isFake: boolean; confidence: number; reason: string } {
  // Check if large order appears and disappears quickly
  const largestBid = orderBook.bids[0];
  const largestAsk = orderBook.asks[0];

  const avgBidSize = orderBook.bids.slice(1, 5).reduce((sum, [_, size]) => sum + size, 0) / 4;
  const avgAskSize = orderBook.asks.slice(1, 5).reduce((sum, [_, size]) => sum + size, 0) / 4;

  const bidWallRatio = largestBid[1] / avgBidSize;
  const askWallRatio = largestAsk[1] / avgAskSize;

  // If wall is 10x larger than average, it might be fake
  if (bidWallRatio > 10 || askWallRatio > 10) {
    // Check if this wall existed in previous snapshots
    const wallExistedBefore = historicalOrderBooks.some(book => {
      return (
        book.bids[0][1] > largestBid[1] * 0.8 ||
        book.asks[0][1] > largestAsk[1] * 0.8
      );
    });

    if (!wallExistedBefore) {
      return {
        isFake: true,
        confidence: 0.8,
        reason: 'Large order wall appeared suddenly without historical precedent',
      };
    }
  }

  return { isFake: false, confidence: 0, reason: 'Order book appears legitimate' };
}

/**
 * Detect Volume vs Price Divergence (Fake Pump)
 */
export function detectFakePump(
  priceChange: number, // percentage
  volumeChange: number // percentage
): { isFakePump: boolean; confidence: number } {
  // Fake pump = Price up but Volume down
  if (priceChange > 10 && volumeChange < -20) {
    return {
      isFakePump: true,
      confidence: 0.85,
    };
  }

  // Real selling = Price down but Volume up
  if (priceChange < -10 && volumeChange > 20) {
    return {
      isFakePump: false,
      confidence: 0.9,
    };
  }

  return { isFakePump: false, confidence: 0 };
}

/**
 * Verify Project Legitimacy via GitHub Activity
 */
export async function verifyProjectLegitimacy(
  githubUrl: string
): Promise<{ isLegit: boolean; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; reason: string }> {
  try {
    // Extract owner and repo from URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return { isLegit: false, riskLevel: 'HIGH', reason: 'Invalid GitHub URL' };
    }

    const [, owner, repo] = match;

    // Fetch repository info
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    const repoData = await response.json();

    // Check key metrics
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`
    );
    const commits = await commitsResponse.json();
    const recentCommits = commits.length > 0 ? commits[0].commit.author.date : null;

    const daysInactive = recentCommits
      ? Math.floor((Date.now() - new Date(recentCommits).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Evaluate legitimacy
    if (daysInactive > 180) {
      return {
        isLegit: false,
        riskLevel: 'HIGH',
        reason: 'Project inactive for 6+ months',
      };
    }

    if (repoData.stargazers_count < 10) {
      return {
        isLegit: false,
        riskLevel: 'HIGH',
        reason: 'Very low community interest',
      };
    }

    if (repoData.forks_count < 5) {
      return {
        isLegit: false,
        riskLevel: 'MEDIUM',
        reason: 'Low fork count indicates limited adoption',
      };
    }

    return {
      isLegit: true,
      riskLevel: 'LOW',
      reason: 'Active development with good community engagement',
    };
  } catch (error) {
    console.error('GitHub verification error:', error);
    return {
      isLegit: false,
      riskLevel: 'HIGH',
      reason: 'Unable to verify project',
    };
  }
}

/**
 * Calculate Sentiment Score with Fear & Greed
 */
function calculateSentimentMetrics(metrics: SentimentMetrics): number {
  let score = 50;

  score += (metrics.twitterSentiment / 100) * 25;
  score += (metrics.newsSentiment / 100) * 15;

  // Fear & Greed: Extreme Fear is opportunity
  if (metrics.fearGreedIndex < 25) {
    score += 10; // Extreme fear = buy opportunity
  } else if (metrics.fearGreedIndex > 75) {
    score -= 10; // Extreme greed = caution
  }

  return Math.max(0, Math.min(100, score));
}

export default {
  generateSignal,
  detectFakeWalls,
  detectFakePump,
  verifyProjectLegitimacy,
};
