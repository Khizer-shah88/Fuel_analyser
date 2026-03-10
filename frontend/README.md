# Fuel Pump Management System - Frontend

Modern Next.js frontend for the Fuel Pump Management System with real-time analytics and monitoring.

## Features

- 📊 Real-time analytics dashboard
- 📈 Interactive charts using Recharts
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time pump data visualization
- 📱 Responsive design

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Chart library
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Home page
│   │   └── globals.css  # Global styles
│   ├── components/      # React components
│   │   ├── Dashboard.tsx
│   │   ├── PumpsList.tsx
│   │   ├── StatCard.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   └── charts/      # Chart components
│   ├── lib/             # Utilities
│   │   └── api.ts       # API client
│   └── types/           # TypeScript types
│       └── index.ts
├── public/              # Static assets
└── package.json
```

## Features Overview

### Dashboard
- Overview statistics cards
- Total pumps, transactions, liters, and amount
- Real-time data updates

### Pumps List
- List of all pumps
- Filter by individual pump
- View latest transaction data
- Station information

### Analytics
- **Time Series Chart**: 24-hour trend of liters and amount
- **Liters Statistics**: Min, max, average, and total
- **Amount Statistics**: Transaction amount analytics
- **Fuel Type Distribution**: Pie chart of fuel types
- **Nozzle Distribution**: Bar chart of nozzle usage

## API Integration

The frontend communicates with the backend API through the `api.ts` service layer:

- `pumpsApi.getAll()` - Get all pumps
- `pumpsApi.getById(pumpId)` - Get specific pump
- `pumpsApi.getData(pumpId, limit)` - Get pump transaction data
- `analyticsApi.getLitersStatistics(pumpId?)` - Get liters stats
- `analyticsApi.getAmountStatistics(pumpId?)` - Get amount stats
- `analyticsApi.getFuelTypeDistribution(pumpId?)` - Get fuel type distribution
- `analyticsApi.getNozzleDistribution(pumpId?)` - Get nozzle distribution
- `analyticsApi.getTimeSeries(pumpId?, hours)` - Get time series data

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api)



















