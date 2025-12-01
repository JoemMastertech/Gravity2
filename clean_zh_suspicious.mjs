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

async function cleanSuspiciousZh() {
    console.log('Fetching suspicious Chinese translations...');

    const { data, error } = await supabase
        .from('translations')
        .select('id, source_text, translated_text')
        .eq('target_language', 'zh');

    if (error) {
        console.error('Error fetching translations:', error);
        return;
    }

    // Filter for source == translated (ignoring case and whitespace)
    // Also ignore very short strings like emojis or numbers which might be valid
    const badIds = data
        .filter(t => {
            const s = t.source_text.trim();
            const tr = t.translated_text.trim();
            // If they are identical AND it contains letters (not just symbols/numbers)
            return s.toLowerCase() === tr.toLowerCase() && /[a-zA-Z]/.test(s);
        })
        .map(t => t.id);

    console.log(`Found ${badIds.length} suspicious Chinese translations (Latin characters identical to source).`);

    if (badIds.length > 0) {
        const { error: deleteError } = await supabase
            .from('translations')
            .delete()
            .in('id', badIds);

        if (deleteError) {
            console.error('Error deleting rows:', deleteError);
        } else {
            console.log(`Successfully deleted ${badIds.length} rows.`);
        }
    } else {
        console.log('No suspicious Chinese translations found.');
    }
}

cleanSuspiciousZh();
