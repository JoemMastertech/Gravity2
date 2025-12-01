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

async function checkIngredients() {
    const ingredients = [
        "Ginebra seca con vermut seco, servida en copa fría y decorada con aceituna.",
        "Vodka combinado con jugo de limón fresco, cerveza de jengibre y hielo, servido en la clásica taza de cobre y decorado con rodaja de limón o hierbabuena.",
        "Cóctel clásico peruano elaborado con pisco, limón fresco, jarabe de azúcar y clara de huevo, terminado con un toque de amargo de angostura."
    ];

    console.log('Checking ingredient translations in Chinese (zh)...');

    const { data, error } = await supabase
        .from('translations')
        .select('source_text, translated_text, target_language')
        .eq('target_language', 'zh')
        .in('source_text', ingredients);

    if (error) {
        console.error('Error fetching translations:', error);
    } else {
        if (data.length === 0) {
            console.log('No translations found for these ingredients.');
        } else {
            data.forEach(t => {
                console.log(`[${t.target_language}] Source: "${t.source_text.substring(0, 20)}..."`);
                console.log(`     Target: "${t.translated_text.substring(0, 20)}..."`);
                console.log(`     Identical? ${t.source_text === t.translated_text}`);
            });
        }
    }

    // Also check Mezcalita variants
    console.log('\nChecking "Mezcalita" variants...');
    const { data: mezcalData, error: mezcalError } = await supabase
        .from('translations')
        .select('source_text, translated_text')
        .eq('target_language', 'zh')
        .ilike('source_text', 'Mezcalita%');

    if (mezcalError) {
        console.error('Error checking Mezcalita:', mezcalError);
    } else {
        mezcalData.forEach(t => {
            console.log(`[zh] "${t.source_text}" -> "${t.translated_text}"`);
        });
    }
}

checkIngredients();
