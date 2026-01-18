import { UniversalExchangeConnector, UserExchangeCredentials, OrderRequest, OrderResponse } from './universalExchange';

export interface TradeSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  technicalScore: number;
  onChainScore: number;
  sentimentScore: number;
  macroScore: number;
  reasoning: string;
  timestamp: number;
}

export interface AutoTradingConfig {
  enabled: boolean;
  maxPositionSize: number; // in USD
  maxLeverage: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  riskRewardRatio: number;
  maxOpenPositions: number;
  minConfidence: number; // 0-100
  tradingPairs: string[];
}

export interface TradeExecution {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  executedAt: number;
  orderId?: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CLOSED';
  pnl?: number;
  closedAt?: number;
}

/**
 * Auto-Trading Engine
 * Executes trades based on AI signals with risk management
 */
export class AutoTradingEngine {
  private exchange: UniversalExchangeConnector;
  private config: AutoTradingConfig;
  private openTrades: Map<string, TradeExecution> = new Map();
  private tradeHistory: TradeExecution[] = [];

  constructor(
    credentials: UserExchangeCredentials,
    config: AutoTradingConfig
  ) {
    this.exchange = new UniversalExchangeConnector(credentials);
    this.config = config;
  }

  /**
   * Process AI signal and execute trade if conditions are met
   */
  async processSignal(signal: TradeSignal): Promise<TradeExecution | null> {
    // Check if auto-trading is enabled
    if (!this.config.enabled) {
      console.log('Auto-trading is disabled');
      return null;
    }

    // Check confidence threshold
    if (signal.confidence < this.config.minConfidence) {
      console.log(`Signal confidence ${signal.confidence} below threshold ${this.config.minConfidence}`);
      return null;
    }

    // Check if symbol is in trading pairs
    if (!this.config.tradingPairs.includes(signal.symbol)) {
      console.log(`${signal.symbol} not in trading pairs`);
      return null;
    }

    // Check if HOLD signal
    if (signal.action === 'HOLD') {
      console.log(`HOLD signal for ${signal.symbol}, no action taken`);
      return null;
    }

    // Check max open positions
    if (this.openTrades.size >= this.config.maxOpenPositions) {
      console.log(`Max open positions (${this.config.maxOpenPositions}) reached`);
      return null;
    }

    // Check if already have position in this symbol
    if (this.openTrades.has(signal.symbol)) {
      console.log(`Already have open position in ${signal.symbol}`);
      return null;
    }

    try {
      // Get current price
      const currentPrice = await this.getCurrentPrice(signal.symbol);
      if (!currentPrice) {
        throw new Error(`Could not get price for ${signal.symbol}`);
      }

      // Calculate position size
      const positionSize = this.calculatePositionSize(currentPrice);
      const quantity = positionSize / currentPrice;

      // Calculate stop loss and take profit
      const stopLoss = this.calculateStopLoss(currentPrice, signal.action);
      const takeProfit = this.calculateTakeProfit(currentPrice, signal.action);

      // Create order
      const orderRequest: OrderRequest = {
        symbol: signal.symbol,
        side: signal.action,
        quantity,
        orderType: 'MARKET',
        leverage: this.config.maxLeverage,
        stopLoss,
        takeProfit,
      };

      // Execute order
      const orderResponse = await this.exchange.placeOrder(orderRequest);

      // Create trade execution record
      const trade: TradeExecution = {
        id: `${Date.now()}-${signal.symbol}`,
        symbol: signal.symbol,
        action: signal.action,
        quantity,
        entryPrice: currentPrice,
        stopLoss,
        takeProfit,
        leverage: this.config.maxLeverage,
        executedAt: Date.now(),
        orderId: orderResponse.orderId,
        status: 'EXECUTED',
      };

      // Store trade
      this.openTrades.set(signal.symbol, trade);
      this.tradeHistory.push(trade);

      console.log(`✓ Trade executed: ${signal.action} ${quantity} ${signal.symbol} @ ${currentPrice}`);
      return trade;
    } catch (error) {
      console.error(`Failed to execute trade for ${signal.symbol}:`, error);
      return null;
    }
  }

