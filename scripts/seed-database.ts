/**
 * Database Seeding Script
 * Populates the database with sample data for development and testing
 * 
 * Usage: npm run seed
 * 
 * This script is idempotent - it can be run multiple times safely.
 * It clears existing data before seeding.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../src/lib/db/models/Product';
import Media from '../src/lib/db/models/Media';
import Content from '../src/lib/db/models/Content';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Sample media data (hero and carousel images)
 */
const sampleMedia = [
  {
    cloudinaryId: 'confectionary/hero/african-delicacies-hero',
    url: 'https://res.cloudinary.com/demo/image/upload/confectionary/hero/african-delicacies-hero.jpg',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/confectionary/hero/african-delicacies-hero.jpg',
    type: 'hero' as const,
    altText: 'Authentic African Delicacies - Fresh and Traditional',
    width: 1200,
    height: 800,
    format: 'jpg',
  },
  {
    cloudinaryId: 'confectionary/carousel/traditional-snacks',
    url: 'https://res.cloudinary.com/demo/image/upload/confectionary/carousel/traditional-snacks.jpg',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/confectionary/carousel/traditional-snacks.jpg',
    type: 'carousel' as const,
    altText: 'Traditional African Snacks and Treats',
    width: 1200,
    height: 600,
    format: 'jpg',
  },
  {
    cloudinaryId: 'confectionary/carousel/fish-products',
    url: 'https://res.cloudinary.com/demo/image/upload/confectionary/carousel/fish-products.jpg',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/confectionary/carousel/fish-products.jpg',
    type: 'carousel' as const,
    altText: 'Premium Smoked and Dried Fish Products',
    width: 1200,
    height: 600,
    format: 'jpg',
  },
  {
    cloudinaryId: 'confectionary/carousel/african-ingredients',
    url: 'https://res.cloudinary.com/demo/image/upload/confectionary/carousel/african-ingredients.jpg',
    secureUrl: 'https://res.cloudinary.com/demo/image/upload/confectionary/carousel/african-ingredients.jpg',
    type: 'carousel' as const,
    altText: 'Authentic African Ingredients and Staples',
    width: 1200,
    height: 600,
    format: 'jpg',
  },
];

/**
 * Sample content data (homepage hero and about page)
 */
const sampleContent = [
  {
    key: 'homepage_hero',
    title: 'Homepage Hero Section',
    description: 'Main hero section content for the homepage',
    data: {
      heading: 'Authentic African Delicacies',
      subheading: 'Discover the rich flavors of Africa - from traditional confectionaries to premium fish products',
      ctaText: 'Browse Products',
      ctaLink: '/products',
    },
  },
  {
    key: 'about_page',
    title: 'About Us Content',
    description: 'Content for the about page',
    data: {
      story: 'We are passionate about bringing authentic African food products to your doorstep. Our journey began with a simple mission: to share the rich culinary heritage of Africa with the world.',
      mission: 'Our mission is to provide high-quality, authentic African food products while supporting local producers and preserving traditional food preparation methods.',
      values: ['Quality', 'Authenticity', 'Tradition', 'Community', 'Excellence'],
    },
  },
];

/**
 * Sample products data (at least 3 per category)
 */
