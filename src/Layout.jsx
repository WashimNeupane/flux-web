import { LayoutDashboard, ShieldAlert, Zap, FileText, Settings, Activity, Server, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import MarketOverview from './pages/MarketOverview';
import RiskConsole from './pages/RiskConsole';
import ComplianceLogs from './pages/ComplianceLogs';
import AlgoTrading from './pages/AlgoTrading';
import { useEngine } from './context/EngineContext';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: active ? 'var(--accent-primary)' : 'transparent',
            color: active ? '#000' : 'var(--text-primary)',
            border: 'none',
            padding: '0 16px',
            height: '100%',
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.1s'
        }}
    >
        <Icon size={14} />
        {label}
    </button>
);

export default function Layout() {
    const [activeTab, setActiveTab] = useState('overview');
    const [time, setTime] = useState(new Date());
    const { status } = useEngine();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
            {/* TERMINAL HEADER */}
            <div style={{
                height: '40px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', padding: '0 0'
            }}>
                <div style={{ padding: '0 20px', fontWeight: 900, fontSize: '16px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} /> FLUX.TERMINAL
                </div>
                <div style={{ height: '100%', width: '1px', background: 'var(--border)' }}></div>

                <div style={{ display: 'flex', height: '100%' }}>
                    <NavItem icon={LayoutDashboard} label="Market" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <NavItem icon={ShieldAlert} label="Risk" active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} />
                    <NavItem icon={Zap} label="Algo" active={activeTab === 'algo'} onClick={() => setActiveTab('algo')} />
                    <NavItem icon={FileText} label="Compliance" active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} />
                </div>

                <div style={{ flex: 1 }}></div>

                <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: status === 'CONNECTED' ? 'var(--up)' : 'var(--down)' }}>
                        <Server size={12} /> {status}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
                        <Clock size={12} /> {time.toLocaleTimeString()}
                    </div>
                    <div style={{
                        width: '24px', height: '24px', background: 'var(--accent-primary)', borderRadius: '2px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold'
                    }}>
                        W
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {activeTab === 'overview' && <MarketOverview />}
                {activeTab === 'risk' && <RiskConsole />}
                {activeTab === 'algo' && <AlgoTrading />}
                {activeTab === 'compliance' && <ComplianceLogs />}
            </div>

            {/* TICKER FOOTER */}
            <div style={{ height: '24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ padding: '0 10px', background: 'var(--accent-primary)', color: '#000', fontSize: '10px', fontWeight: 'bold', height: '100%', display: 'flex', alignItems: 'center' }}>
                    NOTIFICATIONS
                </div>
                <div className="mono" style={{ padding: '0 10px', fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    SYSTEM: Connected to Flux Core v1.0.0 [ws://localhost:9000] ... DATA FEED STABLE ... LATENCY: 2ms
                </div>
            </div>
        </div>
    );
}
