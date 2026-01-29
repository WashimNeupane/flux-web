
import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './Layout'
import { EngineProvider } from './context/EngineContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <EngineProvider>
            <Layout />
        </EngineProvider>
    </React.StrictMode>,
)
