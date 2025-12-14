
import { OrderSystemValidations } from '../Interfaces/web/ui-adapters/components/order-system-validations.js';

// Mock console colors
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function runTest(name, fn) {
    try {
        const result = fn();
        if (result) {
            console.log(`${colors.green}✔ PASS:${colors.reset} ${name}`);
            return true;
        } else {
            console.error(`${colors.red}✘ FAIL:${colors.reset} ${name}`);
            return false;
        }
    } catch (e) {
        console.error(`${colors.red}✘ ERROR:${colors.reset} ${name} - ${e.message}`);
        console.error(e);
        return false;
    }
}

console.log(`${colors.blue}🧪 Starting Mixer Logic Safety Checks...${colors.reset}\n`);

let passed = 0;
let total = 0;

// Test Suite: validateSpecialBottleRules
// Combinations:
// 1. Up to 2 pitchers (Juices)
// 2. Up to 5 sodas (Refrescos)
// 3. 1 Pitcher + 2 Sodas

// Helper wrapper
function check(isJuice, currentJuices, currentSodas, category, product) {
    return OrderSystemValidations.validateSpecialBottleRules(
        isJuice,
        currentJuices,
        currentSodas,
        category,
        product
    );
}

const SPECIAL_CAT = 'VODKA'; // Triggers special rules
const SPECIAL_PROD = 'ABSOLUT';

// --- Scenario 1: Sodas Only ---
total++;
passed += runTest('Allow 1st Soda (0J, 0S)', () => check(false, 0, 0, SPECIAL_CAT, SPECIAL_PROD) === true) ? 1 : 0;
total++;
passed += runTest('Allow 5th Soda (0J, 4S)', () => check(false, 0, 4, SPECIAL_CAT, SPECIAL_PROD) === true) ? 1 : 0;
total++;
passed += runTest('Block 6th Soda (0J, 5S)', () => check(false, 0, 5, SPECIAL_CAT, SPECIAL_PROD) === false) ? 1 : 0;

// --- Scenario 2: Pitchers Only ---
total++;
passed += runTest('Allow 1st Pitcher (0J, 0S)', () => check(true, 0, 0, SPECIAL_CAT, SPECIAL_PROD) === true) ? 1 : 0;
total++;
passed += runTest('Allow 2nd Pitcher (1J, 0S)', () => check(true, 1, 0, SPECIAL_CAT, SPECIAL_PROD) === true) ? 1 : 0;
total++;
passed += runTest('Block 3rd Pitcher (2J, 0S)', () => check(true, 2, 0, SPECIAL_CAT, SPECIAL_PROD) === false) ? 1 : 0;

// --- Scenario 3: Mixed (1 Pitcher + Sodas) ---
total++;
passed += runTest('Allow 1 Soda with 1 Pitcher (1J, 0S)', () => check(false, 1, 0, SPECIAL_CAT, SPECIAL_PROD) === true) ? 1 : 0;
total++;
passed += runTest('Allow 2 Sodas with 1 Pitcher (1J, 1S)', () => check(false, 1, 1, SPECIAL_CAT, SPECIAL_PROD) === true) ? 1 : 0;
total++;
passed += runTest('Block 3rd Soda with 1 Pitcher (1J, 2S)', () => check(false, 1, 2, SPECIAL_CAT, SPECIAL_PROD) === false) ? 1 : 0;

// --- Scenario 4: Pitcher after Sodas ---
total++;
passed += runTest('Allow Pitcher if 2 Sodas (0J, 2S)', () => check(true, 0, 2, SPECIAL_CAT, SPECIAL_PROD) === true) ? 1 : 0;
total++;
passed += runTest('Block Pitcher if 3 Sodas (0J, 3S)', () => check(true, 0, 3, SPECIAL_CAT, SPECIAL_PROD) === false) ? 1 : 0;

// --- Scenario 5: Block 2nd Pitcher if any Soda exists ---
total++;
passed += runTest('Block 2nd Pitcher if 1 Soda (1J, 1S)', () => check(true, 1, 1, SPECIAL_CAT, SPECIAL_PROD) === false) ? 1 : 0;

console.log(`\n${colors.blue}Results: ${passed}/${total} checks passed.${colors.reset}`);

if (passed === total) {
    console.log(`${colors.green}✅ LOGIC INTEGRITY VERIFIED${colors.reset}`);
    process.exit(0);
} else {
    console.log(`${colors.red}❌ LOGIC FAILURES DETECTED${colors.reset}`);
    process.exit(1);
}
