
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTranslations() {
    console.log('🔍 Starting Meticulous Translation Analysis...\n');

    const { data: translations, error } = await supabase
        .from('translations')
        .select('*');

    if (error) {
        console.error('Error fetching translations:', error);
        return;
    }

    console.log(`Total Translations in DB: ${translations.length}\n`);

    // Group by language
    const byLang = translations.reduce((acc, t) => {
        acc[t.target_language] = acc[t.target_language] || [];
        acc[t.target_language].push(t);
        return acc;
    }, {});

    for (const [lang, items] of Object.entries(byLang)) {
        console.log(`--- Language: ${lang.toUpperCase()} (${items.length} entries) ---`);

        // 1. Check for Identical Translations (Potential Poisoning vs Brand Names)
        const identical = items.filter(t =>
            t.source_text && t.translated_text &&
            t.source_text.trim().toLowerCase() === t.translated_text.trim().toLowerCase()
        );

        if (identical.length > 0) {
            console.log(`   ⚠️  Identical Source/Target: ${identical.length}`);
            console.log(`   Examples of identical (likely Brand Names):`);
            identical.slice(0, 5).forEach(t => console.log(`      - "${t.source_text}"`));
        } else {
            console.log(`   ✅ No identical translations found.`);
        }

        // 2. Language Specific Checks
        if (lang === 'zh') {
            const chineseRegex = /[\u4e00-\u9fa5]/;
            const invalidChinese = items.filter(t => !chineseRegex.test(t.translated_text));

            if (invalidChinese.length > 0) {
                console.log(`   ❌ INVALID CHINESE (No Chinese chars): ${invalidChinese.length}`);
                invalidChinese.forEach(t => console.log(`      - Key: ${t.text_key} | Value: "${t.translated_text}"`));
            } else {
                console.log(`   ✅ All Chinese translations contain Chinese characters.`);
            }
        }

        console.log('');
    }

    console.log('🏁 Analysis Complete.');
}

analyzeTranslations();
