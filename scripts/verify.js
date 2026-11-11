const { checkCompatibility } = require('../src/lib/compatibility');

// Test 1: Incompatible Socket (Ryzen 7 7800X3D AM5 + MSI B760 LGA1700)
const test1 = checkCompatibility({
  CPU: { brand: 'AMD', socket: 'AM5', tdp: 120 },
  MOTHERBOARD: { brand: 'MSI', socket: 'LGA1700', memoryType: 'DDR5' },
});
console.log('Test 1 (Socket Mismatch):', test1.isCompatible === false ? 'PASS (Detected error)' : 'FAIL');
console.log('Test 1 Error:', test1.issues[0]?.titleRu);

// Test 2: Incompatible RAM (DDR4 RAM on DDR5 Motherboard)
const test2 = checkCompatibility({
  MOTHERBOARD: { brand: 'MSI', socket: 'AM5', memoryType: 'DDR5' },
  RAM: { brand: 'Kingston', memoryType: 'DDR4' },
});
console.log('Test 2 (RAM Mismatch):', test2.isCompatible === false ? 'PASS (Detected error)' : 'FAIL');
console.log('Test 2 Error:', test2.issues[0]?.titleRu);

// Test 3: GPU too long for Case (RTX 4090 357mm in Compact Case 255mm)
const test3 = checkCompatibility({
  GPU: { brand: 'NVIDIA', lengthMm: 357, tdp: 450 },
  CASE: { brand: 'Jonsbo', maxGpuLength: 255 },
});
console.log('Test 3 (GPU Length Overflow):', test3.isCompatible === false ? 'PASS (Detected error)' : 'FAIL');
console.log('Test 3 Error:', test3.issues[0]?.titleRu);

// Test 4: Insufficient PSU Wattage (500W PSU with 14900K + RTX 4090 ~ 770W peak)
const test4 = checkCompatibility({
  CPU: { tdp: 253 },
  GPU: { tdp: 450 },
  PSU: { wattage: 500 },
});
console.log('Test 4 (PSU Wattage Deficit):', test4.isCompatible === false ? 'PASS (Detected error)' : 'FAIL');
console.log('Test 4 Error:', test4.issues[0]?.titleRu);

// Test 5: Fully Compatible Build
const test5 = checkCompatibility({
  CPU: { socket: 'AM5', tdp: 120 },
  MOTHERBOARD: { socket: 'AM5', memoryType: 'DDR5', formFactor: 'ATX' },
  RAM: { memoryType: 'DDR5' },
  GPU: { lengthMm: 300, tdp: 285 },
  CASE: { maxGpuLength: 400, maxCoolerHeight: 170, supportedMotherboards: 'ATX,Micro-ATX' },
  COOLER: { coolerHeight: 160, supportedSockets: 'AM4,AM5,LGA1700' },
  PSU: { wattage: 850 },
});
console.log('Test 5 (Fully Compatible):', test5.isCompatible === true ? 'PASS (Compatible)' : 'FAIL');
console.log('Estimated Peak TDP:', test5.totalTdp, 'W, Recommended PSU:', test5.recommendedPsuWattage, 'W');
