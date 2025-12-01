import { defineConfig } from 'vite';

export default defineConfig({
    // Root directory is the project root
    root: './',

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
