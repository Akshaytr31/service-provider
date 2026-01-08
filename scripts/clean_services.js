const { db } = require('../lib/db');

async function cleanServices() {
  try {
    console.log('Deleting all services...');
    await db.query('DELETE FROM services');
    console.log('Services deleted.');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting services:', error);
    process.exit(1);
  }
}

cleanServices();
