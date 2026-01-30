import React, { useState } from 'react';
import { useEngine } from '../context/EngineContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, ArrowUp, ArrowDown } from 'lucide-react';

/* --- UI COMPONENTS --- */
const Panel = ({ title, children, style }) => (
    <div style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-panel)', border: '1px solid var(--border)',
        overflow: 'hidden', ...style
    }}>
        <div style={{
            padding: '4px 8px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
            {title}
        </div>
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>{children}</div>
    </div>
);

const TickerRow = ({ symbol, data, onClick, active }) => {
    // Determine color based on price vs previous (mock logic)
    // In real app, we would store 'prevClose'
    const isUp = true;
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px',
                cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: active ? '#2c3e50' : 'transparent',
                color: active ? '#fff' : 'inherit'
            }}
        >
            <div style={{ fontWeight: 700, width: '60px' }}>{symbol}</div>
            <div className="mono" style={{ flex: 1, textAlign: 'right', color: isUp ? 'var(--up)' : 'var(--down)' }}>
                {data.price?.toFixed(2)}
            </div>
            <div className="mono" style={{ width: '60px', textAlign: 'right', fontSize: '10px', color: 'var(--text-dim)' }}>
                {data.volume}
            </div>
        </div>
    );
};

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

/* --- MAIN VIEW --- */
export default function MarketOverview() {
    const { tickers } = useEngine();
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [timeframe, setTimeframe] = useState('1D');

    const activeSymbol = selectedSymbol || Object.keys(tickers)[0];
    const tickerData = tickers[activeSymbol];
    const latestPrice = tickerData?.price || 0;

    // --- MOCK HISTORICAL DATA GENERATOR ---
    // In a real app, this would fetch from REST API: /api/history?sym=NABIL&tf=1M
    const getChartData = () => {
        if (!tickerData) return [];
        // If 1D, use live ticks from context
        if (timeframe === '1D') return tickerData.history ? tickerData.history.map((p, i) => ({ time: i, price: p })) : [];

        // For other timeframes, generate deterministic mock data
        const points = timeframe === '1W' ? 50 : timeframe === '1M' ? 100 : 200;
        const volatility = timeframe === '1W' ? 0.02 : 0.1;
        let price = latestPrice;
        const data = [];
        // Generate backwards
        for (let i = 0; i < points; i++) {
            data.unshift({ time: i, price: price });
            price = price + (price * (Math.random() - 0.5) * volatility);
        }
        return data;
    };

    const chartData = getChartData();
    const startPrice = chartData.length > 0 ? chartData[0].price : latestPrice;
    const change = latestPrice - startPrice;
    const changePercent = startPrice > 0 ? (change / startPrice) * 100 : 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 280px', height: '100%', gap: '1px', background: 'var(--border)' }}>

            {/* LEFT: WATCHLIST */}
            <Panel title="Market Watch [NSE]">
                {Object.entries(tickers).map(([sym, data]) => (
                    <TickerRow key={sym} symbol={sym} data={data} active={activeSymbol === sym} onClick={() => setSelectedSymbol(sym)} />
                ))}
            </Panel>

            {/* MIDDLE: CHARTING */}
            <Panel title={`Symbol: ${activeSymbol || '---'} [${timeframe}]`}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '32px', fontWeight: 300, fontFamily: 'Roboto Mono' }}>{latestPrice.toLocaleString()}</span>
                            <span style={{ marginLeft: '10px', color: change >= 0 ? 'var(--up)' : 'var(--down)', fontSize: '14px' }}>
                                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                            </span>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                                {TIMEFRAMES.map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setTimeframe(tf)}
                                        style={{
                                            background: timeframe === tf ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                            color: timeframe === tf ? '#000' : 'var(--text-dim)',
                                            border: '1px solid var(--border)', padding: '2px 8px', fontSize: '10px', fontWeight: 600, cursor: 'pointer'
                                        }}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>OPEN</div><div>{chartData.length > 0 ? chartData[0].price.toFixed(2) : '-'}</div></div>
                            <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>HIGH</div><div>{(latestPrice * 1.02).toFixed(2)}</div></div>
                            <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>LOW</div><div>{(latestPrice * 0.98).toFixed(2)}</div></div>
                        </div>
                    </div>
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={change >= 0 ? "var(--up)" : "var(--down)"} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={change >= 0 ? "var(--up)" : "var(--down)"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} stroke="var(--border)" />
                                <Tooltip
                                    contentStyle={{ background: '#000', border: '1px solid var(--border)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={change >= 0 ? "var(--up)" : "var(--down)"}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Panel>

            {/* RIGHT: DEPTH & TRADES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <Panel title="Order Book (L2)" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', fontSize: '10px', color: 'var(--text-dim)', padding: '5px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ flex: 1 }}>BID QTY</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>PRICE</div>
                        <div style={{ flex: 1, textAlign: 'right' }}>ASK QTY</div>
                    </div>
                    {[...Array(10)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', fontSize: '12px', padding: '2px 5px' }} className="mono">
                            <div style={{ flex: 1, color: 'var(--up)' }}>{(Math.random() * 100).toFixed(0)}</div>
                            <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>{(latestPrice - (i * 0.5)).toFixed(2)}</div>
                            <div style={{ flex: 1, textAlign: 'right', color: 'var(--down)' }}>{(Math.random() * 100).toFixed(0)}</div>
                        </div>
                    ))}
                </Panel>
                <Panel title="Recent Trades" style={{ flex: 1 }}>
                    {[...Array(15)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', fontSize: '11px', borderBottom: '1px solid #222' }} className="mono">
                            <span style={{ color: 'var(--text-dim)' }}>10:42:{10 + i}</span>
                            <span style={{ color: Math.random() > 0.5 ? 'var(--up)' : 'var(--down)' }}>{latestPrice.toFixed(2)}</span>
                            <span>{Math.floor(Math.random() * 500)}</span>
                        </div>
                    ))}
                </Panel>
            </div>

        </div>
    );
}
