
import React, { useState } from 'react';
import { useEngine } from '../context/EngineContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, DollarSign } from 'lucide-react';

const Card = ({ children, style }) => (
    <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', ...style }}>{children}</div>
);

const TickerCard = ({ symbol, data, onClick, active }) => (
    <div
        onClick={onClick}
        style={{
            background: active ? 'rgba(56, 189, 248, 0.1)' : '#1e293b',
            borderRadius: '12px', padding: '16px',
            border: active ? '1px solid #38bdf8' : '1px solid #334155',
            cursor: 'pointer', transition: 'all 0.2s', minWidth: '200px'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{symbol}</span>
            <Activity size={16} color="#38bdf8" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>
            {data.price?.toLocaleString('en-NP', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', marginTop: '5px' }}>
            <span style={{ color: '#22c55e' }}>+0.00%</span>
            <span style={{ color: '#94a3b8' }}>Vol: {data.volume}</span>
        </div>
    </div>
);

export default function MarketOverview() {
    const { tickers, status } = useEngine();
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const activeSymbol = selectedSymbol || Object.keys(tickers)[0];
    const chartData = activeSymbol ? tickers[activeSymbol]?.history.map((p, i) => ({ time: i, price: p })) : [];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '6px 12px', borderRadius: '20px', background: status === 'CONNECTED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: status === 'CONNECTED' ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.8rem' }}>
                        {status === 'CONNECTED' ? '● SYSTEM ONLINE' : '● DISCONNECTED'}
                    </div>
                </div>
                <Card style={{ flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>REAL-TIME MARKET DATA</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeSymbol || 'WAITING...'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{tickers[activeSymbol]?.price?.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: '#64748b' }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} itemStyle={{ color: '#38bdf8' }} />
                                <Area type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#94a3b8' }}>LIVE WATCHLIST</h3>
                {Object.entries(tickers).map(([sym, data]) => (
                    <TickerCard key={sym} symbol={sym} data={data} active={activeSymbol === sym} onClick={() => setSelectedSymbol(sym)} />
                ))}
            </div>
        </div>
    );
}
