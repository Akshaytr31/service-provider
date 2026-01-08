const { db } = require('../lib/db');

async function seedCategories() {
  try {
    console.log('Seeding categories...');

    // Clear existing
    await db.query('DELETE FROM sub_categories');
    await db.query('DELETE FROM categories');

    // Insert Categories
    const categories = [
      { name: 'Home Services', image: 'https://placehold.co/100?text=Home' },
      { name: 'Personal Care', image: 'https://placehold.co/100?text=Personal' },
      { name: 'Repairs', image: 'https://placehold.co/100?text=Repairs' },
    ];

    for (const cat of categories) {
      const [res] = await db.query('INSERT INTO categories (name, image) VALUES (?, ?)', [cat.name, cat.image]);
      const catId = res.insertId;

      const subCategories = [];
      if (cat.name === 'Home Services') subCategories.push('Cleaning', 'Plumbing', 'Electrical');
      if (cat.name === 'Personal Care') subCategories.push('Haircut', 'Massage', 'Manicure');
      if (cat.name === 'Repairs') subCategories.push('Appliance Repair', 'Computer Repair');

      for (const sub of subCategories) {
        await db.query('INSERT INTO sub_categories (name, category_id) VALUES (?, ?)', [sub, catId]);
      }
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
