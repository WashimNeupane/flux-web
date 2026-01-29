
import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const MetricCard = ({ label, value, sub, color = '#38bdf8' }) => (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: color }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>{sub}</div>
    </div>
);

export default function RiskConsole() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck /> Risk Management Console
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <MetricCard label="Value at Risk (95%)" value="Rs 45,230" sub="Confidence Interval: 1 Day" color="#ef4444" />
                <MetricCard label="Total Exposure" value="Rs 1.2M" sub="Gross Leverage: 1.5x" />
                <MetricCard label="Daily Drawdown" value="-1.2%" sub="Limit: -5.0%" color="#eab308" />
                <MetricCard label="Sharpe Ratio (Est.)" value="2.4" sub="Rolling 30-Day" color="#22c55e" />
            </div>
        </div>
    );
}
