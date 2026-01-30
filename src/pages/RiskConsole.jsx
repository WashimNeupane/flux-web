import React, { useMemo } from 'react';
import { useEngine } from '../context/EngineContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Activity, Percent } from 'lucide-react';

/* --- REUSABLE COMPONENTS --- */
const Panel = ({ title, children, style }) => (
    <div style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-panel)', border: '1px solid var(--border)',
        overflow: 'hidden', ...style
    }}>
        <div style={{
            padding: '6px 10px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
            {title}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>{children}</div>
    </div>
);

const MetricCard = ({ label, value, sub, color = 'var(--accent-primary)', icon: Icon }) => (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ color: 'var(--text-dim)', fontSize: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {Icon && <Icon size={12} />} {label}
        </div>
        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: color }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{sub}</div>
    </div>
);

const ProgressBar = ({ label, value, max, color = 'var(--accent-primary)' }) => {
    const pct = (value / max) * 100;
    const isWarning = pct > 80;
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                <span className="mono" style={{ color: isWarning ? 'var(--down)' : 'var(--text-primary)' }}>{value.toLocaleString()} / {max.toLocaleString()}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: isWarning ? 'var(--down)' : color, transition: 'width 0.3s' }}></div>
            </div>
        </div>
    );
};

/* ============================================================
   MOCK DATA
   ------------------------------------------------------------
   In production, this data would come from:
   - Order Management System (OMS) for positions
   - Risk Engine (Core) for VaR, Sharpe, Drawdown
   - Database for historical P&L
   
   Currently, only PRICES are live from the engine.
   Everything else is simulated for UI demonstration.
   ============================================================ */

const POSITIONS = [
    { symbol: 'NABIL', qty: 500, avgCost: 480, sector: 'Banking' },
    { symbol: 'NICA', qty: 300, avgCost: 330, sector: 'Banking' },
    { symbol: 'HIDCL', qty: 1000, avgCost: 260, sector: 'Hydro' },
    { symbol: 'API', qty: 200, avgCost: 290, sector: 'Hydro' },
    { symbol: 'NTC', qty: 100, avgCost: 800, sector: 'Telecom' },
    { symbol: 'SHIVM', qty: 400, avgCost: 550, sector: 'Cement' },
];

// Mock P&L history (would come from database in production)
const generatePnLHistory = () => {
    const data = [];
    let cumulative = 0;
    for (let i = 29; i >= 0; i--) {
        const daily = (Math.random() - 0.45) * 50000;
        cumulative += daily;
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({ date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }), daily, cumulative });
    }
    return data;
};

const COLORS = ['#ff9f43', '#00d2d3', '#10ac84', '#ee5253', '#5f27cd', '#54a0ff'];

/* --- MAIN COMPONENT --- */
export default function RiskConsole() {
    const { tickers, risk } = useEngine();

    // Calculate position metrics using live prices
    const positionsWithPnL = useMemo(() => {
        return POSITIONS.map(pos => {
            const livePrice = tickers[pos.symbol]?.price || pos.avgCost;
            const marketValue = pos.qty * livePrice;
            const costBasis = pos.qty * pos.avgCost;
            const pnl = marketValue - costBasis;
            const pnlPct = (pnl / costBasis) * 100;
            return { ...pos, livePrice, marketValue, pnl, pnlPct };
        });
    }, [tickers]);

    const totalExposure = positionsWithPnL.reduce((sum, p) => sum + p.marketValue, 0);
    const totalPnL = positionsWithPnL.reduce((sum, p) => sum + p.pnl, 0);

    // Sector breakdown
    const sectorData = useMemo(() => {
        const sectors = {};
        positionsWithPnL.forEach(p => {
            sectors[p.sector] = (sectors[p.sector] || 0) + p.marketValue;
        });
        return Object.entries(sectors).map(([name, value]) => ({ name, value }));
    }, [positionsWithPnL]);

    const pnlHistory = useMemo(() => generatePnLHistory(), []);

    // LIVE RISK METRICS FROM C++ ENGINE (via WebSocket)
    const var95 = risk.var95 || totalExposure * 0.035;
    const maxDrawdown = risk.drawdown || 0;
    const sharpeRatio = risk.sharpe || 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gridTemplateRows: 'auto 1fr 1fr', gap: '1px', height: '100%', background: 'var(--border)', padding: '1px' }}>

            {/* ROW 1: KEY METRICS - NOW LIVE FROM CORE */}
            <MetricCard icon={AlertTriangle} label="Value at Risk (95%)" value={`Rs ${(var95 / 1000).toFixed(1)}K`} sub="Monte Carlo (10K sims)" color="var(--down)" />
            <MetricCard icon={Activity} label="Total Exposure" value={`Rs ${((risk.exposure || totalExposure) / 1000000).toFixed(2)}M`} sub={`${positionsWithPnL.length} Positions`} />
            <MetricCard icon={TrendingDown} label="Max Drawdown" value={`${maxDrawdown.toFixed(2)}%`} sub="Rolling 30 Days" color="var(--down)" />
            <MetricCard icon={TrendingUp} label="Sharpe Ratio" value={sharpeRatio.toFixed(3)} sub="Annualized" color="var(--up)" />

            {/* ROW 2: POSITIONS & LIMITS */}
            <Panel title="Position Heatmap" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {positionsWithPnL.map(pos => (
                        <div
                            key={pos.symbol}
                            style={{
                                padding: '10px',
                                background: pos.pnl >= 0 ? 'rgba(16, 172, 132, 0.1)' : 'rgba(238, 82, 83, 0.1)',
                                border: `1px solid ${pos.pnl >= 0 ? 'var(--up)' : 'var(--down)'}`,
                                borderLeft: `4px solid ${pos.pnl >= 0 ? 'var(--up)' : 'var(--down)'}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700 }}>{pos.symbol}</span>
                                <span className="mono" style={{ color: pos.pnl >= 0 ? 'var(--up)' : 'var(--down)', fontSize: '12px' }}>
                                    {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                                </span>
                            </div>
                            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {pos.qty} @ {pos.livePrice.toFixed(2)}
                            </div>
                            <div className="mono" style={{ fontSize: '14px', marginTop: '4px' }}>
                                Rs {pos.marketValue.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel title="Risk Limits" style={{ gridColumn: 'span 2' }}>
                <ProgressBar label="Gross Exposure" value={totalExposure} max={5000000} />
                <ProgressBar label="Single Stock Limit (15%)" value={positionsWithPnL[0]?.marketValue || 0} max={totalExposure * 0.15} color="var(--accent-secondary)" />
                <ProgressBar label="Sector Concentration (30%)" value={sectorData[0]?.value || 0} max={totalExposure * 0.30} color="var(--accent-secondary)" />
                <ProgressBar label="Daily Loss Limit" value={Math.abs(Math.min(0, totalPnL))} max={100000} color="var(--down)" />
                <ProgressBar label="Margin Utilization" value={totalExposure * 0.4} max={2000000} />
            </Panel>

            {/* ROW 3: CHARTS */}
            <Panel title="Sector Allocation" style={{ gridColumn: 'span 2' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
            </Panel>

            <Panel title="30-Day P&L" style={{ gridColumn: 'span 2' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pnlHistory}>
                        <defs>
                            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--up)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--up)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} stroke="var(--border)" />
                        <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} stroke="var(--border)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--border)' }} formatter={(value) => `Rs ${value.toLocaleString()}`} />
                        <Area type="monotone" dataKey="cumulative" stroke="var(--up)" strokeWidth={2} fill="url(#pnlGradient)" isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </Panel>

        </div>
    );
}
