const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

let aiClient = null;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'your-google-gemini-api-key') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('✅ Google Gemini AI SDK (@google/genai) initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Gemini SDK init warning:', err.message);
  }
} else {
  console.log('ℹ️ GOOGLE_API_KEY not set in backend .env. Intelligent financial rule engine will provide smart structured advisory until key is provided.');
}

module.exports = {
  aiClient,
  apiKey
};
