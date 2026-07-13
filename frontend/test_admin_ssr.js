try {
  console.log('Testing require of admin.js...');
  require('./src/pages/admin.js');
  console.log('✅ admin.js required successfully without syntax or module load errors!');
} catch (e) {
  console.error('❌ Exception loading admin.js:', e);
}
