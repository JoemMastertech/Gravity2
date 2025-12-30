import { BUSINESS_RULES, VALIDATION, MESSAGES } from '../../../../Shared/config/constants.js';
import Logger from '../../../../Shared/utils/logger.js';
import { isJuiceOption } from '../../../../Shared/utils/calculationUtils.js';

/**
 * Centralized validation module for OrderSystem
 * Contains all validation logic extracted from order-system.js
 * Provides consistent validation methods with proper error handling
 */
export class OrderSystemValidations {
  
  /**
   * Validates if a product selection is allowed
   * @param {Event} event - The click event
   * @param {boolean} isOrderMode - Current order mode state
   * @returns {boolean} True if selection is valid
   */
  static validateSelection(event, isOrderMode) {
    return isOrderMode && 
           !event.target.disabled && 
           !(event.target.classList && event.target.classList.contains('non-selectable'));
  }

  /**
   * Validates drink options result from product lookup
   * @param {Object} drinkOptionsResult - Result from getDrinkOptionsForProduct
   * @param {string} productName - Name of the product for logging
   * @returns {boolean} True if drink options are valid
   */
  static validateDrinkOptions(drinkOptionsResult, productName) {
    if (!drinkOptionsResult || !drinkOptionsResult.drinkOptions) {
      Logger.error('No drink options found for product:', productName);
      return false;
    }
    return true;
  }

  /**
   * Validates if current drink selection is valid for confirmation
   * @param {Array} selectedDrinks - Currently selected drinks
   * @param {Object} drinkCounts - Drink count mappings
   * @param {Object} currentProduct - Current product being processed
   * @returns {boolean} True if selection is valid
   */
  static hasValidDrinkSelection(selectedDrinks, drinkCounts, currentProduct) {
    const isJagerBottle = currentProduct.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes('JAGERMEISTER') && 
                          currentProduct.priceType === 'precioBotella';
    
    if (isJagerBottle) {
      return selectedDrinks.includes('2 Boost') || Object.values(drinkCounts).some(count => count > 0);
    }
    
    return selectedDrinks.length > 0 || Object.values(drinkCounts).some(count => count > 0);
  }

  /**
   * Validates cooking term selection for meat products
   * @param {string} selectedCookingTerm - Currently selected cooking term
   * @returns {boolean} True if cooking term is selected
   */
  static validateCookingTerm(selectedCookingTerm) {
    if (!selectedCookingTerm) {
      return false;
    }
    return true;
  }

  /**
   * Validates product name input
   * @param {string} productName - Product name to validate
   * @returns {Object} Validation result with isValid and message
   */
  static validateProductName(productName) {
    if (!productName || typeof productName !== 'string') {
      return {
        isValid: false,
        message: 'Invalid productName: must be a non-empty string'
      };
    }
    return { isValid: true };
  }

  /**
   * Validates if order has items before completion
   * @param {Array} orderItems - Current order items
   * @returns {Object} Validation result
   */
  static validateOrderCompletion(orderItems) {
    if (!orderItems || orderItems.length === 0) {
      return {
        isValid: false,
        message: 'La orden está vacía. Por favor agregue productos.'
      };
    }
    return { isValid: true };
  }

  /**
   * Validates special bottle rules for drink selection
   * @param {boolean} isJuice - Whether the drink being added is a juice
   * @param {number} totalJuices - Current total juice count
   * @param {number} totalRefrescos - Current total soda count
   * @param {string} bottleCategory - Category of the bottle product
   * @param {string} productName - Name of the current product
   * @returns {boolean} True if the drink can be added
   */
  static validateSpecialBottleRules(isJuice, totalJuices, totalRefrescos, bottleCategory, productName) {
    // Check if it's a special bottle category
    const isSpecialBottle = this._isSpecialBottleCategory(bottleCategory, productName);
    const isOnlySoda = this._isOnlySodaCategory(bottleCategory);
    
    if (isOnlySoda) {
      // Solo refrescos permitidos, máximo 5
      return !isJuice && totalRefrescos < 5;
    }
    
    if (isSpecialBottle) {
      // Verificar si estamos intentando agregar y si la combinación resultante sería válida
      const newJuices = isJuice ? totalJuices + 1 : totalJuices;
      const newRefrescos = !isJuice ? totalRefrescos + 1 : totalRefrescos;
      
      // Solo permitir si la nueva combinación es una de las tres válidas:
      // 1. Hasta 2 jugos sin refrescos
      // 2. Hasta 5 refrescos sin jugos  
      // 3. Exactamente 1 jugo + hasta 2 refrescos
      return (newJuices <= 2 && newRefrescos === 0) ||  // Combinación 1
             (newJuices === 0 && newRefrescos <= 5) ||  // Combinación 2
             (newJuices === 1 && newRefrescos <= 2);    // Combinación 3
    }
    
    // Reglas por defecto para otras categorías
    return totalJuices + totalRefrescos < 5;
  }

