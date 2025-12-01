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

async function auditTranslations() {
    console.log('Auditing translations for potential issues...');

    // Fetch all translations where target is NOT 'es'
    const { data, error } = await supabase
        .from('translations')
        .select('id, source_text, translated_text, target_language')
        .neq('target_language', 'es');

    if (error) {
        console.error('Error fetching translations:', error);
        return;
    }

    const suspicious = data.filter(t => t.source_text.trim().toLowerCase() === t.translated_text.trim().toLowerCase());

    console.log(`Total non-Spanish translations: ${data.length}`);
    console.log(`Suspicious translations (Source == Target): ${suspicious.length}`);

    if (suspicious.length > 0) {
        console.log('\nTop 20 Suspicious Entries:');
        suspicious.slice(0, 20).forEach(t => {
            console.log(`[${t.target_language}] "${t.source_text}" -> "${t.translated_text}"`);
        });

        // Group by language to see which language is most affected
        const byLang = suspicious.reduce((acc, curr) => {
            acc[curr.target_language] = (acc[curr.target_language] || 0) + 1;
            return acc;
        }, {});
        console.log('\nSuspicious counts by language:', byLang);
    }
}

auditTranslations();
