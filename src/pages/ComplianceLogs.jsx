import React, { useState, useMemo } from 'react';
import { useEngine } from '../context/EngineContext';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, Filter, Shield } from 'lucide-react';

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

const StatusBadge = ({ status }) => {
    const config = {
        'PASS': { color: 'var(--up)', icon: CheckCircle },
        'FAIL': { color: 'var(--down)', icon: XCircle },
        'WARN': { color: 'var(--accent-primary)', icon: AlertTriangle },
        'PENDING': { color: 'var(--text-dim)', icon: Clock },
    };
    const { color, icon: Icon } = config[status] || config['PENDING'];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color, fontSize: '11px', fontWeight: 600 }}>
            <Icon size={12} /> {status}
        </span>
    );
};

/* ============================================================
   MOCK COMPLIANCE DATA
   ------------------------------------------------------------
   In production, this would come from:
   - Compliance Engine for rule checks
   - Database for audit trail
   - Real-time alerts from surveillance system
   ============================================================ */

const COMPLIANCE_RULES = [
    { id: 'CR-001', name: 'Position Limit Check', description: 'No single position > 15% of NAV', status: 'PASS', lastCheck: '2 min ago' },
    { id: 'CR-002', name: 'Sector Concentration', description: 'No sector > 30% of portfolio', status: 'PASS', lastCheck: '2 min ago' },
    { id: 'CR-003', name: 'Wash Trade Detection', description: 'No self-matching trades', status: 'PASS', lastCheck: '5 min ago' },
    { id: 'CR-004', name: 'Order Rate Limit', description: 'Max 100 orders/second', status: 'PASS', lastCheck: '1 min ago' },
    { id: 'CR-005', name: 'Pre-Trade Risk Check', description: 'All orders validated before submission', status: 'PASS', lastCheck: '1 min ago' },
    { id: 'CR-006', name: 'Market Manipulation', description: 'Layering/Spoofing detection', status: 'WARN', lastCheck: '10 min ago' },
];

const ALERTS = [
    { id: 1, time: '01:25:42', severity: 'INFO', message: 'Trading session started successfully', source: 'SYSTEM' },
    { id: 2, time: '01:25:45', severity: 'INFO', message: 'Connected to NEPSE market data feed', source: 'FEED' },
    { id: 3, time: '01:26:01', severity: 'INFO', message: 'Risk Engine initialized with 6 positions', source: 'RISK' },
    { id: 4, time: '01:26:15', severity: 'WARN', message: 'Unusual volume detected in HIDCL (+250%)', source: 'SURVEILLANCE' },
    { id: 5, time: '01:27:03', severity: 'INFO', message: 'Pre-trade check passed for BUY NABIL x100', source: 'COMPLIANCE' },
];

/* --- MAIN COMPONENT --- */
export default function ComplianceLogs() {
    const { logs } = useEngine();
    const [filter, setFilter] = useState('ALL');

    // Combine engine logs with mock alerts for display
    const allLogs = useMemo(() => {
        const engineLogs = logs.map(log => ({
            id: log.id,
            time: log.time,
            severity: log.type === 'ERROR' ? 'ERROR' : 'INFO',
            message: log.msg,
            source: 'ENGINE'
        }));
        return [...ALERTS, ...engineLogs].slice(0, 100);
    }, [logs]);

    const filteredLogs = filter === 'ALL' ? allLogs : allLogs.filter(l => l.severity === filter);

    const severityColor = (sev) => {
        if (sev === 'ERROR') return 'var(--down)';
        if (sev === 'WARN') return 'var(--accent-primary)';
        return 'var(--text-dim)';
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', height: '100%', gap: '1px', background: 'var(--border)', padding: '1px' }}>

            {/* LEFT: AUDIT LOG TERMINAL */}
            <Panel
                title="Audit Log Terminal"
                actions={
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {['ALL', 'INFO', 'WARN', 'ERROR'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    background: filter === f ? 'var(--accent-primary)' : 'transparent',
                                    color: filter === f ? '#000' : 'var(--text-dim)',
                                    border: '1px solid var(--border)', padding: '2px 6px', fontSize: '9px', cursor: 'pointer'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                }
            >
                <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '11px', padding: '10px', background: '#000' }}>
                    {filteredLogs.length === 0 && <div style={{ color: 'var(--text-dim)' }}>// No logs to display</div>}
                    {filteredLogs.map(log => (
                        <div key={log.id} style={{ marginBottom: '4px', display: 'flex', gap: '10px' }}>
                            <span style={{ color: 'var(--text-dim)', minWidth: '70px' }}>[{log.time}]</span>
                            <span style={{ color: severityColor(log.severity), minWidth: '50px' }}>{log.severity}</span>
                            <span style={{ color: 'var(--accent-secondary)', minWidth: '80px' }}>{log.source}</span>
                            <span style={{ color: 'var(--text-primary)' }}>{log.message}</span>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* RIGHT: COMPLIANCE STATUS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <Panel title="Compliance Rules" style={{ flex: 1 }}>
                    {COMPLIANCE_RULES.map(rule => (
                        <div key={rule.id} style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '12px' }}>{rule.name}</span>
                                <StatusBadge status={rule.status} />
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px' }}>{rule.description}</div>
                            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                                <Clock size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Last checked: {rule.lastCheck}
                            </div>
                        </div>
                    ))}
                </Panel>

                <Panel title="System Status" style={{ height: '120px' }}>
                    <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} color="var(--up)" />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600 }}>Compliance Mode</div>
                                <div style={{ fontSize: '10px', color: 'var(--up)' }}>ACTIVE</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} color="var(--accent-primary)" />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600 }}>Logs Today</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{allLogs.length} entries</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={16} color="var(--up)" />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600 }}>Rules Passing</div>
                                <div style={{ fontSize: '10px', color: 'var(--up)' }}>{COMPLIANCE_RULES.filter(r => r.status === 'PASS').length}/{COMPLIANCE_RULES.length}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={16} color="var(--accent-primary)" />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600 }}>Warnings</div>
                                <div style={{ fontSize: '10px', color: 'var(--accent-primary)' }}>{COMPLIANCE_RULES.filter(r => r.status === 'WARN').length}</div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

        </div>
    );
}
