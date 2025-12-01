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

async function deleteBadZhTranslations() {
    const badTerms = ['Old Fashioned', 'Mezcalita'];
    console.log(`Deleting bad Chinese (zh) translations for: ${badTerms.join(', ')}`);

    const { error } = await supabase
        .from('translations')
        .delete()
        .eq('target_language', 'zh')
        .in('source_text', badTerms);

    if (error) {
        console.error('Error deleting translations:', error);
    } else {
        console.log('Successfully deleted bad translations.');
    }
}

deleteBadZhTranslations();
