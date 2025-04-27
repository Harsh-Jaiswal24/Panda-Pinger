const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 3000;
const backendURLs = [
    "https://campusscalebackend.onrender.com",
    "https://mediscan-backend-rvc7.onrender.com",
    "https://notesolver-backend.onrender.com",
    "https://wonderlust-f3ym.onrender.com"
];

// Add self URL (automatically provided by Render)
if (process.env.RENDER_EXTERNAL_URL) {
    backendURLs.push(process.env.RENDER_EXTERNAL_URL);
}

const PING_INTERVAL_MINUTES = 14;
const PING_INTERVAL_MS = PING_INTERVAL_MINUTES * 60 * 1000;
const BACKEND_TIMEOUT_MS = 60 * 1000;

app.get("/health", (req, res) => res.status(200).send("OK"));

const pingBackend = async (url) => {
    try {
        console.log(`Pinging ${url}`);
        await axios.get(url, { timeout: BACKEND_TIMEOUT_MS });
        console.log(`Success: ${url}`);
        return true;
    } catch (err) {
        console.log(`Failed: ${url} (${err.code || err.message})`);
        return false;
    }
};

const pingAllBackends = async () => {
    console.log(`\nStarting ping cycle at ${new Date().toLocaleTimeString()}`);
    const startTime = Date.now();
    
    const results = await Promise.all(backendURLs.map(pingBackend));
    const successCount = results.filter(Boolean).length;
    
    console.log(`Cycle completed in ${((Date.now() - startTime)/1000)}s`);
    console.log(`Status: ${successCount}/${backendURLs.length} succeeded`);
};

// Initial ping and setup
pingAllBackends().then(() => {
    setInterval(pingAllBackends, PING_INTERVAL_MS);
    console.log(`Service active. Pinging every ${PING_INTERVAL_MINUTES} minutes`);
});

process.on('SIGINT', () => {
    console.log('Shutting down gracefully');
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Keep-alive service running on port ${PORT}`);
    console.log(`Monitoring ${backendURLs.length} backends`);
});
