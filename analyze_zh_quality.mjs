import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findNonChineseTranslations() {
    console.log('Scanning for Chinese (zh) translations without Chinese characters...');

    const { data, error } = await supabase
        .from('translations')
        .select('id, source_text, translated_text')
        .eq('target_language', 'zh');

    if (error) {
        console.error('Error fetching translations:', error);
        return;
    }

    // Regex to match at least one Chinese character
    const chineseRegex = /[\u4e00-\u9fa5]/;

    const badEntries = data.filter(t => {
        // It's bad if it does NOT have any Chinese characters
        // AND it has some content (not empty)
        return !chineseRegex.test(t.translated_text) && t.translated_text.trim().length > 0;
    });

    console.log(`Total 'zh' translations: ${data.length}`);
    console.log(`Bad entries found (No Chinese chars): ${badEntries.length}`);

    if (badEntries.length > 0) {
        console.log('\nSample of bad entries:');
        badEntries.slice(0, 20).forEach(t => {
            console.log(`[${t.id}] "${t.source_text.substring(0, 20)}..." -> "${t.translated_text.substring(0, 20)}..."`);
        });
    }
}

findNonChineseTranslations();
