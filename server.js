
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

// Configuration - Replace with actual SSO values
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/callback';
const AUTH_URL = 'https://login.bne.catholic.edu.au/authorize';
const TOKEN_URL = 'https://login.bne.catholic.edu.au/token';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Entry point
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start login via SSO
app.get('/login', (req, res) => {
    const redirect = `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.redirect(redirect);
});

// Callback from SSO
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.send('No code received.');
    }

    try {
        const tokenRes = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const tokenData = await tokenRes.json();

        if (tokenData.access_token) {
            res.redirect('/student-portal.html');
        } else {
            res.send('SSO login failed.');
        }
    } catch (error) {
        console.error(error);
        res.send('Error during login.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
