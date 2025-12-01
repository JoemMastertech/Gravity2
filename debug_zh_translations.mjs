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

async function checkZhTranslations() {
    const terms = ['Old Fashioned', 'Mezcalita', 'Margarita', 'ABC', 'Coctelería'];
    console.log(`Checking Chinese (zh) translations for: ${terms.join(', ')}`);

    const { data, error } = await supabase
        .from('translations')
        .select('source_text, translated_text, target_language')
        .eq('target_language', 'zh')
        .in('source_text', terms);

    if (error) {
        console.error('Error fetching translations:', error);
    } else {
        data.forEach(t => {
            console.log(`[${t.target_language}] "${t.source_text}" -> "${t.translated_text}" (Equal? ${t.source_text === t.translated_text})`);
        });
    }
}

checkZhTranslations();
