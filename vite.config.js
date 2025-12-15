import { defineConfig } from 'vite';
import scssAudit from './tools/vite-plugin-scss-audit.js';

export default defineConfig({
    // Root directory is the project root
    root: './',

    plugins: [
        scssAudit()
    ],

    // Base public path
    base: './',

    // Server configuration
    server: {
        port: 8080,
        open: true, // Open browser on start
        cors: true
    },

    // Build configuration
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true
    }
});
