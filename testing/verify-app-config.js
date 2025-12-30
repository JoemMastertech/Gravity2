
try {
    const AppConfigModule = await import('../Shared/core/AppConfig.js');
    console.log("AppConfig loaded successfully");
    const appConfig = AppConfigModule.default;
    console.log("Supabase URL:", appConfig.get('database.supabaseUrl'));
    // console.log("Supabase Key:", appConfig.get('database.supabaseKey')); // Don't log key
    console.log("Validation passed.");
} catch (error) {
    console.error("AppConfig Failed to Load:", error);
}
