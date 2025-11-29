// This file runs on Vercel's Serverless Network (Node.js)
// It handles the secure connection to Google Gemini

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Allow larger images from phones
    },
  },
};

export default async function handler(req, res) {
  // --- 1. CORS HEADERS (CRITICAL FOR MOBILE) ---
  // These headers tell the browser/phone "It's okay to talk to this server"
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow ANY app to connect
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // --- 2. HANDLE PREFLIGHT REQUESTS ---
  // Browsers/Phones send an "OPTIONS" request first to check if they can connect.
  // We must answer "OK" immediately.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- 3. VALIDATE REQUEST ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing on server");
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    const { prompt, image } = req.body;

    if (!image) {
        return res.status(400).json({ error: "No image data provided" });
    }

    // --- 4. CALL GOOGLE GEMINI ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: image } }
            ]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(data.error?.message || 'Failed to fetch from Gemini');
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Backend Processing Error:', error);
    res.status(500).json({ error: error.message });
  }
}