const sampleProducts = [
  // Confectionary products
  {
    name: 'Nigerian Chin Chin',
    slug: 'nigerian-chin-chin',
    category: 'confectionary' as const,
    description: 'Crispy, crunchy, and slightly sweet fried dough snack. A beloved West African treat perfect for any occasion. Made with flour, sugar, and a hint of nutmeg.',
    price: 8.99,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/chin-chin-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/chin-chin-2.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Serve at Room Temperature',
        description: 'Remove from packaging and serve in a bowl. Best enjoyed at room temperature.',
        duration: '2 minutes',
      },
      {
        stepNumber: 2,
        title: 'Storage',
        description: 'Store in an airtight container to maintain crispiness for up to 2 weeks.',
        duration: '',
      },
    ],
    nutritionInfo: {
      servingSize: '30g',
      calories: 150,
      protein: '2g',
      carbs: '20g',
      fat: '7g',
    },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Plantain Chips',
    slug: 'plantain-chips',
    category: 'confectionary' as const,
    description: 'Thinly sliced and perfectly fried plantain chips. Lightly salted for a savory crunch. A healthier alternative to regular potato chips with authentic African flavor.',
    price: 6.50,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/plantain-chips.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Open and Enjoy',
        description: 'Simply open the package and enjoy these crispy plantain chips as a snack.',
        duration: '1 minute',
      },
    ],
    nutritionInfo: {
      servingSize: '40g',
      calories: 180,
      protein: '1g',
      carbs: '25g',
      fat: '9g',
    },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Coconut Candy',
    slug: 'coconut-candy',
    category: 'confectionary' as const,
    description: 'Sweet and chewy coconut candy made from fresh coconut and caramelized sugar. A traditional African sweet treat that melts in your mouth.',
    price: 5.99,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/coconut-candy.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Unwrap and Enjoy',
        description: 'Unwrap individual pieces and enjoy. Best served at room temperature.',
        duration: '1 minute',
      },
    ],
    nutritionInfo: {
      servingSize: '25g',
      calories: 120,
      protein: '1g',
      carbs: '18g',
      fat: '5g',
    },
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Puff Puff Mix',
    slug: 'puff-puff-mix',
    category: 'confectionary' as const,
    description: 'Pre-mixed flour blend for making authentic Nigerian puff puff - sweet, fluffy fried dough balls. Just add water and fry!',
    price: 7.50,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/puff-puff-mix.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Mix with Water',
        description: 'Pour the mix into a bowl and add warm water gradually while stirring until you get a smooth, thick batter.',
        duration: '5 minutes',
      },
      {
        stepNumber: 2,
        title: 'Let it Rise',
        description: 'Cover the bowl and let the batter rise in a warm place for 30-45 minutes.',
        duration: '45 minutes',
      },
      {
        stepNumber: 3,
        title: 'Heat Oil',
        description: 'Heat vegetable oil in a deep pan to 350°F (175°C).',
        duration: '5 minutes',
      },
      {
        stepNumber: 4,
        title: 'Fry',
        description: 'Scoop small amounts of batter with a spoon and drop into hot oil. Fry until golden brown, turning occasionally.',
        duration: '10 minutes',
      },
    ],
    isFeatured: true,
    isActive: true,
  },

  // Fish products
  {
    name: 'Smoked Catfish',
    slug: 'smoked-catfish',
    category: 'fish' as const,
    description: 'Premium quality smoked catfish, traditionally prepared. Rich in protein and omega-3 fatty acids. Perfect for soups, stews, and traditional African dishes.',
    price: 15.99,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/smoked-catfish.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Clean and Rinse',
        description: 'Rinse the smoked catfish under cold water to remove any debris.',
        duration: '3 minutes',
      },
      {
        stepNumber: 2,
        title: 'Soak (Optional)',
        description: 'For a milder flavor, soak in warm water for 10-15 minutes, then drain.',
        duration: '15 minutes',
      },
      {
        stepNumber: 3,
        title: 'Add to Dish',
        description: 'Add to your soup, stew, or sauce. Cook for at least 20 minutes to infuse flavors.',
        duration: '20 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '100g',
      calories: 250,
      protein: '35g',
      carbs: '0g',
      fat: '12g',
    },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Dried Crayfish',
    slug: 'dried-crayfish',
    category: 'fish' as const,
    description: 'Ground dried crayfish powder - an essential ingredient in West African cooking. Adds authentic umami flavor to soups, stews, and sauces.',
    price: 12.50,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/dried-crayfish.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Measure Amount',
        description: 'Measure the desired amount of dried crayfish powder for your recipe.',
        duration: '1 minute',
      },
      {
        stepNumber: 2,
        title: 'Add to Cooking',
        description: 'Add directly to soups, stews, or sauces during cooking. Stir well to distribute flavor.',
        duration: '2 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '10g',
      calories: 35,
      protein: '7g',
      carbs: '0g',
      fat: '0.5g',
    },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Stockfish',
    slug: 'stockfish',
    category: 'fish' as const,
    description: 'Premium dried cod fish (stockfish), a delicacy in African cuisine. Requires soaking before use. Adds rich flavor and protein to traditional dishes.',
    price: 18.99,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/stockfish.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Soak Overnight',
        description: 'Place stockfish in a large bowl and cover with cold water. Soak for 24-48 hours, changing water every 12 hours.',
        duration: '24-48 hours',
      },
      {
        stepNumber: 2,
        title: 'Clean and Debone',
        description: 'After soaking, clean the fish and remove bones. Break into smaller pieces.',
        duration: '10 minutes',
      },
      {
        stepNumber: 3,
        title: 'Cook',
        description: 'Add to your soup or stew and cook for at least 30 minutes until tender.',
        duration: '30 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '100g',
      calories: 290,
      protein: '62g',
      carbs: '0g',
      fat: '2g',
    },
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Smoked Mackerel',
    slug: 'smoked-mackerel',
    category: 'fish' as const,
    description: 'Whole smoked mackerel, traditionally prepared. Rich, oily fish perfect for adding depth to African soups and stews.',
    price: 13.99,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/smoked-mackerel.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Rinse',
        description: 'Rinse the smoked mackerel under cold water.',
        duration: '2 minutes',
      },
      {
        stepNumber: 2,
        title: 'Add to Dish',
        description: 'Add whole or in pieces to your soup or stew. Cook for 15-20 minutes.',
        duration: '20 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '100g',
      calories: 305,
      protein: '19g',
      carbs: '0g',
      fat: '25g',
    },
    isFeatured: true,
    isActive: true,
  },

  // Foodstuffs products
  {
    name: 'Egusi Seeds (Ground)',
    slug: 'egusi-seeds-ground',
    category: 'foodstuffs' as const,
    description: 'Ground melon seeds (egusi) - the base for the famous Nigerian egusi soup. Rich, nutty flavor and high in protein. Essential for authentic West African cooking.',
    price: 9.99,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/egusi-seeds.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Measure Egusi',
        description: 'Measure the required amount of ground egusi for your recipe (typically 1-2 cups for soup).',
        duration: '2 minutes',
      },
      {
        stepNumber: 2,
        title: 'Mix with Liquid',
        description: 'Mix egusi with a small amount of water or stock to form a paste.',
        duration: '3 minutes',
      },
      {
        stepNumber: 3,
        title: 'Add to Soup',
        description: 'Add the egusi paste to your boiling soup base, stirring constantly to prevent lumps.',
        duration: '5 minutes',
      },
      {
        stepNumber: 4,
        title: 'Simmer',
        description: 'Reduce heat and simmer for 20-30 minutes, stirring occasionally.',
        duration: '30 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '50g',
      calories: 280,
      protein: '14g',
      carbs: '10g',
      fat: '22g',
    },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Plantain Flour',
    slug: 'plantain-flour',
    category: 'foodstuffs' as const,
    description: 'Unripe plantain flour - a gluten-free, nutritious alternative to wheat flour. Perfect for making swallow (fufu), baking, or thickening soups.',
    price: 8.50,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/plantain-flour.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Boil Water',
        description: 'Bring water to a rolling boil in a pot.',
        duration: '5 minutes',
      },
      {
        stepNumber: 2,
        title: 'Add Flour Gradually',
        description: 'Reduce heat and gradually add plantain flour while stirring continuously to avoid lumps.',
        duration: '5 minutes',
      },
      {
        stepNumber: 3,
        title: 'Stir and Cook',
        description: 'Stir vigorously until the mixture forms a smooth, stretchy dough. Cook for 5 more minutes.',
        duration: '5 minutes',
      },
      {
        stepNumber: 4,
        title: 'Serve',
        description: 'Mold into balls and serve hot with your favorite soup or stew.',
        duration: '2 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '100g',
      calories: 350,
      protein: '3g',
      carbs: '85g',
      fat: '1g',
    },
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Palm Oil (Red)',
    slug: 'palm-oil-red',
    category: 'foodstuffs' as const,
    description: 'Authentic red palm oil - the heart of West African cooking. Rich in vitamins and adds distinctive color and flavor to traditional dishes.',
    price: 11.99,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/palm-oil.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Heat Oil',
        description: 'Pour desired amount into a pot and heat on medium heat until it melts (if solidified).',
        duration: '3 minutes',
      },
      {
        stepNumber: 2,
        title: 'Use in Cooking',
        description: 'Use as a base for frying or add to soups and stews for authentic flavor and color.',
        duration: '5 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '15ml',
      calories: 120,
      protein: '0g',
      carbs: '0g',
      fat: '14g',
    },
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Ogbono Seeds (Ground)',
    slug: 'ogbono-seeds-ground',
    category: 'foodstuffs' as const,
    description: 'Ground African wild mango seeds (ogbono). Creates a thick, draw soup beloved across West Africa. Unique texture and earthy flavor.',
    price: 10.50,
    currency: 'GBP',
    images: [
      'https://res.cloudinary.com/demo/image/upload/confectionary/product/ogbono-seeds.jpg',
    ],
    preparationSteps: [
      {
        stepNumber: 1,
        title: 'Prepare Base',
        description: 'Heat palm oil and add your choice of protein and seasonings.',
        duration: '10 minutes',
      },
      {
        stepNumber: 2,
        title: 'Add Ogbono',
        description: 'Add ground ogbono to the pot and stir immediately to prevent lumps.',
        duration: '3 minutes',
      },
      {
        stepNumber: 3,
        title: 'Add Stock',
        description: 'Gradually add stock or water while stirring. The soup will become thick and stretchy.',
        duration: '5 minutes',
      },
      {
        stepNumber: 4,
        title: 'Simmer',
        description: 'Simmer on low heat for 10-15 minutes, stirring occasionally.',
        duration: '15 minutes',
      },
    ],
    nutritionInfo: {
      servingSize: '50g',
      calories: 260,
      protein: '8g',
      carbs: '12g',
      fat: '20g',
    },
    isFeatured: true,
    isActive: true,
  },
];

