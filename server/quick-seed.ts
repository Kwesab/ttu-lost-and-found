import "dotenv/config";
import pg from "pg";

async function quickSeed() {
  const client = new pg.Client(process.env.DATABASE_URL);
  
  try {
    console.log("🔄 Connecting to database...");
    await client.connect();
    console.log("✅ Connected\n");

    console.log("🌱 Clearing existing data...");
    await client.query("DELETE FROM claims");
    await client.query("DELETE FROM items");
    console.log("✅ Data cleared\n");

    console.log("🌱 Inserting sample items...");
    
    // Sample items with proper typing
    const sampleItems = [
      {
        type: 'lost',
        title: 'Blue Backpack',
        description: 'Blue Nike backpack with laptop inside',
        location: 'Student Center',
        date: '2024-01-15',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400'],
        contact_email: 'student@ttu.edu',
        verification_questions: ['What brand is the laptop inside?', 'What color is the main zipper?', 'How many external pockets?']
      },
      {
        type: 'found',
        title: 'Silver Watch',
        description: 'Citizen watch found in the library',
        location: 'Main Library, 2nd Floor',
        date: '2024-01-16',
        image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
        image_urls: null,
        contact_email: 'finder@ttu.edu',
        verification_questions: ['What is engraved on the back?', 'What is the watch brand?', 'What color is the watch face?']
      },
      {
        type: 'lost',
        title: 'Black Water Bottle',
        description: 'Hydroflask water bottle, black color',
        location: 'Gym Locker Room',
        date: '2024-01-17',
        image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
        image_urls: null,
        contact_email: 'athlete@ttu.edu',
        verification_questions: ['Are there any stickers on it?', 'What size is the bottle?', 'What is the cap color?']
      }
    ];

    for (const item of sampleItems) {
      await client.query(
        `INSERT INTO items (type, title, description, location, date, image_url, image_urls, contact_email, verification_questions, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')`,
        [
          item.type,
          item.title,
          item.description,
          item.location,
          item.date,
          item.image_url,
          item.image_urls,
          item.contact_email,
          item.verification_questions
        ]
      );
      console.log(`  ✅ Inserted: ${item.title}`);
    }

    // Verify count
    const result = await client.query("SELECT COUNT(*) as count FROM items");
    console.log(`\n✅ Seeded ${result.rows[0].count} items successfully!`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("✅ Seed complete!");
    process.exit(0);
  }
}

quickSeed();
