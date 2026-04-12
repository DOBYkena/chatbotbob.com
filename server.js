require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

const companyDataPath = path.join(__dirname, 'company-data.json');
const companyData = JSON.parse(fs.readFileSync(companyDataPath, 'utf8'));

if (!apiKey || apiKey.startsWith('your-openai-api-key')) {
    console.error('Missing or invalid OPENAI_API_KEY in .env. Please set your real OpenAI key.');
    process.exit(1);
}

const openai = new OpenAI({ apiKey });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/widget', '/widget.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'widget.html'));
});

app.get('/company-data', (req, res) => {
    res.json(companyData);
});

app.get('/chat-bot.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat-bot.js'));
});

app.get('/chat-bot.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat-bot.css'));
});

function getCompanyInfo(companyName) {
    const companyKey = Object.keys(companyData).find(key =>
        companyData[key].name.toLowerCase().includes(companyName.toLowerCase()) ||
        key.toLowerCase() === companyName.toLowerCase() ||
        companyName.toLowerCase().includes(key.toLowerCase())
    );

    return companyKey ? companyData[companyKey] : null;
}

function findAnswerFromCompanyData(userMessage, companyInfo) {
    const text = userMessage.toLowerCase();

    const matchedProduct = companyInfo.products.find(p =>
        text.includes(p.name.toLowerCase()) || text.includes(p.type.toLowerCase())
    );

    if (matchedProduct) {
        const details = [
            `Naziv proizvoda: ${matchedProduct.name}.`,
            `Tip: ${matchedProduct.type}.`,
            `Značajke: ${matchedProduct.features.join(', ')}.`,
            `Cijena: ${matchedProduct.price}.`
        ];

        if (text.includes('dostav') || text.includes('dostava')) {
            const deliveryFaq = companyInfo.faq.find(f => f.question.toLowerCase().includes('dostav'));
            if (deliveryFaq) {
                details.push(deliveryFaq.answer);
            }
        }

        return details.join(' ');
    }

    const matchedFaq = companyInfo.faq.find(f =>
        text.includes(f.question.toLowerCase().replace(/[?.]/g, '')) ||
        f.question.toLowerCase().split(' ').some(word => text.includes(word))
    );

    if (matchedFaq) {
        return `${matchedFaq.answer}`;
    }

    if (text.includes('dostav') || text.includes('dostava')) {
        const deliveryFaq = companyInfo.faq.find(f => f.question.toLowerCase().includes('dostav'));
        if (deliveryFaq) {
            return deliveryFaq.answer;
        }
    }

    return null;
}

async function askBot(userMessage, companyName = 'Company', language = 'Bosnian') {
    const companyInfo = getCompanyInfo(companyName);
    const targetLanguage = ['English', 'Croatian'].includes(language) ? language : 'Bosnian';
    let systemContent = `You are a helpful customer support assistant for ${companyName}. ` +
        `The user may ask in any language. Always reply in ${targetLanguage}. ` +
        `If the user asks in another language, translate their question internally and answer in ${targetLanguage}. ` +
        `Answer questions about products, services, contact information, FAQs, and general inquiries. Be friendly, concise, and professional.`;

    if (companyInfo) {
        const productList = companyInfo.products.map(p => `- ${p.name}: ${p.type}, features: ${p.features.join(', ')}, price: ${p.price}`).join('\n');
        const faqList = companyInfo.faq.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n');

        systemContent += `\n\nHere are company-specific details the assistant should use when answering questions:\n` +
            `Company name: ${companyInfo.name}\n` +
            `Description: ${companyInfo.description}\n` +
            `Products:\n${productList}\n` +
            `FAQ:\n${faqList}\n` +
            `When the user's question is about this company, answer using only these details and do not invent other products, services, prices, or delivery terms. If the data does not contain an answer, say you don't know or offer to check with the company.`;
    }

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: userMessage }
        ],
        max_tokens: 250,
        temperature: 0,
    });

    return completion.choices?.[0]?.message?.content?.trim() || 'I did not get a response from the AI.';
}

app.post('/api/chat', async (req, res) => {
    const { message, companyName, language } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await askBot(message, companyName || 'Your Company', language || 'Bosnian');
        res.json({ response });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

app.listen(port, () => {
    console.log(`Chat bot backend running on http://localhost:${port}`);
});