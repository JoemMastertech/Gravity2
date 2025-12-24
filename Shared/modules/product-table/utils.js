import { logWarning } from '../../utils/errorHandler.js';

export function normalizeCategory(categoryTitle) {
    if (!categoryTitle) return '';
    return categoryTitle
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function determineProductType(normalizedCategory, tableClass, categoryTitle) {
    const foodCategories = ['pizzas', 'alitas', 'sopas', 'ensaladas', 'carnes', 'platos fuertes', 'snacks'];
    const beverageCategories = ['cocteleria', 'refrescos', 'cervezas', 'cafe', 'postres'];

    if (foodCategories.includes(normalizedCategory)) {
        return 'food';
    } else if (beverageCategories.includes(normalizedCategory)) {
        return 'beverage';
    } else if (tableClass === 'liquor-table' || normalizedCategory === 'licores') {
        return 'liquor';
    } else {
        logWarning(`Unknown product type for category: ${categoryTitle} (normalized: ${normalizedCategory})`);
        return 'unknown';
    }
}

export function getCategoryForModal(categoryTitle) {
    return categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos') ? categoryTitle.toLowerCase() : null;
}

export function isPriceField(field) {
    return field.includes('precio') || field === 'precioBotella' || field === 'precioLitro' || field === 'precioCopa';
}
