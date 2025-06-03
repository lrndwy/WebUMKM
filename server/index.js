const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors(
    // {
    //     origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'https://webumkm.hexanest.id'],
    //     methods: ['GET', 'POST', 'OPTIONS'],
    //     allowedHeaders: ['Content-Type', 'Authorization']
    // }
));

app.use(express.json());

// Raja Ongkir API configuration
const RAJA_ONGKIR_BASE_URL = 'https://rajaongkir.komerce.id/api/v1';
const RAJA_ONGKIR_API_KEY = process.env.RAJA_ONGKIR_API_KEY;

// Middleware to check API key
const checkApiKey = (req, res, next) => {
  if (!RAJA_ONGKIR_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: API key not found'
    });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'RajaOngkir Proxy Service is running',
    timestamp: new Date().toISOString()
  });
});

// Get domestic destinations
app.get('/api/rajaongkir/destinations', checkApiKey, async (req, res) => {
  try {
    const { search, limit = 10, offset = 0 } = req.query;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (search) {
      params.append('search', search);
    }

    const response = await axios.get(
      `${RAJA_ONGKIR_BASE_URL}/destination/domestic-destination?${params}`,
      {
        headers: {
          'accept': 'application/json',
          'key': RAJA_ONGKIR_API_KEY
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Raja Ongkir Destinations Error:', error.message);

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: 'Request timeout - API took too long to respond'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'API Error',
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// Calculate shipping cost
app.post('/api/rajaongkir/calculate', checkApiKey, async (req, res) => {
  try {
    const { origin, destination, weight, courier, price } = req.body;

    // Validation
    if (!origin || !destination || !weight || !courier || origin.trim() === '' || destination.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Missing or empty required fields: origin, destination, weight, courier'
      });
    }

    const requestParams = new URLSearchParams();
    requestParams.append('origin', origin.toString());
    requestParams.append('destination', destination.toString());
    requestParams.append('weight', weight.toString()); // Weight might need to be string for form data
    requestParams.append('courier', courier.toString());

    if (price) {
      requestParams.append('price', price.toString());
    }

    console.log('Sending request body to Raja Ongkir (Form Data):', requestParams.toString());

    const response = await axios.post(
      `${RAJA_ONGKIR_BASE_URL}/calculate/domestic-cost`,
      requestParams.toString(),
      {
        headers: {
          'accept': 'application/json',
          'key': RAJA_ONGKIR_API_KEY,
          'content-type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000 // 15 seconds timeout for calculation
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Raja Ongkir Calculate Error:', error.message);

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: 'Request timeout - Calculation took too long'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'API Error',
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// // Get supported couriers (optional endpoint)
// app.get('/api/rajaongkir/couriers', (req, res) => {
//   const couriers = [
//     { code: 'jne', name: 'JNE' },
//     { code: 'pos', name: 'POS Indonesia' },
//     { code: 'tiki', name: 'TIKI' },
//     { code: 'anteraja', name: 'AnterAja' },
//     { code: 'jnt', name: 'J&T Express' },
//     { code: 'sicepat', name: 'SiCepat' },
//     { code: 'ninja', name: 'Ninja Express' },
//     { code: 'lion', name: 'Lion Parcel' },
//     { code: 'pcp', name: 'PCP Express' },
//     { code: 'jet', name: 'JET Express' }
//   ];

//   res.json({
//     success: true,
//     data: couriers
//   });
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RajaOngkir Proxy Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
