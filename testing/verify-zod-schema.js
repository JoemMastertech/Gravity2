
import { validateProducts } from '../src/schemas/product.schema.js';
import { z } from 'zod';

// Mock Data representing "Dirty" inputs from Supabase or Legacy APIs
const mockInputs = [
    // Case 1: Perfect Input (CamelCase)
    {
        id: "1",
        nombre: "Perfect Product",
        precio: 100,
        category: "cervezas"
    },
    // Case 2: Snake Case (Supabase Style)
    {
        id: "2",
        nombre: "Snake Case Product",
        precio_venta: 200, // Should map to precio
        categoria: "licores",
        precio_botella: 500, // Should map to precioBotella
        mixers_botella: JSON.stringify(["Coca Cola", "Agua"]) // Should parse JSON string
    },
    // Case 3: English Input
    {
        id: "3",
        name: "English Product",
        price: 300,
        category: "snacks"
    },
    // Case 4: Missing Fields (Should use defaults)
    {
        id: "4",
        // No name -> default
        // No price -> default 0
        category: "unknown" // Should default to 'cervezas' or fail gracefully
    },
    // Case 5: Broken URLs
    {
        id: "5",
        nombre: "Broken Image",
        imagen: "", // Should become default bottle
        precio: "100" // Should coerce to number
    }
];

console.log("--- Starting Zod Schema Verification ---");

try {
    const cleanProducts = validateProducts(mockInputs, 'licores');

    cleanProducts.forEach(p => {
        console.log(`\nVerified Product ID: ${p.id}`);
        console.log(`Name: ${p.nombre}`);
        console.log(`Price: ${p.precio} (Type: ${typeof p.precio})`);
        console.log(`Image: ${p.imagen}`);
        if (p.precioBotella) console.log(`Bottle Price: ${p.precioBotella}`);
        if (p.mixersBotella) console.log(`Mixers: ${JSON.stringify(p.mixersBotella)}`);
    });

    console.log("\n--- Verification Complete directly ---");

} catch (error) {
    console.error("\nCRITICAL FAILURE:", error);
}
