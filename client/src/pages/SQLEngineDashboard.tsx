import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Activity, Zap, Wallet, MessageSquare, BarChart3, Settings, Cpu, Flame, Menu, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    LightweightCharts: any;
  }
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

interface Signal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  score: number;
  reasoning: string;
}

interface WhaleAlert {
  walletAddress: string;
  amount: number;
  usdValue: number;
  type: 'BUY' | 'SELL';
  timestamp: string;
}

export default function SQLEngineDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (chartContainerRef.current && window.LightweightCharts) {
      const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: window.innerWidth < 768 ? 300 : 400,
        layout: {
          background: { color: '#0f0f0f' },
          textColor: '#d4af37',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const lineSeries = chart.addLineSeries({
        color: '#d4af37',
        lineWidth: 3,
      });

      const sampleData = [
        { time: '2025-01-16', value: 42000 },
        { time: '2025-01-17', value: 43500 },
        { time: '2025-01-18', value: 42800 },
      ];

      lineSeries.setData(sampleData);
      chart.timeScale().fitContent();

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, []);

  // Fetch market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const mockMarketData: MarketData[] = [
          { symbol: 'BTC', price: 42500, change24h: 2.5, volume: 28000000000, marketCap: 835000000000 },
          { symbol: 'ETH', price: 2300, change24h: -1.2, volume: 15000000000, marketCap: 276000000000 },
          { symbol: 'SOL', price: 185, change24h: 5.8, volume: 2000000000, marketCap: 82000000000 },
          { symbol: 'BNB', price: 310, change24h: 0.5, volume: 1000000000, marketCap: 48000000000 },
        ];

        const mockSignals: Signal[] = [
          { symbol: 'BTC', action: 'BUY', confidence: 0.85, score: 78, reasoning: 'Strong technical indicators with positive on-chain data' },
          { symbol: 'ETH', action: 'HOLD', confidence: 0.6, score: 55, reasoning: 'Mixed signals - wait for clearer direction' },
          { symbol: 'SOL', action: 'BUY', confidence: 0.72, score: 72, reasoning: 'Whale accumulation detected with positive sentiment' },
        ];

        const mockWhaleAlerts: WhaleAlert[] = [
          { walletAddress: '0x1234...5678', amount: 50, usdValue: 2125000, type: 'BUY', timestamp: '2 minutes ago' },
          { walletAddress: '0x9876...5432', amount: 1000, usdValue: 2300000, type: 'BUY', timestamp: '5 minutes ago' },
        ];

        setMarketData(mockMarketData);
        setSignals(mockSignals);
        setWhaleAlerts(mockWhaleAlerts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' }}>
        <Card className="w-full max-w-md" style={{ background: '#1a1a1a', borderColor: '#d4af37' }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" style={{ color: '#d4af37' }}>⚙️ SQL ENGINE PRO</CardTitle>
            <CardDescription>Advanced Crypto Intelligence Terminal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full h-12 text-lg font-bold" style={{ background: '#d4af37', color: '#0f0f0f' }} onClick={() => window.location.href = '/login'}>
              Login to Terminal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { value: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'signals', label: 'Signals', icon: <Zap className="w-4 h-4" /> },
    { value: 'whales', label: 'Whales', icon: <Wallet className="w-4 h-4" /> },
    { value: 'sentiment', label: 'Sentiment', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'onchain', label: 'On-Chain', icon: <Activity className="w-4 h-4" /> },
    { value: 'solana', label: 'Solana', icon: <Flame className="w-4 h-4" /> },
    { value: 'trading', label: 'Trading', icon: <Activity className="w-4 h-4" /> },
    { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)' }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-50" style={{ background: '#0f0f0f', borderColor: '#d4af37' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-3xl font-black truncate" style={{ color: '#d4af37', textShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }}>
              ⚙️ SQL ENGINE PRO
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2" style={{ color: '#d4af37' }}>
              <Cpu className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">LIVE ENGINE</span>
            </div>
            <span className="text-sm text-gray-400">{user?.name || 'User'}</span>
            <Button variant="outline" size="sm" onClick={logout} style={{ borderColor: '#d4af37', color: '#d4af37' }}>
              Logout
            </Button>
          </div>

          <button className="md:hidden text-[#d4af37]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden p-4 border-t border-[#d4af37] bg-[#1a1a1a] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{user?.name || 'User'}</span>
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Cpu className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold">LIVE</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={logout} style={{ borderColor: '#d4af37', color: '#d4af37' }}>
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Metrics - Horizontal Scroll on Mobile */}
        <div className="flex md:grid md:grid-cols-4 gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar">
          {marketData.map((data) => (
            <Card 
              key={data.symbol} 
              className="min-w-[250px] md:min-w-0 hover:shadow-xl transition-all"
              style={{ background: '#1a1a1a', borderColor: '#d4af37', borderWidth: '1px' }}
            >
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm" style={{ color: '#d4af37' }}>{data.symbol}/USDT</h3>
                  <Badge 
                    className="text-[10px] px-1 py-0"
                    style={{ background: data.change24h >= 0 ? '#00ff88' : '#ff3366', color: '#000' }}
                  >
                    {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-2xl font-black text-white">${data.price.toLocaleString()}</p>
                <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                  <span>Vol: ${(data.volume / 1e9).toFixed(1)}B</span>
                  <span>Cap: ${(data.marketCap / 1e9).toFixed(0)}B</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs - Scrollable on Mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto hide-scrollbar mb-6">
            <TabsList 
              className="flex w-max md:grid md:w-full md:grid-cols-8"
              style={{ background: '#1a1a1a', borderColor: '#d4af37' }}
            >
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="flex items-center gap-2 px-4 py-2"
                  style={{
                    color: activeTab === tab.value ? '#0f0f0f' : '#999',
                    background: activeTab === tab.value ? '#d4af37' : 'transparent',
                  }}
                >
                  {tab.icon}
                  <span className="text-xs font-bold">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card style={{ background: '#1a1a1a', borderColor: '#d4af37' }}>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl" style={{ color: '#d4af37' }}>Market Analysis - {selectedSymbol}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div ref={chartContainerRef} className="w-full h-[300px] md:h-[450px] rounded-lg" style={{ background: '#0f0f0f' }} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((signal) => (
                <Card key={signal.symbol} style={{ background: '#1a1a1a', borderColor: '#d4af37' }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle style={{ color: '#d4af37' }}>{signal.symbol}</CardTitle>
                      <Badge style={{ background: signal.action === 'BUY' ? '#00ff88' : signal.action === 'SELL' ? '#ff3366' : '#999', color: '#000' }}>
                        {signal.action}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Confidence</p>
                        <p className="text-xl font-bold text-white">{(signal.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">AI Score</p>
                        <p className="text-xl font-bold text-white">{signal.score}/100</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 italic">"{signal.reasoning}"</p>
                    <Button className="w-full mt-4" size="sm" style={{ background: '#d4af37', color: '#0f0f0f' }}>Execute Trade</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs placeholder */}
          {['whales', 'sentiment', 'onchain', 'solana', 'trading', 'settings'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card style={{ background: '#1a1a1a', borderColor: '#d4af37' }}>
                <CardContent className="p-12 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-[#d4af37] animate-pulse" />
                  <h3 className="text-xl font-bold text-white mb-2">{tab.toUpperCase()} Module</h3>
                  <p className="text-gray-400">Initializing advanced intelligence modules for {tab}...</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
      
      {/* Footer / Status Bar */}
      <footer className="border-t p-2 text-[10px] text-center text-gray-600" style={{ background: '#0f0f0f', borderColor: '#d4af37' }}>
        SQL ENGINE PRO v2.0.4 | System Status: Optimal | Latency: 24ms | Connected to TiDB & Binance Cloud
      </footer>
    </div>
  );
}
