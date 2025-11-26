import "dotenv/config";
import { query } from "./db.js";
import { runMigrations } from "./migrate.js";

/**
 * Seed the database with sample data
 */
export async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...\n");

  try {
    // Ensure tables exist
    await runMigrations();

    // Clear existing data
    await query("DELETE FROM claims");
    await query("DELETE FROM items");
    console.log("Cleared existing data\n");

    // Insert sample items
    const items = [
      {
        type: "lost",
        title: "Blue Backpack",
        description: "Blue Nike backpack with laptop inside, lost on campus near the student center",
        location: "Student Center",
        date: "2024-01-15",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
        imageUrls: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=300&fit=crop"
        ],
        contactEmail: "student@ttu.edu",
        verificationQuestions: [
          "What brand is the laptop inside?",
          "What color is the main zipper?",
          "How many external pockets does it have?"
        ]
      },
      {
        type: "found",
        title: "Gold Watch",
        description: "Found a gold watch in the library near the study tables on the 3rd floor",
        location: "Main Library, 3rd Floor",
        date: "2024-01-16",
        imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop",
        contactEmail: "finder@ttu.edu",
        verificationQuestions: [
          "What is the brand name?",
          "What time does it show?",
          "Are there any engravings on the back?"
        ]
      },
      {
        type: "lost",
        title: "Red Water Bottle",
        description: "Hydro Flask water bottle, red color with various stickers from campus events",
        location: "Recreation Center",
        date: "2024-01-14",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7e36de433fbf?w=400&h=300&fit=crop",
        contactEmail: "owner@ttu.edu",
        verificationQuestions: [
          "What brand is it?",
          "What color is the lid?",
          "What stickers are on it?"
        ]
      },
      {
        type: "found",
        title: "iPhone 13",
        description: "Found an iPhone 13 in black color near the library entrance",
        location: "Library Entrance",
        date: "2024-01-17",
        imageUrl: "https://images.unsplash.com/photo-1592286927505-2fd1958a3f00?w=400&h=300&fit=crop",
        imageUrls: [
          "https://images.unsplash.com/photo-1592286927505-2fd1958a3f00?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop"
        ],
        contactEmail: "helper@ttu.edu",
        verificationQuestions: [
          "What is the lock screen wallpaper?",
          "What color is the phone case?",
          "Name one app on the home screen"
        ]
      },
      {
        type: "lost",
        title: "Black Headphones",
        description: "Sony WH-1000XM4 wireless headphones in black, lost in the engineering building",
        location: "Engineering Building, Room 201",
        date: "2024-01-13",
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop",
        contactEmail: "music@ttu.edu",
        verificationQuestions: [
          "What brand are they?",
          "What's the serial number?",
          "Are there any scratches or marks?"
        ]
      }
    ];

    for (const item of items) {
      const result = await query(
        `INSERT INTO items (
          type, title, description, location, date, 
          image_url, image_urls, contact_email, verification_questions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          item.type,
          item.title,
          item.description,
          item.location,
          item.date,
          item.imageUrl,
          item.imageUrls || null,
          item.contactEmail,
          item.verificationQuestions
        ]
      );
      console.log(`✅ Created ${item.type} item: ${item.title} (ID: ${result.rows[0].id})`);
    }

    console.log(`\n✅ Successfully seeded ${items.length} items!\n`);
    return true;
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
  (async () => {
    try {
      await seedDatabase();
      console.log("✅ Seed script completed");
      // Force exit to close pool
      setTimeout(() => process.exit(0), 100);
    } catch (error) {
      console.error("❌ Seed script failed:", error);
      setTimeout(() => process.exit(1), 100);
    }
  })();
}
