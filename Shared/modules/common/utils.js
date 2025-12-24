export function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

export function formatPrice(priceValue) {
    if (!priceValue || priceValue === '--') return '--';

    // Remove existing $ if present
    let numericValue = priceValue;
    if (typeof priceValue === 'string') {
        numericValue = priceValue.replace('$', '').trim();
    }

    const floatVal = parseFloat(numericValue);
    if (isNaN(floatVal)) return priceValue;

    return `$${floatVal.toFixed(2)}`;
}

export function slugify(s) {
    if (!s || typeof s !== 'string') return '';
    return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();
}
