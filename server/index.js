const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // For making HTTP requests from Node.js
const app = express();
const port = process.env.PORT || 3001; // Use a different port than the frontend

// Allow CORS from your frontend origin
const allowedOrigins = [
    'https://webumkm.hexanest.id', // Your Coolify frontend URL
    'http://localhost:3000', // Your local development URL
    'http://localhost:5173' // Default Vite dev server port
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy endpoint for RajaOngkir
app.all('/proxy-rajaongkir/*', async (req, res) => {
    try {
        const rajaOngkirUrl = process.env.VITE_RAJAONGKIR_URL;
        const rajaOngkirApiKey = process.env.VITE_RAJAONGKIR_API_KEY;

        if (!rajaOngkirUrl || !rajaOngkirApiKey) {
            return res.status(500).json({ error: 'RajaOngkir URL or API Key not configured in environment variables.' });
        }

        // Reconstruct the target URL
        const targetPath = req.originalUrl.replace('/proxy-rajaongkir', '');
        const fullTargetUrl = `${rajaOngkirUrl}${targetPath}`;

        console.log(`Proxying request to: ${fullTargetUrl}`);
        console.log(`Method: ${req.method}`);
        console.log(`Headers:`, req.headers);
        console.log(`Body:`, req.body);

        const headers = {
            'key': rajaOngkirApiKey,
            'Content-Type': req.headers['content-type'] || 'application/json',
            'Accept': req.headers['accept'] || 'application/json',
        };

        // Remove host and origin headers to prevent issues with the target API
        delete headers['host'];
        delete headers['origin'];

        const options = {
            method: req.method,
            headers: headers,
            body: req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : undefined,
        };

        // For URL-encoded bodies (like RajaOngkir cost calculation)
        if (req.headers['content-type'] === 'application/x-www-form-urlencoded' && (req.method === 'POST' || req.method === 'PUT')) {
            options.body = new URLSearchParams(req.body).toString();
        }

        const response = await fetch(fullTargetUrl, options);
        const data = await response.json(); // Assuming RajaOngkir always returns JSON

        res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy failed to connect to RajaOngkir API', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});
