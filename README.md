# FLUX Prime Dashboard

## Overview
Enterprise React dashboard for the FLUX HFT Engine. This is the **Client Component** of the FLUX Ecosystem.
- **Stack**: React, Vite, Recharts, Lucide

## Requirements
This project requires a running instance of the FLUX Core Engine to display data.
- **Backend**: [flux-core](../flux-core) (Must be running on port 9000)
- **Data Source**: Connects to `ws://localhost:9000` via `nepse-stream` protocol.

## How to Run
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)
