import 'dotenv/config';
import fetch from 'node-fetch';

const apiKey = process.env.VITE_GOOGLE_TRANSLATE_API_KEY;
console.log("Checking API Key:", apiKey ? "Found (starts with " + apiKey.substring(0, 5) + ")" : "Missing");

if (!apiKey) {
    console.error("Error: VITE_GOOGLE_TRANSLATE_API_KEY not found in .env");
    process.exit(1);
}

const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
const data = {
    q: "Hola mundo",
    source: "es",
    target: "en",
    format: "text"
};

console.log("Sending request to Google Translate API...");

try {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    console.log("Response status:", response.status);
    const json = await response.json();

    if (response.ok) {
        console.log("Success! Translation:", json.data.translations[0].translatedText);
    } else {
        console.error("API Error:", JSON.stringify(json, null, 2));
    }
} catch (err) {
    console.error("Network Error:", err);
}
