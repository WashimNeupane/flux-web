
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const EngineContext = createContext();

export const useEngine = () => useContext(EngineContext);

export const EngineProvider = ({ children }) => {
    const [status, setStatus] = useState('DISCONNECTED');
    const [tickers, setTickers] = useState({});
    const [logs, setLogs] = useState([]);
    const ws = useRef(null);
    const reconnectTimeout = useRef(null);

    const connect = () => {
        ws.current = new WebSocket('ws://localhost:9000', 'nepse-stream');

        ws.current.onopen = () => {
            setStatus('CONNECTED');
            addLog('SYSTEM', 'Connected to NEPSE Antigravity Engine');
        };

        ws.current.onclose = () => {
            setStatus('DISCONNECTED');
            addLog('ERROR', 'Connection lost');
            reconnectTimeout.current = setTimeout(connect, 3000);
        };

        ws.current.onmessage = (event) => {
            const data = event.data;
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
                } catch (e) { console.error("Parse Error", e); }
            } else {
                addLog('ENGINE', data);
            }
        };
    };

    const addLog = (type, msg) => {
        const entry = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), type, msg };
        setLogs(prev => [entry, ...prev].slice(0, 500));
    };

    useEffect(() => {
        connect();
        return () => { if (ws.current) ws.current.close(); clearTimeout(reconnectTimeout.current); };
    }, []);

    return (
        <EngineContext.Provider value={{ status, tickers, logs }}>
            {children}
        </EngineContext.Provider>
    );
};
