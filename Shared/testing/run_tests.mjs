import { JSDOM } from 'jsdom';

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:8080'
});

global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    writable: true
});
global.HTMLElement = dom.window.HTMLElement;
global.NodeList = dom.window.NodeList;

console.log('🚀 Running OrderSystem Integration Tests...');

// Dynamic import to ensure globals are set first
const { runTests } = await import('./test-framework.js');
await import('./OrderSystem.integration.test.js');

runTests().then(results => {
    if (results.failed > 0) {
        console.error('❌ Some tests failed!');
        process.exit(1);
    } else {
        console.log('✅ All tests passed!');
        process.exit(0);
    }
}).catch(err => {
    console.error('🔥 Error running tests:', err);
    process.exit(1);
});
