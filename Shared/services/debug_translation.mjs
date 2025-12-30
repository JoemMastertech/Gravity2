
import TranslationService from './TranslationService.js';

console.log('TranslationService imported:', TranslationService);
console.log('Type of TranslationService:', typeof TranslationService);
console.log('Is instance of TranslationService class?', TranslationService.constructor.name === 'TranslationService');

if (TranslationService) {
    console.log('Has translatePage method?', typeof TranslationService.translatePage === 'function');
    if (typeof TranslationService.translatePage === 'function') {
        console.log('translatePage method found.');
    } else {
        console.error('translatePage method MISSING!');
        // List all properties
        console.log('Properties:', Object.getOwnPropertyNames(Object.getPrototypeOf(TranslationService)));
    }
} else {
    console.error('TranslationService is undefined/null');
}