  /**
   * Validates special drink limits for button disabling
   * @param {boolean} isJuice - Whether the drink is a juice
   * @param {number} totalJuices - Current total juice count
   * @param {number} totalRefrescos - Current total soda count
   * @param {string} bottleCategory - Category of the bottle product
   * @param {string} productName - Name of the current product
   * @returns {boolean} True if the button should be disabled
   */
  static validateSpecialDrinkLimits(isJuice, totalJuices, totalRefrescos, bottleCategory, productName) {
    const isOnlySoda = this._isOnlySodaCategory(bottleCategory);
    const isSpecialBottle = this._isSpecialBottleCategory(bottleCategory, productName);
    
    if (isOnlySoda) {
      // Solo refrescos: deshabilitar si ya hay 5 refrescos o si es jugo
      return isJuice || totalRefrescos >= 5;
    }
    
    if (isSpecialBottle) {
      // Deshabilitar basándose en las combinaciones válidas estrictas
      if (isJuice) {
        // Deshabilitar jugos si:
        // - Ya hay 2 jugos (límite alcanzado para combinación 1)
        // - Hay refrescos y ya hay 1 jugo (combinación 3 completa en jugos)
        // - Hay más de 2 refrescos (incompatible con cualquier combinación de jugos)
        return totalJuices >= 2 || 
               (totalRefrescos > 0 && totalJuices >= 1) || 
               totalRefrescos > 2;
      } else {
        // Deshabilitar refrescos si:
        // - Ya hay 2 jugos (combinación 1, no permite refrescos)
        // - No hay jugos y ya hay 5 refrescos (combinación 2 completa)
        // - Hay 1 jugo y ya hay 2 refrescos (combinación 3 completa)
        return totalJuices >= 2 || 
               (totalJuices === 0 && totalRefrescos >= 5) || 
               (totalJuices === 1 && totalRefrescos >= 2);
      }
    }
    
    // Reglas por defecto
    return totalJuices + totalRefrescos >= 5;
  }

  /**
   * Validates if a drink can be added based on current counts and limits
   * @param {boolean} isJuice - Whether the drink being added is a juice
   * @param {number} totalCount - Total current drink count
   * @param {number} maxDrinkCount - Maximum allowed drinks
   * @param {number} totalJuices - Current total juice count
   * @param {number} totalRefrescos - Current total soda count
   * @param {string} bottleCategory - Category of the bottle product
   * @param {string} productName - Name of the current product
   * @returns {boolean} True if drink can be added
   */
  static canAddDrink(isJuice, totalCount, maxDrinkCount, totalJuices, totalRefrescos, bottleCategory, productName) {
    const isSpecialBottle = this._isSpecialBottleCategory(bottleCategory, productName);
    
    if (isSpecialBottle) {
      return this.validateSpecialBottleRules(isJuice, totalJuices, totalRefrescos, bottleCategory, productName);
    }
    return totalCount < maxDrinkCount;
  }

  // Private helper methods
  
  /**
   * Checks if the bottle category is special (Vodka, Ginebra, or specific Ron products)
   * @param {string} bottleCategory - Category of the bottle
   * @param {string} productName - Name of the product
   * @returns {boolean} True if it's a special bottle category
   */
  static _isSpecialBottleCategory(bottleCategory, productName) {
    if (bottleCategory === 'VODKA' || bottleCategory === 'GINEBRA') return true;
    if (bottleCategory === 'RON') {
      const normalizedName = productName?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() || '';
      return ['BACARDI MANGO', 'BACARDI RASPBERRY', 'MALIBU'].some(name => normalizedName.includes(name));
    }
    return false;
  }

  /**
   * Checks if the category only allows sodas
   * @param {string} bottleCategory - Category of the bottle
   * @returns {boolean} True if only sodas are allowed
   */
  static _isOnlySodaCategory(bottleCategory) {
    // This can be expanded based on specific business categories
    // For now, returning false as the logic would need the actual drink options
    return false;
  }

  /**
   * Validates DOM element existence
   * @param {HTMLElement} element - Element to validate
   * @param {string} elementName - Name of the element for logging
   * @returns {boolean} True if element exists
   */
  static validateDOMElement(element, elementName) {
    if (!element) {
      Logger.error(`Element '${elementName}' not found`);
      return false;
    }
    return true;
  }

  /**
   * Validates modal element and its required methods
   * @param {HTMLElement} modal - Modal element to validate
   * @returns {boolean} True if modal is valid
   */
  static validateModalElement(modal) {
    if (!modal) {
      Logger.error('validateModalElement: No modal provided');
      return false;
    }
    
    // Check if modal has required methods after enhancement
    if (typeof modal.show !== 'function' || typeof modal.hide !== 'function') {
      Logger.error(`Modal ${modal.id} validation FAILED - show: ${typeof modal.show}, hide: ${typeof modal.hide}`);
      return false;
    }
    
    return true;
  }

  /**
   * Validates price text format
   * @param {string} priceText - Price text to validate
   * @returns {Object} Validation result
   */
  static validatePriceText(priceText) {
    if (!priceText || typeof priceText !== 'string') {
      return {
        isValid: false,
        message: 'Price text must be a non-empty string'
      };
    }
    
    // Check if price text contains valid price format
    const priceRegex = /\$?\d+(\.\d{2})?/;
    if (!priceRegex.test(priceText)) {
      return {
        isValid: false,
        message: 'Invalid price format'
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validates event target for product selection
   * @param {Event} event - The event to validate
   * @returns {Object} Validation result
   */
  static validateEventTarget(event) {
    if (!event || !event.target) {
      return {
        isValid: false,
        message: 'Invalid event or event target'
      };
    }
    
    return { isValid: true };
  }

  /**
   * Shows validation modal with message
   * @param {string} message - Validation message to display
   * @param {Function} createModalCallback - Callback to create modal
   */
  static showValidationModal(message, createModalCallback) {
    if (typeof createModalCallback === 'function') {
      createModalCallback(message, 'Aceptar', () => {});
    } else {
      Logger.error('showValidationModal: createModalCallback is not a function');
    }
  }
}