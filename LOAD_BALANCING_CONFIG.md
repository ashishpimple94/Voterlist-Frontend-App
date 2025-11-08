# 🔄 Load Balancing Configuration

## Overview

इस application में **client-side load balancing** implement किया गया है multiple API endpoints के साथ। यह automatically failover, health checks, और multiple strategies support करता है।

## ✅ Implemented Features

- ✅ **Multiple Endpoints Support** - Multiple API servers से data fetch
- ✅ **Automatic Failover** - Primary endpoint fail होने पर automatically backup try
- ✅ **Health Check** - Endpoints की health automatically monitor
- ✅ **Response Time Tracking** - Each endpoint का response time track
- ✅ **Failure Tracking** - 3 consecutive failures पर endpoint को unhealthy mark
- ✅ **Multiple Strategies** - Round-robin, Random, Failover support

## API Endpoints Configuration

### Current Configuration (`src/App.js`):
```javascript
const API_ENDPOINTS = [
  'https://nodejs-2-i1dr.onrender.com/api/voters/',
  // Add more endpoints here when available
  // 'https://api2.example.com/api/voters/',
  // 'https://api3.example.com/api/voters/',
];
```

### Adding New Endpoints:

1. `src/App.js` में `API_ENDPOINTS` array में add करें:
```javascript
const API_ENDPOINTS = [
  'https://nodejs-2-i1dr.onrender.com/api/voters/',
  'https://api2.example.com/api/voters/',
  'https://api3.example.com/api/voters/',
];
```

2. Automatic health check और failover enable हो जाएगा!

## Load Balancing Strategies

### 1. **Failover** (Default - Recommended)
- Primary endpoint try करता है
- Fail होने पर automatically next endpoint try करता है
- Best for reliability और high availability
- **Current Setting:** `failover`

### 2. **Round Robin**
- Requests को sequentially distribute करता है
- Each endpoint को equal chance मिलता है
- Good for distributing load evenly
- Set: `REACT_APP_LOAD_BALANCE_STRATEGY=roundRobin`

### 3. **Random Selection**
- Random endpoint select करता है
- Better for distributed load across multiple servers
- Set: `REACT_APP_LOAD_BALANCE_STRATEGY=random`

## How It Works

### Failover Strategy (Default):
1. Primary endpoint से request करता है
2. Success होने पर data return करता है
3. Fail होने पर automatically next endpoint try करता है
4. सभी endpoints fail होने पर error show करता है

### Health Check:
- हर 5 minutes में automatic health check
- 3 consecutive failures पर endpoint को unhealthy mark
- Unhealthy endpoints automatically skip होते हैं
- Healthy होने पर automatically re-enable हो जाता है

## Implementation Features

✅ **Multiple Endpoints Support**
✅ **Automatic Failover**
✅ **Retry Logic with Exponential Backoff**
✅ **Health Check**
✅ **Response Time Tracking**
✅ **Error Handling**

## Adding New Endpoints

1. `src/App.js` में `API_ENDPOINTS` array में add करें:
```javascript
const API_ENDPOINTS = [
  'https://api1.example.com/api/voters/',
  'https://api2.example.com/api/voters/',
  'https://api3.example.com/api/voters/',
];
```

2. Load balancing strategy select करें:
- `roundRobin`: Sequential distribution
- `random`: Random selection
- `failover`: Primary/backup
- `healthCheck`: Health-based selection

## Server-Side Load Balancing

अगर server-side load balancing चाहिए:

### Option 1: Use Cloudflare Load Balancer
- Multiple origins configure करें
- Health checks enable करें
- Automatic failover

### Option 2: Use AWS ALB/ELB
- Application Load Balancer setup करें
- Multiple target groups
- Health check configuration

### Option 3: Use Nginx Load Balancer
```nginx
upstream api_servers {
    least_conn;
    server api1.example.com;
    server api2.example.com;
    server api3.example.com;
}
```

## Environment Variables

```env
REACT_APP_API_ENDPOINTS=https://api1.com,https://api2.com,https://api3.com
REACT_APP_LOAD_BALANCE_STRATEGY=roundRobin
REACT_APP_ENABLE_HEALTH_CHECK=true
REACT_APP_HEALTH_CHECK_INTERVAL=60000
```

## Performance Monitoring

- Response time tracking
- Success/failure rates
- Endpoint health status
- Automatic endpoint switching

