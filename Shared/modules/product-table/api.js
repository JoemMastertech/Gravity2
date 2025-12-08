import { getProductRepository } from '../../utils/diUtils.js';

export const api = {
    // Wrapper for Repository Methods
    async getLicoresCategories() {
        return await getProductRepository().getLicoresCategories();
    },

    async getProductsByCategory(category) {
        return await getProductRepository().getProductsByCategory(category);
    },

    async getLiquorSubcategory(subcategory) {
        return await getProductRepository().getLiquorSubcategory(subcategory);
    }
};
