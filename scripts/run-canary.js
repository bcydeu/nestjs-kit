const { runCanary } = require('../dist/common/index.js');

const result = runCanary();

console.log('canary result:', JSON.stringify(result, null, 2));

if (!result.okValid) {
  console.error('❌ FAIL: valid payload produced errors — decorators malfunctioning');
  process.exit(1);
}
if (!result.okInvalid) {
  console.error('❌ FAIL: invalid payload produced no errors — decorator metadata likely stripped');
  process.exit(1);
}
if (!result.okNested) {
  console.error('❌ FAIL: nested validation did not fire — @Type metadata likely stripped');
  process.exit(1);
}

console.log('✅ decorator metadata canary passed');
