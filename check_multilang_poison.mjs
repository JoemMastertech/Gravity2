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

async function checkMultiLang() {
    const terms = ['Coctelería', 'Postres', 'Old Fashioned', 'Mezcalita'];
    const langs = ['it', 'fr'];

    console.log(`Checking translations for: ${terms.join(', ')} in ${langs.join(', ')}`);

    const { data, error } = await supabase
        .from('translations')
        .select('*')
        .in('target_language', langs)
        .in('source_text', terms);

    if (error) {
        console.error('Supabase error:', error);
    } else {
        data.forEach(t => {
            const isIdentical = t.source_text === t.translated_text;
            console.log(`[${t.target_language}] "${t.source_text}" -> "${t.translated_text}" (Identical? ${isIdentical})`);
        });
    }

    console.log('\n--- API Test ---');
    // Test one obvious one: Coctelería -> it
    const url = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: 'Coctelería',
                source: 'es',
                target: 'it',
                format: 'text'
            })
        });
        const json = await response.json();
        console.log(`API Test: "Coctelería" -> it = "${json.data?.translations[0]?.translatedText}"`);
    } catch (e) {
        console.error(e);
    }
}

checkMultiLang();
