import React, { useState, useMemo } from 'react';
import { useEngine } from '../context/EngineContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart } from 'recharts';
import { Zap, Play, Pause, Settings, TrendingUp, TrendingDown, Activity, Clock, Target, Cpu, BarChart2, Code } from 'lucide-react';

/* --- COMPONENTS --- */
const Panel = ({ title, children, style, actions }) => (
    <div style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-panel)', border: '1px solid var(--border)',
        overflow: 'hidden', ...style
    }}>
        <div style={{
            padding: '6px 10px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
            <span>{title}</span>
            {actions}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
);

const MetricBox = ({ label, value, sub, color = 'var(--text-primary)' }) => (
    <div style={{ textAlign: 'center', padding: '8px' }}>
        <div style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div className="mono" style={{ fontSize: '16px', fontWeight: 600, color }}>{value}</div>
        {sub && <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{sub}</div>}
    </div>
);

const StrategyCard = ({ strategy, active, onToggle, onSelect }) => (
    <div
        onClick={onSelect}
        style={{
            padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
            background: active ? 'rgba(255, 159, 67, 0.05)' : 'transparent',
            borderLeft: active ? '3px solid var(--accent-primary)' : '3px solid transparent'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{strategy.name}</span>
                <span style={{
                    fontSize: '9px', padding: '2px 6px', borderRadius: '2px',
                    background: strategy.status === 'LIVE' ? 'var(--up)' : strategy.status === 'PAPER' ? 'var(--accent-secondary)' : 'var(--text-dim)',
                    color: '#000', fontWeight: 600
                }}>
                    {strategy.status}
                </span>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                style={{
                    background: strategy.running ? 'var(--down)' : 'var(--up)',
                    border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: '#000'
                }}
            >
                {strategy.running ? <><Pause size={10} /> STOP</> : <><Play size={10} /> START</>}
            </button>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: 'var(--text-dim)' }}>
            <span>PnL: <span style={{ color: strategy.pnl >= 0 ? 'var(--up)' : 'var(--down)' }}>{strategy.pnl >= 0 ? '+' : ''}{strategy.pnl.toFixed(2)}%</span></span>
            <span>Sharpe: <span style={{ color: 'var(--text-primary)' }}>{strategy.sharpe.toFixed(2)}</span></span>
            <span>Trades: <span style={{ color: 'var(--text-primary)' }}>{strategy.trades}</span></span>
        </div>
    </div>
);

/* ============================================================
   MOCK ALGO STRATEGY DATA
   ------------------------------------------------------------
   In production, this would come from:
   - Strategy Engine for live performance
   - Backtesting Engine for historical metrics
   - Order Management System for execution stats
   
   The formulas shown are real quantitative finance models.
   ============================================================ */

const STRATEGIES = [
    { id: 1, name: 'MeanReversion.Alpha', type: 'Mean Reversion', status: 'LIVE', running: true, pnl: 4.32, sharpe: 1.85, trades: 127, winRate: 0.62, maxDD: -2.1 },
    { id: 2, name: 'Momentum.Beta', type: 'Trend Following', status: 'LIVE', running: true, pnl: 2.15, sharpe: 1.42, trades: 89, winRate: 0.58, maxDD: -3.4 },
    { id: 3, name: 'StatArb.Gamma', type: 'Statistical Arbitrage', status: 'PAPER', running: true, pnl: 1.87, sharpe: 2.10, trades: 234, winRate: 0.71, maxDD: -1.2 },
    { id: 4, name: 'VWAP.Execution', type: 'Execution Algo', status: 'LIVE', running: false, pnl: 0.12, sharpe: 0.95, trades: 412, winRate: 0.85, maxDD: -0.3 },
    { id: 5, name: 'PairsTrade.Delta', type: 'Pairs Trading', status: 'STOPPED', running: false, pnl: -1.23, sharpe: 0.45, trades: 56, winRate: 0.48, maxDD: -5.1 },
];

const STRATEGY_FORMULAS = {
    'Mean Reversion': {
        formula: 'z_score = (price - μ) / σ',
        description: 'Bollinger Band Z-Score Entry',
        params: [
            { name: 'Lookback Period', value: 20, unit: 'bars' },
            { name: 'Entry Z-Score', value: 2.0, unit: 'σ' },
            { name: 'Exit Z-Score', value: 0.5, unit: 'σ' },
            { name: 'Stop Loss', value: 3.0, unit: 'σ' },
        ]
    },
    'Trend Following': {
        formula: 'signal = EMA(12) - EMA(26)',
        description: 'MACD Crossover with ADX Filter',
        params: [
            { name: 'Fast EMA', value: 12, unit: 'bars' },
            { name: 'Slow EMA', value: 26, unit: 'bars' },
            { name: 'ADX Threshold', value: 25, unit: '' },
            { name: 'Trailing Stop', value: 2.5, unit: '%' },
        ]
    },
    'Statistical Arbitrage': {
        formula: 'spread = β₀ + β₁·X₁ + ε',
        description: 'Cointegrated Pair Spread (OLS)',
        params: [
            { name: 'Hedge Ratio (β₁)', value: 1.23, unit: '' },
            { name: 'Half-Life', value: 8.5, unit: 'days' },
            { name: 'Entry Threshold', value: 1.5, unit: 'σ' },
            { name: 'Rebalance Freq', value: 1, unit: 'hour' },
        ]
    },
    'Execution Algo': {
        formula: 'target_qty = V(t) / V_total × Q',
        description: 'Volume Weighted Participation',
        params: [
            { name: 'Participation Rate', value: 15, unit: '%' },
            { name: 'Max Spread', value: 0.1, unit: '%' },
            { name: 'Urgency', value: 'Medium', unit: '' },
            { name: 'Dark Pool', value: 'Enabled', unit: '' },
        ]
    },
    'Pairs Trading': {
        formula: 'ratio = P_A / P_B',
        description: 'Price Ratio Mean Reversion',
        params: [
            { name: 'Pair', value: 'NABIL/NICA', unit: '' },
            { name: 'Lookback', value: 60, unit: 'days' },
            { name: 'Entry σ', value: 2.0, unit: '' },
            { name: 'Max Position', value: 100000, unit: 'NPR' },
        ]
    },
};

const generateBacktestData = () => {
    const data = [];
    let equity = 1000000;
    for (let i = 0; i < 252; i++) {
        const dailyReturn = (Math.random() - 0.48) * 0.02;
        equity *= (1 + dailyReturn);
        const date = new Date();
        date.setDate(date.getDate() - (252 - i));
        data.push({
            day: i,
            date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            equity: Math.round(equity),
            drawdown: Math.random() * -5
        });
    }
    return data;
};

const generateSignals = () => {
    const signals = [];
    const symbols = ['NABIL', 'NICA', 'HIDCL', 'API', 'NTC'];
    for (let i = 0; i < 10; i++) {
        signals.push({
            id: i,
            time: `01:${String(20 + i).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            side: Math.random() > 0.5 ? 'BUY' : 'SELL',
            price: (200 + Math.random() * 500).toFixed(2),
            qty: Math.floor(Math.random() * 500) + 50,
            strategy: STRATEGIES[Math.floor(Math.random() * 3)].name,
            status: ['FILLED', 'FILLED', 'PENDING', 'FILLED'][Math.floor(Math.random() * 4)]
        });
    }
    return signals.reverse();
};

/* --- MAIN COMPONENT --- */
export default function AlgoTrading() {
    const { tickers, signals: liveSignals } = useEngine();
    const [selectedStrategy, setSelectedStrategy] = useState(STRATEGIES[0]);
    const [strategies, setStrategies] = useState(STRATEGIES);

    const backtestData = useMemo(() => generateBacktestData(), [selectedStrategy.id]);
    // Use LIVE signals from C++ engine, fallback to mock if empty
    const signals = liveSignals.length > 0 ? liveSignals : useMemo(() => generateSignals(), []);
    const formulaInfo = STRATEGY_FORMULAS[selectedStrategy.type] || STRATEGY_FORMULAS['Mean Reversion'];

    const toggleStrategy = (id) => {
        setStrategies(prev => prev.map(s => s.id === id ? { ...s, running: !s.running } : s));
    };

    // Execution metrics (mock)
    const executionStats = {
        fillRate: 98.2,
        avgSlippage: 0.03,
        avgLatency: 2.4,
        ordersToday: 156
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gridTemplateRows: '1fr 1fr', height: '100%', gap: '1px', background: 'var(--border)', padding: '1px' }}>

            {/* LEFT: STRATEGY LIST */}
            <Panel title="Strategy Engine" style={{ gridRow: 'span 2' }}>
                {strategies.map(s => (
                    <StrategyCard
                        key={s.id}
                        strategy={s}
                        active={selectedStrategy.id === s.id}
                        onToggle={() => toggleStrategy(s.id)}
                        onSelect={() => setSelectedStrategy(s)}
                    />
                ))}
            </Panel>

            {/* CENTER TOP: BACKTEST CHART */}
            <Panel title={`Backtest: ${selectedStrategy.name} [1Y]`}>
                <div style={{ height: '100%', padding: '10px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={backtestData}>
                            <defs>
                                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontSize: 9 }} stroke="var(--border)" interval={40} />
                            <YAxis yAxisId="equity" orientation="right" tick={{ fill: 'var(--text-dim)', fontSize: 9 }} stroke="var(--border)" tickFormatter={v => `${(v / 1000000).toFixed(2)}M`} />
                            <YAxis yAxisId="dd" orientation="left" tick={{ fill: 'var(--text-dim)', fontSize: 9 }} stroke="var(--border)" domain={[-10, 0]} tickFormatter={v => `${v}%`} />
                            <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--border)', fontSize: '11px' }} />
                            <Bar yAxisId="dd" dataKey="drawdown" fill="var(--down)" opacity={0.3} />
                            <Area yAxisId="equity" type="monotone" dataKey="equity" stroke="var(--accent-primary)" strokeWidth={2} fill="url(#equityGrad)" isAnimationActive={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </Panel>

            {/* RIGHT TOP: STRATEGY PARAMETERS */}
            <Panel title="Model Parameters" actions={<Settings size={12} style={{ cursor: 'pointer' }} />}>
                <div style={{ padding: '10px' }}>
                    <div style={{
                        background: '#000', border: '1px solid var(--border)', padding: '10px', marginBottom: '12px',
                        fontFamily: 'Roboto Mono', fontSize: '14px', color: 'var(--accent-secondary)', textAlign: 'center'
                    }}>
                        {formulaInfo.formula}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '12px', textAlign: 'center' }}>
                        {formulaInfo.description}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {formulaInfo.params.map((p, i) => (
                            <div key={i} style={{ background: 'var(--bg-secondary)', padding: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '2px' }}>{p.name}</div>
                                <div className="mono" style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>
                                    {p.value} <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{p.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Panel>

            {/* CENTER BOTTOM: SIGNALS */}
            <Panel title="Live Signals">
                <div style={{ fontSize: '11px' }}>
                    <div style={{ display: 'flex', padding: '6px 10px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-dim)' }}>
                        <span style={{ width: '70px' }}>TIME</span>
                        <span style={{ width: '60px' }}>SYMBOL</span>
                        <span style={{ width: '45px' }}>SIDE</span>
                        <span style={{ width: '70px' }}>PRICE</span>
                        <span style={{ width: '50px' }}>QTY</span>
                        <span style={{ flex: 1 }}>STRATEGY</span>
                        <span style={{ width: '60px' }}>STATUS</span>
                    </div>
                    {signals.map(sig => (
                        <div key={sig.id} style={{ display: 'flex', padding: '5px 10px', borderBottom: '1px solid #222' }} className="mono">
                            <span style={{ width: '70px', color: 'var(--text-dim)' }}>{sig.time}</span>
                            <span style={{ width: '60px', fontWeight: 600 }}>{sig.symbol}</span>
                            <span style={{ width: '45px', color: sig.side === 'BUY' ? 'var(--up)' : 'var(--down)' }}>{sig.side}</span>
                            <span style={{ width: '70px' }}>{typeof sig.price === 'number' ? sig.price.toFixed(2) : sig.price}</span>
                            <span style={{ width: '50px' }}>{sig.zscore ? `z=${sig.zscore.toFixed(2)}` : (sig.qty || '-')}</span>
                            <span style={{ flex: 1, color: 'var(--text-dim)' }}>{sig.strategy}</span>
                            <span style={{ width: '60px', color: sig.status === 'FILLED' || sig.status === 'GENERATED' ? 'var(--up)' : 'var(--accent-primary)' }}>{sig.status}</span>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* RIGHT BOTTOM: EXECUTION STATS */}
            <Panel title="Execution Analytics">
                <div style={{ padding: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <MetricBox label="Fill Rate" value={`${executionStats.fillRate}%`} color="var(--up)" />
                        <MetricBox label="Avg Slippage" value={`${executionStats.avgSlippage}%`} color="var(--accent-primary)" />
                        <MetricBox label="Latency" value={`${executionStats.avgLatency}ms`} sub="tick-to-trade" />
                        <MetricBox label="Orders Today" value={executionStats.ordersToday} />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>Strategy Performance</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Win Rate</div>
                            <div className="mono" style={{ fontSize: '18px', color: 'var(--up)' }}>{(selectedStrategy.winRate * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Max Drawdown</div>
                            <div className="mono" style={{ fontSize: '18px', color: 'var(--down)' }}>{selectedStrategy.maxDD}%</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Sharpe Ratio</div>
                            <div className="mono" style={{ fontSize: '18px', color: 'var(--accent-primary)' }}>{selectedStrategy.sharpe}</div>
                        </div>
                    </div>
                </div>
            </Panel>

        </div>
    );
}
