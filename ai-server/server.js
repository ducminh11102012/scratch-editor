const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {GoogleGenerativeAI} = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('GEMINI_API_KEY is not set. /ai requests will fail until this env var is configured.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

app.post('/ai', async (req, res) => {
    const {prompt} = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({error: 'Missing prompt'});
    }

    if (!apiKey) {
        return res.status(500).json({error: 'GEMINI_API_KEY is not configured'});
    }

    try {
        const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return res.json({text});
    } catch (error) {
        return res.status(500).json({
            error: 'Gemini request failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`AI server running on http://localhost:${port}`);
});
