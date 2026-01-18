import axios from 'axios';
import crypto from 'crypto';

export type ExchangeType = 'binance' | 'bybit' | 'bitget' | 'kucoin' | 'okx' | 'huobi';

export interface UserExchangeCredentials {
  userId: number;
  exchange: ExchangeType;
  apiKey: string;
  secretKey: string;
  passphrase?: string; // For OKX, Bitget
  isActive: boolean;
  autoTradingEnabled: boolean;
}

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  orderType?: 'MARKET' | 'LIMIT';
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface OrderResponse {
  orderId: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  timestamp: number;
  exchange: ExchangeType;
}

export interface BalanceInfo {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface PositionInfo {
  symbol: string;
  positionAmt: number;
  entryPrice: number;
  markPrice: number;
  unRealizedProfit: number;
  percentage: number;
}

/**
 * Universal Exchange Connector
 * Supports: Binance, Bybit, Bitget, KuCoin, OKX, Huobi
 */
export class UniversalExchangeConnector {
  private credentials: UserExchangeCredentials;
  private baseUrls: Record<ExchangeType, string> = {
    binance: 'https://fapi.binance.com',
    bybit: 'https://api.bybit.com',
    bitget: 'https://api.bitget.com',
    kucoin: 'https://api.kucoin.com',
    okx: 'https://www.okx.com',
    huobi: 'https://api.huobi.pro',
  };

  constructor(credentials: UserExchangeCredentials) {
    this.credentials = credentials;
  }

