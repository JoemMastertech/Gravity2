import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const googleApiKey = process.env.VITE_GOOGLE_TRANSLATE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugZh() {
    console.log('--- Checking Supabase ---');
    const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('target_language', 'zh')
        .in('source_text', ['Old Fashioned', 'Mezcalita']);

    if (error) {
        console.error('Supabase error:', error);
    } else {
        if (data.length === 0) {
            console.log('No entries found in Supabase for these terms.');
        } else {
            data.forEach(t => {
                console.log(`DB: "${t.source_text}" -> "${t.translated_text}"`);
            });
        }
    }

    console.log('\n--- Testing Google API Direct Call ---');
    if (!googleApiKey) {
        console.error('No Google API Key found.');
        return;
    }

    const textToTranslate = 'Old Fashioned';
    const url = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: textToTranslate,
                source: 'es',
                target: 'zh',
                format: 'text'
            })
        });

        const json = await response.json();
        if (json.error) {
            console.error('API Error:', json.error);
        } else {
            console.log(`API: "${textToTranslate}" -> "${json.data.translations[0].translatedText}"`);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

debugZh();
