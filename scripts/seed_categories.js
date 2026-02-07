const { db } = require("../lib/db");

async function seedCategories() {
  try {
    console.log("Seeding categories...");

    // Categories to seed
    const categories = [
      { name: "Home Services", image: "https://placehold.co/100?text=Home" },
      {
        name: "Personal Care",
        image: "https://placehold.co/100?text=Personal",
      },
      { name: "Repairs", image: "https://placehold.co/100?text=Repairs" },
    ];

    for (const cat of categories) {
      // Check if category exists
      const [existingCats] = await db.query(
        "SELECT id FROM categories WHERE name = ?",
        [cat.name],
      );
      let catId;

      if (existingCats.length > 0) {
        catId = existingCats[0].id;
        console.log(`Category "${cat.name}" already exists (ID: ${catId})`);
      } else {
        const [res] = await db.query(
          "INSERT INTO categories (name, image) VALUES (?, ?)",
          [cat.name, cat.image],
        );
        catId = res.insertId;
        console.log(`Created category "${cat.name}" (ID: ${catId})`);
      }

      const subCategories = [];
      if (cat.name === "Home Services")
        subCategories.push(
          "Cleaning",
          "Plumbing",
          "Electrical",
          "Painting",
          "Carpentry",
          "Pest Control",
          "Gardening",
          "Deep Cleaning",
        );
      if (cat.name === "Personal Care")
        subCategories.push(
          "Haircut",
          "Massage",
          "Manicure",
          "Pedicure",
          "Facial",
          "Waxing",
          "Threading",
          "Makeup",
          "Bridal Makeup",
          "Party Makeup",
        );
      if (cat.name === "Repairs")
        subCategories.push(
          "Appliance Repair",
          "Computer Repair",
          "Mobile Repair",
          "Laptop Repair",
          "Tablet Repair",
          "Phone Repair",
        );

      for (const sub of subCategories) {
        // Check if subcategory exists
        const [existingSubs] = await db.query(
          "SELECT id FROM sub_categories WHERE name = ? AND category_id = ?",
          [sub, catId],
        );

        if (existingSubs.length > 0) {
          console.log(`  Subcategory "${sub}" already exists`);
        } else {
          await db.query(
            "INSERT INTO sub_categories (name, category_id) VALUES (?, ?)",
            [sub, catId],
          );
          console.log(`  Created subcategory "${sub}"`);
        }
      }
    }

    console.log("Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
