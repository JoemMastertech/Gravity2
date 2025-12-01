
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function cleanIcons() {
    console.log('🧹 Cleaning residual icons...');
    const { error } = await supabase
        .from('translations')
        .delete()
        .in('text_key', ['button_view-toggle-btn', 'button_settings-btn']);

    if (error) console.error('Error:', error);
    else console.log('✅ Icons removed from DB.');
}

cleanIcons();
