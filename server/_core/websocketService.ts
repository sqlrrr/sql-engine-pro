import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface PriceUpdate {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: number;
  exchange: string;
}

export interface OrderBookUpdate {
  symbol: string;
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
  timestamp: number;
  exchange: string;
}

/**
 * WebSocket Service for real-time market data
 */
export class WebSocketService extends EventEmitter {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private priceCache: Map<string, PriceUpdate> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Connect to Binance WebSocket
   */
  async connectBinance(symbols: string[]): Promise<void> {
    const formattedSymbols = symbols.map((s) => `${s.toLowerCase()}@aggTrade`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${formattedSymbols}`;

    this.connect('binance', url, (data: any) => {
      if (data.data?.a) {
        const update: PriceUpdate = {
          symbol: data.data.s,
          price: parseFloat(data.data.p),
          bid: parseFloat(data.data.p) * 0.9999,
          ask: parseFloat(data.data.p) * 1.0001,
          volume: parseFloat(data.data.q),
          timestamp: data.data.T,
          exchange: 'binance',
        };
        this.priceCache.set(data.data.s, update);
        this.emit('price', update);
      }
    });
  }

  /**
   * Connect to Bybit WebSocket
   */
  async connectBybit(symbols: string[]): Promise<void> {
    const url = 'wss://stream.bybit.com/v5/public/linear';

    this.connect('bybit', url, (data: any) => {
      if (data.type === 'snapshot' || data.type === 'delta') {
        for (const item of data.data.tickers || []) {
          const update: PriceUpdate = {
            symbol: item.symbol,
            price: parseFloat(item.lastPrice),
            bid: parseFloat(item.bid1Price),
            ask: parseFloat(item.ask1Price),
            volume: parseFloat(item.volume24h),
            timestamp: Date.now(),
            exchange: 'bybit',
          };
          this.priceCache.set(item.symbol, update);
          this.emit('price', update);
        }
      }
    });

    // Send subscription message
    const ws = this.connections.get('bybit');
    if (ws) {
      ws.send(
        JSON.stringify({
          op: 'subscribe',
          args: symbols.map((s) => `tickers.${s}`),
        })
      );
    }
  }

  /**
   * Connect to Coinbase WebSocket
   */
  async connectCoinbase(symbols: string[]): Promise<void> {
    const url = 'wss://ws-feed.exchange.coinbase.com';

    this.connect('coinbase', url, (data: any) => {
      if (data.type === 'ticker') {
        const update: PriceUpdate = {
          symbol: data.product_id,
          price: parseFloat(data.price),
          bid: parseFloat(data.best_bid),
          ask: parseFloat(data.best_ask),
          volume: parseFloat(data.last_size),
          timestamp: Date.parse(data.time),
          exchange: 'coinbase',
        };
        this.priceCache.set(data.product_id, update);
        this.emit('price', update);
      }
    });

    // Send subscription message
    const ws = this.connections.get('coinbase');
    if (ws) {
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          product_ids: symbols,
          channels: ['ticker'],
        })
      );
    }
  }

  /**
   * Subscribe to order book updates
   */
  async subscribeOrderBook(exchange: string, symbol: string): Promise<void> {
    if (!this.subscriptions.has(exchange)) {
      this.subscriptions.set(exchange, new Set());
    }
    this.subscriptions.get(exchange)!.add(symbol);

    if (exchange === 'binance') {
      const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`;
      this.connect(`${exchange}-orderbook-${symbol}`, url, (data: any) => {
        if (data.bids && data.asks) {
          const update: OrderBookUpdate = {
            symbol: symbol.toUpperCase(),
            bids: data.bids.map((b: any) => [parseFloat(b[0]), parseFloat(b[1])]),
            asks: data.asks.map((a: any) => [parseFloat(a[0]), parseFloat(a[1])]),
            timestamp: data.E,
            exchange: 'binance',
          };
          this.emit('orderbook', update);
        }
      });
    }
  }

  /**
   * Get current price from cache
   */
  getPrice(symbol: string): PriceUpdate | undefined {
    return this.priceCache.get(symbol);
  }

  /**
   * Get all cached prices
   */
  getAllPrices(): Map<string, PriceUpdate> {
    return this.priceCache;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(exchange: string): void {
    const ws = this.connections.get(exchange);
    if (ws) {
      ws.close();
      this.connections.delete(exchange);
    }
  }

  /**
   * Disconnect all connections
   */
  disconnectAll(): void {
    this.connections.forEach((ws) => {
      ws.close();
    });
    this.connections.clear();
  }

  // ============ PRIVATE METHODS ============

  /**
   * Generic WebSocket connection handler
   */
  private connect(
    id: string,
    url: string,
    onMessage: (data: any) => void
  ): void {
    try {
      const ws = new WebSocket(url);

      ws.on('open', () => {
        console.log(`✓ Connected to ${id}`);
        this.reconnectAttempts.set(id, 0);
        this.emit('connected', { exchange: id });
      });

      ws.on('message', (data: string) => {
        try {
          const parsed = JSON.parse(data);
          onMessage(parsed);
        } catch (error) {
          console.error(`Error parsing message from ${id}:`, error);
        }
      });

      ws.on('error', (error: Error) => {
        console.error(`WebSocket error in ${id}:`, error.message);
        this.emit('error', { exchange: id, error: error.message });
      });

      ws.on('close', () => {
        console.log(`✗ Disconnected from ${id}`);
        this.connections.delete(id);
        this.emit('disconnected', { exchange: id });

        // Attempt reconnection
        this.attemptReconnect(id, url, onMessage);
      });

      this.connections.set(id, ws);
    } catch (error) {
      console.error(`Failed to connect to ${id}:`, error);
      this.attemptReconnect(id, url, onMessage);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(
    id: string,
    url: string,
    onMessage: (data: any) => void
  ): void {
    const attempts = (this.reconnectAttempts.get(id) || 0) + 1;
    this.reconnectAttempts.set(id, attempts);

    if (attempts > this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${id}`);
      this.emit('reconnect_failed', { exchange: id });
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts - 1);
    console.log(`Reconnecting to ${id} in ${delay}ms (attempt ${attempts})`);

    setTimeout(() => {
      this.connect(id, url, onMessage);
    }, delay);
  }
}

/**
 * Singleton instance
 */
let wsService: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService();
  }
  return wsService;
}