  /**
   * Manual trade execution
   */
  async executeManualTrade(
    symbol: string,
    action: 'BUY' | 'SELL',
    quantity: number,
    entryPrice: number,
    leverage: number = 1
  ): Promise<TradeExecution | null> {
    try {
      // Calculate stop loss and take profit
      const stopLoss = this.calculateStopLoss(entryPrice, action);
      const takeProfit = this.calculateTakeProfit(entryPrice, action);

      // Create order
      const orderRequest: OrderRequest = {
        symbol,
        side: action,
        quantity,
        price: entryPrice,
        orderType: 'LIMIT',
        leverage,
        stopLoss,
        takeProfit,
      };

      // Execute order
      const orderResponse = await this.exchange.placeOrder(orderRequest);

      // Create trade execution record
      const trade: TradeExecution = {
        id: `${Date.now()}-${symbol}`,
        symbol,
        action,
        quantity,
        entryPrice,
        stopLoss,
        takeProfit,
        leverage,
        executedAt: Date.now(),
        orderId: orderResponse.orderId,
        status: 'EXECUTED',
      };

      // Store trade
      this.openTrades.set(symbol, trade);
      this.tradeHistory.push(trade);

      console.log(`✓ Manual trade executed: ${action} ${quantity} ${symbol} @ ${entryPrice}`);
      return trade;
    } catch (error) {
      console.error(`Failed to execute manual trade for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Close an open position
   */
  async closePosition(symbol: string): Promise<boolean> {
    try {
      const trade = this.openTrades.get(symbol);
      if (!trade) {
        console.log(`No open position for ${symbol}`);
        return false;
      }

      // Get current price
      const currentPrice = await this.getCurrentPrice(symbol);
      if (!currentPrice) {
        throw new Error(`Could not get price for ${symbol}`);
      }

      // Close position (opposite side)
      const closeSide = trade.action === 'BUY' ? 'SELL' : 'BUY';

      const orderRequest: OrderRequest = {
        symbol,
        side: closeSide,
        quantity: trade.quantity,
        orderType: 'MARKET',
      };

      await this.exchange.placeOrder(orderRequest);

      // Calculate P&L
      const pnl = trade.action === 'BUY'
        ? (currentPrice - trade.entryPrice) * trade.quantity
        : (trade.entryPrice - currentPrice) * trade.quantity;

      // Update trade
      trade.status = 'CLOSED';
      trade.pnl = pnl;
      trade.closedAt = Date.now();

      // Remove from open trades
      this.openTrades.delete(symbol);

      console.log(`✓ Position closed: ${symbol}, P&L: ${pnl.toFixed(2)} USD`);
      return true;
    } catch (error) {
      console.error(`Failed to close position for ${symbol}:`, error);
      return false;
    }
  }

  /**
   * Get open positions
   */
  async getOpenPositions(): Promise<TradeExecution[]> {
    return Array.from(this.openTrades.values());
  }

  /**
   * Get trade history
   */
  getTradeHistory(): TradeExecution[] {
    return this.tradeHistory;
  }

  /**
   * Get trading statistics
   */
  getTradingStats() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter((t) => t.pnl && t.pnl > 0).length;
    const losingTrades = this.tradeHistory.filter((t) => t.pnl && t.pnl < 0).length;
    const totalPnL = this.tradeHistory.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      totalPnL,
      avgPnL,
      winRate,
    };
  }

  /**
   * Update auto-trading configuration
   */
  updateConfig(newConfig: Partial<AutoTradingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Auto-trading config updated:', this.config);
  }

  /**
   * Toggle auto-trading on/off
   */
  toggleAutoTrading(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`Auto-trading ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoTradingConfig {
    return this.config;
  }

  // ============ PRIVATE METHODS ============

  /**
   * Get current price for a symbol
   */
  private async getCurrentPrice(symbol: string): Promise<number | null> {
    try {
      // This would typically call an API to get current price
      // For now, returning a placeholder
      // In production, integrate with price feed service
      return 50000; // Placeholder
    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Calculate position size based on risk management
   */
  private calculatePositionSize(currentPrice: number): number {
    // Risk 2% of account per trade
    const accountBalance = 10000; // Placeholder - should get from exchange
    const riskAmount = accountBalance * 0.02;
    return riskAmount;
  }

  /**
   * Calculate stop loss price
   */
  private calculateStopLoss(entryPrice: number, action: 'BUY' | 'SELL'): number {
    const stopLossPercent = this.config.stopLossPercent / 100;

    if (action === 'BUY') {
      return entryPrice * (1 - stopLossPercent);
    } else {
      return entryPrice * (1 + stopLossPercent);
    }
  }

  /**
   * Calculate take profit price
   */
  private calculateTakeProfit(entryPrice: number, action: 'BUY' | 'SELL'): number {
    const takeProfitPercent = this.config.takeProfitPercent / 100;

    if (action === 'BUY') {
      return entryPrice * (1 + takeProfitPercent);
    } else {
      return entryPrice * (1 - takeProfitPercent);
    }
  }
}

/**
 * Factory function to create auto-trading engine
 */
export function createAutoTradingEngine(
  credentials: UserExchangeCredentials,
  config: AutoTradingConfig
): AutoTradingEngine {
  return new AutoTradingEngine(credentials, config);
}
