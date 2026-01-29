
import { LayoutDashboard, ShieldAlert, Zap, FileText, Settings, Activity } from 'lucide-react';
import React, { useState } from 'react';
import MarketOverview from './pages/MarketOverview';
import RiskConsole from './pages/RiskConsole';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', margin: '4px 0',
            borderRadius: '8px', cursor: 'pointer',
            color: active ? '#38bdf8' : '#94a3b8',
            background: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
            transition: 'all 0.2s'
        }}
    >
        <Icon size={18} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
    </div>
);

export default function Layout() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0b0e11', color: '#e2e8f0' }}>
            <div style={{ width: '260px', background: '#151a21', borderRight: '1px solid #334155', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity color="#38bdf8" />
                    <span>NEPSE <span style={{ color: '#38bdf8' }}>PRIME</span></span>
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, paddingLeft: '16px', marginBottom: '10px', display: 'block' }}>MENU</span>
                    <SidebarItem icon={LayoutDashboard} label="Market Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={ShieldAlert} label="Risk Console" active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} />
                    <SidebarItem icon={Zap} label="Algo Strategies" active={activeTab === 'algo'} onClick={() => setActiveTab('algo')} />
                    <SidebarItem icon={FileText} label="Compliance Logs" active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} />
                </div>
                <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
                    <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '60px', borderBottom: '1px solid #334155', background: '#151a21', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                    <div style={{ color: '#94a3b8' }}>Workspace / <span style={{ color: '#e2e8f0' }}>Main Trader</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#334155' }}></div>
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {activeTab === 'overview' && <MarketOverview />}
                    {activeTab === 'risk' && <RiskConsole />}
                    {activeTab === 'algo' && <div style={{ padding: '20px', border: '1px dashed #334155', borderRadius: '8px', color: '#64748b' }}>Algo Interface Pending Implementation</div>}
                    {activeTab === 'compliance' && <div style={{ padding: '20px', border: '1px dashed #334155', borderRadius: '8px', color: '#64748b' }}>Compliance Interface Pending Implementation</div>}
                </div>
            </div>
        </div>
    );
}
