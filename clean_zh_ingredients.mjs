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

async function cleanIngredients() {
    console.log('Cleaning poisoned ingredient translations (zh)...');

    // 1. Delete specific known bad ingredients
    const ingredients = [
        "Ginebra seca con vermut seco, servida en copa fría y decorada con aceituna.",
        "Vodka combinado con jugo de limón fresco, cerveza de jengibre y hielo, servido en la clásica taza de cobre y decorado con rodaja de limón o hierbabuena.",
        "Cóctel clásico peruano elaborado con pisco, limón fresco, jarabe de azúcar y clara de huevo, terminado con un toque de amargo de angostura."
    ];

    const { error: err1 } = await supabase
        .from('translations')
        .delete()
        .eq('target_language', 'zh')
        .in('source_text', ingredients);

    if (err1) console.error('Error deleting specific ingredients:', err1);
    else console.log('Deleted specific known bad ingredients.');

    // 2. Delete "Mezcalita Jamaica" if it's bad
    const { error: err2 } = await supabase
        .from('translations')
        .delete()
        .eq('target_language', 'zh')
        .eq('source_text', 'Mezcalita Jamaica');

    if (err2) console.error('Error deleting Mezcalita Jamaica:', err2);
    else console.log('Deleted Mezcalita Jamaica.');

    // 3. Broad sweep: Delete ANY Chinese translation > 30 chars that is identical to source
    // This catches other descriptions we might have missed
    const { data: allZh, error: fetchError } = await supabase
        .from('translations')
        .select('id, source_text, translated_text')
        .eq('target_language', 'zh');

    if (fetchError) {
        console.error('Error fetching all zh:', fetchError);
        return;
    }

    const badIds = allZh
        .filter(t => t.source_text.length > 30 && t.source_text === t.translated_text)
        .map(t => t.id);

    console.log(`Found ${badIds.length} other long strings identical to source in Chinese.`);

    if (badIds.length > 0) {
        const { error: deleteError } = await supabase
            .from('translations')
            .delete()
            .in('id', badIds);

        if (deleteError) console.error('Error deleting long strings:', deleteError);
        else console.log(`Successfully deleted ${badIds.length} long poisoned strings.`);
    }
}

cleanIngredients();
