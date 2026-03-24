const {GoogleGenerativeAI} = require('@google/generative-ai');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({error: 'GEMINI_API_KEY is not configured'});
    }

    const {prompt} = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({error: 'Missing prompt'});
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return res.status(200).json({text});
    } catch (error) {
        return res.status(500).json({
            error: 'Gemini request failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
