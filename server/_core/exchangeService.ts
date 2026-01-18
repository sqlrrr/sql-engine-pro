import axios from 'axios';
import crypto from 'crypto';
import { ENV } from './env';

interface ExchangeConfig {
  apiKey: string;
  secretKey: string;
  exchange: 'binance' | 'bybit';
  testnet?: boolean;
}

interface OrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
  orderType?: 'LIMIT' | 'MARKET';
}

interface OrderResponse {
  orderId: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  timestamp: number;
}

interface BalanceInfo {
  asset: string;
  free: number;
  locked: number;
}

interface PositionInfo {
  symbol: string;
  positionAmt: number;
  entryPrice: number;
  markPrice: number;
  unRealizedProfit: number;
  percentage: number;
}

/**
 * Binance Exchange Service
 */
export class BinanceExchange {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config: ExchangeConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.baseUrl = config.testnet
      ? 'https://testnet.binancefuture.com'
      : 'https://fapi.binance.com';
  }

  /**
   * Generate signature for Binance API requests
   */
  private generateSignature(params: Record<string, any>): string {
    const query = new URLSearchParams(params).toString();
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(query)
      .digest('hex');
  }

  /**
   * Make authenticated request to Binance
   */
  private async request(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: Record<string, any> = {}
  ) {
    const timestamp = Date.now();
    const requestParams = { ...params, timestamp };
    const signature = this.generateSignature(requestParams);

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        params: { ...requestParams, signature },
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Binance API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<BalanceInfo[]> {
    const data = await this.request('GET', '/fapi/v2/account');
    return data.assets.map((asset: any) => ({
      asset: asset.asset,
      free: parseFloat(asset.availableBalance),
      locked: parseFloat(asset.walletBalance) - parseFloat(asset.availableBalance),
    }));
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<PositionInfo[]> {
    const data = await this.request('GET', '/fapi/v2/positionRisk');
    return data
      .filter((pos: any) => parseFloat(pos.positionAmt) !== 0)
      .map((pos: any) => ({
        symbol: pos.symbol,
        positionAmt: parseFloat(pos.positionAmt),
        entryPrice: parseFloat(pos.entryPrice),
        markPrice: parseFloat(pos.markPrice),
        unRealizedProfit: parseFloat(pos.unRealizedProfit),
        percentage: (parseFloat(pos.unRealizedProfit) / (Math.abs(parseFloat(pos.positionAmt)) * parseFloat(pos.entryPrice))) * 100,
      }));
  }

  /**
   * Place a new order
   */
  async placeOrder(params: OrderParams): Promise<OrderResponse> {
    const orderParams: Record<string, any> = {
      symbol: params.symbol,
      side: params.side,
      quantity: params.quantity,
      type: params.orderType || 'MARKET',
    };

    if (params.leverage) {
      await this.setLeverage(params.symbol, params.leverage);
    }

    if (params.price && params.orderType === 'LIMIT') {
      orderParams.price = params.price;
      orderParams.timeInForce = 'GTC';
    }

    const response = await this.request('POST', '/fapi/v1/order', orderParams);

    // Set stop loss and take profit if provided
    if (params.stopLoss) {
      await this.setStopLoss(params.symbol, params.side, params.stopLoss);
    }
    if (params.takeProfit) {
      await this.setTakeProfit(params.symbol, params.side, params.takeProfit);
    }

    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.origQty),
      price: parseFloat(response.price || response.avgPrice),
      status: response.status,
      timestamp: response.time,
    };
  }

  /**
   * Set stop loss
   */
  async setStopLoss(symbol: string, side: string, stopPrice: number): Promise<void> {
    const stopSide = side === 'BUY' ? 'SELL' : 'BUY';
    await this.request('POST', '/fapi/v1/order', {
      symbol,
      side: stopSide,
      type: 'STOP_MARKET',
      stopPrice,
      closePosition: true,
    });
  }

  /**
   * Set take profit
   */
  async setTakeProfit(symbol: string, side: string, takePrice: number): Promise<void> {
    const tpSide = side === 'BUY' ? 'SELL' : 'BUY';
    await this.request('POST', '/fapi/v1/order', {
      symbol,
      side: tpSide,
      type: 'TAKE_PROFIT_MARKET',
      stopPrice: takePrice,
      closePosition: true,
    });
  }

  /**
   * Set leverage
   */
  async setLeverage(symbol: string, leverage: number): Promise<void> {
    await this.request('POST', '/fapi/v1/leverage', {
      symbol,
      leverage,
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    await this.request('DELETE', '/fapi/v1/order', {
      symbol,
      orderId,
    });
  }

  /**
   * Get order status
   */
  async getOrderStatus(symbol: string, orderId: string): Promise<any> {
    return await this.request('GET', '/fapi/v1/order', {
      symbol,
      orderId,
    });
  }
}

/**
 * Bybit Exchange Service
 */
export class BybitExchange {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config: ExchangeConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.baseUrl = config.testnet
      ? 'https://api-testnet.bybit.com'
      : 'https://api.bybit.com';
  }

  /**
   * Generate signature for Bybit API requests
   */
  private generateSignature(params: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(params)
      .digest('hex');
  }

  /**
   * Make authenticated request to Bybit
   */
  private async request(
    method: 'GET' | 'POST',
    endpoint: string,
    params: Record<string, any> = {}
  ) {
    const timestamp = Date.now();
    const requestParams: Record<string, any> = { ...params, api_key: this.apiKey, timestamp };
    const paramString = Object.keys(requestParams)
      .sort()
      .map((key) => `${key}=${requestParams[key]}`)
      .join('&');

    const signature = this.generateSignature(paramString);

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        params: { ...requestParams, sign: signature },
      });
      return response.data.result;
    } catch (error: any) {
      console.error('Bybit API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<BalanceInfo[]> {
    const data = await this.request('GET', '/v2/private/wallet/balance');
    const balanceData = data as Record<string, any>;
    return Object.entries(balanceData).map(([asset, balance]: [string, any]) => ({
      asset,
      free: parseFloat(balance.available_balance),
      locked: parseFloat(balance.wallet_balance) - parseFloat(balance.available_balance),
    }))
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<PositionInfo[]> {
    const data = await this.request('GET', '/v2/private/position/list');
    return data
      .filter((pos: any) => parseFloat(pos.size) !== 0)
      .map((pos: any) => ({
        symbol: pos.symbol,
        positionAmt: parseFloat(pos.size),
        entryPrice: parseFloat(pos.entry_price),
        markPrice: parseFloat(pos.mark_price),
        unRealizedProfit: parseFloat(pos.unrealised_pnl),
        percentage: (parseFloat(pos.unrealised_pnl) / (Math.abs(parseFloat(pos.size)) * parseFloat(pos.entry_price))) * 100,
      }));
  }

  /**
   * Place a new order
   */
  async placeOrder(params: OrderParams): Promise<OrderResponse> {
    const orderParams: Record<string, any> = {
      symbol: params.symbol,
      side: params.side,
      qty: params.quantity,
      order_type: params.orderType || 'Market',
    };

    if (params.leverage) {
      await this.setLeverage(params.symbol, params.leverage);
    }

    if (params.price && params.orderType === 'LIMIT') {
      orderParams.price = params.price;
    }

    const response = await this.request('POST', '/v2/private/order/create', orderParams);

    return {
      orderId: response.order_id,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.qty),
      price: parseFloat(response.price),
      status: response.order_status,
      timestamp: response.created_at * 1000,
    };
  }

  /**
   * Set leverage
   */
  async setLeverage(symbol: string, leverage: number): Promise<void> {
    await this.request('POST', '/v2/private/position/change-position-margin', {
      symbol,
      leverage,
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    await this.request('POST', '/v2/private/order/cancel', {
      symbol,
      order_id: orderId,
    });
  }

  /**
   * Get order status
   */
  async getOrderStatus(symbol: string, orderId: string): Promise<any> {
    return await this.request('GET', '/v2/private/order', {
      symbol,
      order_id: orderId,
    });
  }
}

/**
 * Factory function to create exchange instance
 */
export function createExchange(config: ExchangeConfig) {
  if (config.exchange === 'binance') {
    return new BinanceExchange(config);
  } else if (config.exchange === 'bybit') {
    return new BybitExchange(config);
  }
  throw new Error(`Unsupported exchange: ${config.exchange}`);
}