  /**
   * Validate exchange credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const balance = await this.getBalance();
      return balance.length > 0;
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<BalanceInfo[]> {
    switch (this.credentials.exchange) {
      case 'binance':
        return this.getBinanceBalance();
      case 'bybit':
        return this.getBybitBalance();
      case 'bitget':
        return this.getBitgetBalance();
      case 'kucoin':
        return this.getKucoinBalance();
      case 'okx':
        return this.getOkxBalance();
      case 'huobi':
        return this.getHuobiBalance();
      default:
        throw new Error(`Unsupported exchange: ${this.credentials.exchange}`);
    }
  }

  /**
   * Place an order
   */
  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    switch (this.credentials.exchange) {
      case 'binance':
        return this.placeBinanceOrder(order);
      case 'bybit':
        return this.placeBybitOrder(order);
      case 'bitget':
        return this.placeBitgetOrder(order);
      case 'kucoin':
        return this.placeKucoinOrder(order);
      case 'okx':
        return this.placeOkxOrder(order);
      case 'huobi':
        throw new Error('Huobi order placement not yet implemented');
      default:
        throw new Error(`Unsupported exchange: ${this.credentials.exchange}`);
    }
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<PositionInfo[]> {
    switch (this.credentials.exchange) {
      case 'binance':
        return this.getBinancePositions();
      case 'bybit':
        return this.getBybitPositions();
      case 'bitget':
        return this.getBitgetPositions();
      default:
        return [];
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    switch (this.credentials.exchange) {
      case 'binance':
        return this.cancelBinanceOrder(symbol, orderId);
      case 'bybit':
        return this.cancelBybitOrder(symbol, orderId);
      case 'bitget':
        return this.cancelBitgetOrder(symbol, orderId);
      default:
        throw new Error(`Cancel not supported for ${this.credentials.exchange}`);
    }
  }

  // ============ BINANCE ============

  private async getBinanceBalance(): Promise<BalanceInfo[]> {
    const data = await this.binanceRequest('GET', '/fapi/v2/account');
    return data.assets.map((asset: any) => ({
      asset: asset.asset,
      free: parseFloat(asset.availableBalance),
      locked: parseFloat(asset.walletBalance) - parseFloat(asset.availableBalance),
      total: parseFloat(asset.walletBalance),
    }));
  }

  private async getBinancePositions(): Promise<PositionInfo[]> {
    const data = await this.binanceRequest('GET', '/fapi/v2/positionRisk');
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

  private async placeBinanceOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      type: order.orderType || 'MARKET',
    };

    if (order.price && order.orderType === 'LIMIT') {
      params.price = order.price;
      params.timeInForce = 'GTC';
    }

    const response = await this.binanceRequest('POST', '/fapi/v1/order', params);

    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.origQty),
      price: parseFloat(response.price || response.avgPrice || '0'),
      status: response.status,
      timestamp: response.time,
      exchange: 'binance',
    };
  }

  private async cancelBinanceOrder(symbol: string, orderId: string): Promise<void> {
    await this.binanceRequest('DELETE', '/fapi/v1/order', { symbol, orderId });
  }

  private async binanceRequest(method: string, endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now();
    const requestParams: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(params)) {
      requestParams[key] = String(value);
    }
    requestParams['timestamp'] = String(timestamp);
    
    const query = new URLSearchParams(requestParams).toString();
    const signature = crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(query)
      .digest('hex');

    const response = await axios({
      method: method as any,
      url: `${this.baseUrls.binance}${endpoint}`,
      params: { ...requestParams, signature },
      headers: { 'X-MBX-APIKEY': this.credentials.apiKey },
    });

    return response.data;
  }

  // ============ BYBIT ============

  private async getBybitBalance(): Promise<BalanceInfo[]> {
    const data = await this.bybitRequest('GET', '/v5/account/wallet-balance');
    const balances: BalanceInfo[] = [];

    for (const coin of data.list[0].coin) {
      balances.push({
        asset: coin.coin,
        free: parseFloat(coin.availableToWithdraw),
        locked: parseFloat(coin.walletBalance) - parseFloat(coin.availableToWithdraw),
        total: parseFloat(coin.walletBalance),
      });
    }

    return balances;
  }

  private async getBybitPositions(): Promise<PositionInfo[]> {
    const data = await this.bybitRequest('GET', '/v5/position/list', { category: 'linear' });
    return data.list
      .filter((pos: any) => parseFloat(pos.size) !== 0)
      .map((pos: any) => ({
        symbol: pos.symbol,
        positionAmt: parseFloat(pos.size),
        entryPrice: parseFloat(pos.avgPrice),
        markPrice: parseFloat(pos.markPrice),
        unRealizedProfit: parseFloat(pos.unrealizedPnl),
        percentage: (parseFloat(pos.unrealizedPnl) / (Math.abs(parseFloat(pos.size)) * parseFloat(pos.avgPrice))) * 100,
      }));
  }

  private async placeBybitOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: Record<string, any> = {
      category: 'linear',
      symbol: order.symbol,
      side: order.side,
      orderType: order.orderType || 'Market',
      qty: order.quantity,
    };

    if (order.price && order.orderType === 'LIMIT') {
      params.price = order.price;
    }

    const response = await this.bybitRequest('POST', '/v5/order/create', params);

    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.qty),
      price: parseFloat(response.price || '0'),
      status: 'PENDING',
      timestamp: Date.now(),
      exchange: 'bybit',
    };
  }

  private async cancelBybitOrder(symbol: string, orderId: string): Promise<void> {
    await this.bybitRequest('POST', '/v5/order/cancel', {
      category: 'linear',
      symbol,
      orderId,
    });
  }

  private async bybitRequest(method: string, endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now();
    const paramStr: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(params)) {
      paramStr[key] = String(value);
    }
    
    const query = new URLSearchParams(paramStr).toString();
    const signature = crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(`${timestamp}${this.credentials.apiKey}5000${query}`)
      .digest('hex');

    const response = await axios({
      method: method as any,
      url: `${this.baseUrls.bybit}${endpoint}`,
      params: paramStr,
      headers: {
        'X-BAPI-SIGN': signature,
        'X-BAPI-API-KEY': this.credentials.apiKey,
        'X-BAPI-TIMESTAMP': timestamp.toString(),
        'X-BAPI-RECV-WINDOW': '5000',
      },
    });

    return response.data.result;
  }

  // ============ BITGET ============

  private async getBitgetBalance(): Promise<BalanceInfo[]> {
    const data = await this.bitgetRequest('GET', '/spot/v1/account/assets');
    return data.map((asset: any) => ({
      asset: asset.coinName,
      free: parseFloat(asset.available),
      locked: parseFloat(asset.frozen),
      total: parseFloat(asset.available) + parseFloat(asset.frozen),
    }));
  }

  private async getBitgetPositions(): Promise<PositionInfo[]> {
    const data = await this.bitgetRequest('GET', '/mix/v1/position/allPosition', { productType: 'umcbl' });
    return data
      .filter((pos: any) => parseFloat(pos.total) !== 0)
      .map((pos: any) => ({
        symbol: pos.symbol,
        positionAmt: parseFloat(pos.total),
        entryPrice: parseFloat(pos.averagePrice),
        markPrice: parseFloat(pos.markPrice),
        unRealizedProfit: parseFloat(pos.unrealizedPL),
        percentage: (parseFloat(pos.unrealizedPL) / (Math.abs(parseFloat(pos.total)) * parseFloat(pos.averagePrice))) * 100,
      }));
  }

  private async placeBitgetOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side.toLowerCase(),
      orderType: order.orderType || 'market',
      size: order.quantity,
      productType: 'umcbl',
    };

    if (order.price && order.orderType === 'LIMIT') {
      params.price = order.price;
    }

    const response = await this.bitgetRequest('POST', '/mix/v1/order/placeOrder', params);

    return {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      quantity: parseFloat(response.size),
      price: parseFloat(response.price || '0'),
      status: 'PENDING',
      timestamp: Date.now(),
      exchange: 'bitget',
    };
  }

  private async cancelBitgetOrder(symbol: string, orderId: string): Promise<void> {
    await this.bitgetRequest('POST', '/mix/v1/order/cancel-order', {
      symbol,
      orderId,
      productType: 'umcbl',
    });
  }

  private async bitgetRequest(method: string, endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now().toString();
    const body = method === 'GET' ? '' : JSON.stringify(params);
    const message = timestamp + method + endpoint + body;
    const signature = crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(message)
      .digest('base64');

    const response = await axios({
      method: method as any,
      url: `${this.baseUrls.bitget}${endpoint}`,
      data: method !== 'GET' ? params : undefined,
      params: method === 'GET' ? params : undefined,
      headers: {
        'Content-Type': 'application/json',
        'ACCESS-KEY': this.credentials.apiKey,
        'ACCESS-SIGN': signature,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-PASSPHRASE': this.credentials.passphrase || '',
      },
    });

    return response.data.data;
  }

  // ============ KUCOIN ============

  private async getKucoinBalance(): Promise<BalanceInfo[]> {
    const data = await this.kucoinRequest('GET', '/api/v1/accounts');
    const balances: BalanceInfo[] = [];

    for (const account of data) {
      if (account.type === 'trade') {
        balances.push({
          asset: account.currency,
          free: parseFloat(account.available),
          locked: parseFloat(account.holds),
          total: parseFloat(account.balance),
        });
      }
    }

    return balances;
  }

  private async placeKucoinOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side.toLowerCase(),
      type: order.orderType?.toLowerCase() || 'market',
      size: order.quantity,
    };

    if (order.price && order.orderType === 'LIMIT') {
      params.price = order.price;
    }

    const response = await this.kucoinRequest('POST', '/api/v1/orders', params);

    return {
      orderId: response.orderId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price || 0,
      status: 'PENDING',
      timestamp: Date.now(),
      exchange: 'kucoin',
    };
  }

  private async kucoinRequest(method: string, endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now();
    const body = method === 'GET' ? '' : JSON.stringify(params);
    const message = timestamp + method + endpoint + body;
    const signature = crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(message)
      .digest('base64');

    const response = await axios({
      method: method as any,
      url: `https://api.kucoin.com${endpoint}`,
      data: method !== 'GET' ? params : undefined,
      params: method === 'GET' ? params : undefined,
      headers: {
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': timestamp.toString(),
        'KC-API-KEY': this.credentials.apiKey,
        'KC-API-PASSPHRASE': this.credentials.passphrase || '',
      },
    });

    return response.data.data;
  }

  // ============ OKX ============

  private async getOkxBalance(): Promise<BalanceInfo[]> {
    const data = await this.okxRequest('GET', '/api/v5/account/balance');
    const balances: BalanceInfo[] = [];

    for (const detail of data[0].details) {
      balances.push({
        asset: detail.ccy,
        free: parseFloat(detail.availBal),
        locked: parseFloat(detail.frozenBal),
        total: parseFloat(detail.cashBal) + parseFloat(detail.frozenBal),
      });
    }

    return balances;
  }

  private async placeOkxOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: Record<string, any> = {
      instId: order.symbol,
      tdMode: 'cash',
      side: order.side.toLowerCase(),
      ordType: order.orderType?.toLowerCase() || 'market',
      sz: order.quantity,
    };

    if (order.price && order.orderType === 'LIMIT') {
      params.px = order.price;
    }

    const response = await this.okxRequest('POST', '/api/v5/trade/order', params);

    return {
      orderId: response[0].ordId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price || 0,
      status: 'PENDING',
      timestamp: Date.now(),
      exchange: 'okx',
    };
  }

  private async okxRequest(method: string, endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = new Date().toISOString();
    const body = method === 'GET' ? '' : JSON.stringify(params);
    const message = timestamp + method + endpoint + body;
    const signature = crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(message)
      .digest('base64');

    const response = await axios({
      method: method as any,
      url: `https://www.okx.com${endpoint}`,
      data: method !== 'GET' ? params : undefined,
      params: method === 'GET' ? params : undefined,
      headers: {
        'OK-ACCESS-KEY': this.credentials.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.credentials.passphrase || '',
      },
    });

    return response.data.data;
  }

  // ============ HUOBI ============

  private async getHuobiBalance(): Promise<BalanceInfo[]> {
    const data = await this.huobiRequest('GET', '/v1/account/accounts');
    const accountId = data[0].id;

    const balance = await this.huobiRequest('GET', `/v1/account/accounts/${accountId}/balance`);
    const balances: BalanceInfo[] = [];

    for (const list of balance.list) {
      balances.push({
        asset: list.currency,
        free: parseFloat(list.balance),
        locked: 0,
        total: parseFloat(list.balance),
      });
    }

    return balances;
  }

  private async huobiRequest(method: string, endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = new Date().toISOString();
    const requestParams: Record<string, any> = {
      ...params,
      AccessKeyId: this.credentials.apiKey,
      SignatureMethod: 'HmacSHA256',
      SignatureVersion: '2',
      Timestamp: timestamp,
    };

    const sortedParams = Object.keys(requestParams)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(requestParams[key])}`)
      .join('&');

    const message = `${method}\napi.huobi.pro\n${endpoint}\n${sortedParams}`;
    const signature = crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(message)
      .digest('base64');

    const response = await axios({
      method: method as any,
      url: `https://api.huobi.pro${endpoint}`,
      params: { ...requestParams, Signature: signature },
    });

    return response.data.data;
  }
}

/**
 * Factory function to create exchange connector
 */
export function createExchangeConnector(credentials: UserExchangeCredentials): UniversalExchangeConnector {
  return new UniversalExchangeConnector(credentials);
}
