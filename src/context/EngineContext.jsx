import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const EngineContext = createContext();

export const useEngine = () => useContext(EngineContext);

export const EngineProvider = ({ children }) => {
    const [status, setStatus] = useState('DISCONNECTED');
    const [tickers, setTickers] = useState({});
    const [logs, setLogs] = useState([]);
    const [risk, setRisk] = useState({ var95: 0, exposure: 0, pnl: 0, drawdown: 0, sharpe: 0 });
    const [signals, setSignals] = useState([]);
    const [dataMode, setDataMode] = useState('SIMULATED');  // SIMULATED or REAL
    const ws = useRef(null);
    const reconnectTimeout = useRef(null);

    const connect = () => {
        ws.current = new WebSocket('ws://localhost:9000', 'nepse-stream');

        ws.current.onopen = () => {
            setStatus('CONNECTED');
            addLog('INFO', 'SYSTEM', 'Connected to Flux Core Engine');
        };

        ws.current.onclose = () => {
            setStatus('DISCONNECTED');
            addLog('ERROR', 'SYSTEM', 'Connection lost');
            reconnectTimeout.current = setTimeout(connect, 3000);
        };

        ws.current.onmessage = (event) => {
            const data = event.data;

            try {
                // Try parsing as JSON first (new typed format)
                const msg = JSON.parse(data);

                switch (msg.type) {
                    case 'tick':
                        setTickers(prev => ({
                            ...prev,
                            [msg.symbol]: {
                                price: msg.price,
                                volume: msg.volume,
                                lastUpdated: Date.now(),
                                history: [...(prev[msg.symbol]?.history || []), msg.price].slice(-50)
                            }
                        }));
                        break;

                    case 'risk':
                        setRisk({
                            var95: msg.var95,
                            exposure: msg.exposure,
                            pnl: msg.pnl,
                            drawdown: msg.drawdown,
                            sharpe: msg.sharpe
                        });
                        if (msg.mode) setDataMode(msg.mode);
                        break;

                    case 'signal':
                        const newSignal = {
                            id: Date.now(),
                            time: new Date().toLocaleTimeString(),
                            strategy: msg.strategy,
                            symbol: msg.symbol,
                            side: msg.side,
                            price: msg.price,
                            zscore: msg.zscore,
                            status: 'GENERATED'
                        };
                        setSignals(prev => [newSignal, ...prev].slice(0, 100));
                        addLog('INFO', 'SIGNAL', `${msg.side} ${msg.symbol} @ ${msg.price}`);
                        break;

                    case 'compliance':
                        addLog(msg.status === 'PASS' ? 'INFO' : 'WARN', 'COMPLIANCE', msg.rule);
                        break;

                    default:
                        addLog('INFO', 'ENGINE', JSON.stringify(msg));
                }
            } catch (e) {
                // Fallback for old format (Tick: {...})
                if (data.includes("Tick:")) {
                    try {
                        const jsonStr = data.replace("Tick: ", "").trim();
                        const tick = JSON.parse(jsonStr);
                        setTickers(prev => ({
                            ...prev,
                            [tick.symbol]: {
                                ...tick,
                                lastUpdated: Date.now(),
                                history: [...(prev[tick.symbol]?.history || []), tick.price].slice(-50)
                            }
                        }));
                    } catch (e2) { console.error("Parse Error", e2); }
                } else {
                    addLog('INFO', 'ENGINE', data);
                }
            }
        };
    };

    const addLog = (severity, source, msg) => {
        const entry = {
            id: Date.now() + Math.random(),
            time: new Date().toLocaleTimeString(),
            severity,
            source,
            message: msg
        };
        setLogs(prev => [entry, ...prev].slice(0, 500));
    };

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) ws.current.close();
            clearTimeout(reconnectTimeout.current);
        };
    }, []);

    return (
        <EngineContext.Provider value={{ status, tickers, logs, risk, signals, dataMode }}>
            {children}
        </EngineContext.Provider>
    );
};