/**
 * Connect to MongoDB
 */
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: 'confectionary',
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Clear existing data
 */
async function clearData() {
  try {
    await Product.deleteMany({});
    console.log('🗑️  Cleared products collection');
    
    await Media.deleteMany({});
    console.log('🗑️  Cleared media collection');
    
    await Content.deleteMany({});
    console.log('🗑️  Cleared content collection');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

/**
 * Seed media records
 */
async function seedMedia() {
  try {
    await Media.insertMany(sampleMedia);
    console.log(`✅ Seeded ${sampleMedia.length} media records`);
  } catch (error) {
    console.error('❌ Error seeding media:', error);
    throw error;
  }
}

/**
 * Seed content records
 */
async function seedContent() {
  try {
    await Content.insertMany(sampleContent);
    console.log(`✅ Seeded ${sampleContent.length} content records`);
  } catch (error) {
    console.error('❌ Error seeding content:', error);
    throw error;
  }
}

/**
 * Seed products
 */
async function seedProducts() {
  try {
    await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} products`);
    
    // Log category breakdown
    const confectionaryCount = sampleProducts.filter(p => p.category === 'confectionary').length;
    const fishCount = sampleProducts.filter(p => p.category === 'fish').length;
    const foodstuffsCount = sampleProducts.filter(p => p.category === 'foodstuffs').length;
    
    console.log(`   - Confectionary: ${confectionaryCount} products`);
    console.log(`   - Fish: ${fishCount} products`);
    console.log(`   - Foodstuffs: ${foodstuffsCount} products`);
    
    const featuredCount = sampleProducts.filter(p => p.isFeatured).length;
    console.log(`   - Featured: ${featuredCount} products`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seed() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('\n📦 Clearing existing data...');
    await clearData();
    
    // Seed data
    console.log('\n🌱 Seeding new data...');
    await seedMedia();
    await seedContent();
    await seedProducts();
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${sampleMedia.length} media records`);
    console.log(`   - ${sampleContent.length} content records`);
    console.log(`   - ${sampleProducts.length} products`);
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the seeding script
seed();
