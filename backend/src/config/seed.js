/**
 * seed.js — Turso/SQLite seed data
 * Uses INSERT OR IGNORE to avoid duplicates on restart.
 * image_urls and recommended_frame_shapes stored as JSON strings.
 */

const products = [
  { name: 'Onyx Matte Rectangle', description: 'Engineered with ultra-light matte acetate, these classic black rectangular frames offer a sophisticated look for daily office and digital screen usage.', price: 3499, category: 'Eyeglasses', gender: 'Men', frame_shape: 'Rectangle', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80']), stock: 45 },
  { name: 'Rose Gold Stella Round', description: 'Beautifully crafted round wireframes made from premium titanium, finished with an elegant rose gold polish. Light as a feather and extremely durable.', price: 4999, category: 'Eyeglasses', gender: 'Women', frame_shape: 'Round', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80']), stock: 30 },
  { name: 'Tortoise Shell Chelsea Cat-Eye', description: 'Make a bold style statement with these hand-polished acetate cat-eye frames in vintage tortoise shell pattern. Ideal for styling up any outfit.', price: 3899, category: 'Eyeglasses', gender: 'Women', frame_shape: 'Cat-Eye', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80']), stock: 25 },
  { name: 'Clear Crystal Wayfarer', description: 'A modern twist on a classic shape. These crystal-clear acetate frames adapt to any face tone, featuring golden metal rivets for a touch of premium luxury.', price: 4200, category: 'Eyeglasses', gender: 'Unisex', frame_shape: 'Wayfarer', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80']), stock: 50 },
  { name: 'Titanium Rimless Oval', description: 'Minimalist, rimless design with oval lenses and gold plated temples. Perfect for those who prefer an invisible, weightless eyewear experience.', price: 5500, category: 'Eyeglasses', gender: 'Unisex', frame_shape: 'Oval', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80']), stock: 15 },
  { name: 'Kids Flexi-Blue blocker', description: 'Indestructible, flexible silicon frames designed specifically for kids. Equipped with zero-power blue light protection lenses for online school classes.', price: 1899, category: 'Eyeglasses', gender: 'Kids', frame_shape: 'Round', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80']), stock: 60 },
  { name: 'Aero Gold polarized Aviators', description: 'The ultimate classic. 24k gold-plated double bridge metal aviators with premium green polarized lenses. Complete UV400 protection.', price: 6500, category: 'Sunglasses', gender: 'Unisex', frame_shape: 'Aviator', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80']), stock: 40 },
  { name: 'Onyx Premium polarized Wayfarer', description: 'Crafted from bio-based acetate with a dark matte finish and grey polarized impact-resistant lenses. Engineered for driving and outdoor sports.', price: 4800, category: 'Sunglasses', gender: 'Men', frame_shape: 'Wayfarer', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80']), stock: 35 },
  { name: 'Champagne Glass Square', description: 'Warm champagne-hued semi-transparent frames with gradient brown lenses. Provides a sunny, glamorous retro aesthetic for beach trips.', price: 4600, category: 'Sunglasses', gender: 'Women', frame_shape: 'Square', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80']), stock: 20 },
  { name: 'Vintage Clubmaster Classic', description: 'Iconic browline sunglasses with black top-acetate rims and gold-tinted bottom metal rims. Features polarized G-15 classic green lenses.', price: 5200, category: 'Sunglasses', gender: 'Men', frame_shape: 'Square', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=600&q=80']), stock: 18 },
  { name: 'Kids Aviator Junior', description: 'Retro aviator sunglasses downsized for children. Shatterproof polycarbonate lenses with UV protection and soft-grip temples.', price: 1599, category: 'Sunglasses', gender: 'Kids', frame_shape: 'Aviator', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80']), stock: 30 },
  { name: 'Neon Sports Wrap', description: 'Highly aerodynamic wrap-around sports sunglasses with mirror-coated polarized shield lenses. Offers complete dust and wind protection for cycling and running.', price: 3200, category: 'Sunglasses', gender: 'Unisex', frame_shape: 'Oval', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80']), stock: 22 },
  { name: 'Gold Rimless Aviator Classic', description: 'Sleek rimless aviator eyeglasses with 18k gold-plated bridge and temple tips. Features premium anti-reflective blue light protection lenses.', price: 5200, category: 'Eyeglasses', gender: 'Unisex', frame_shape: 'Aviator', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80']), stock: 25 },
  { name: 'Tortoise Vintage Wayfarer', description: 'Vintage-inspired chunky wayfarer sunglasses in rich dark tortoise shell acetate. Outfitted with G-15 classic green polarized lenses.', price: 4500, category: 'Sunglasses', gender: 'Men', frame_shape: 'Wayfarer', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80']), stock: 40 },
  { name: 'Hexa Titanium Gold', description: 'Ultra-thin hexagonal gold wireframe spectacles made of lightweight memory titanium. Elegant geometric silhouette designed for modern style.', price: 4800, category: 'Eyeglasses', gender: 'Women', frame_shape: 'Round', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80']), stock: 18 },
  { name: 'Midnight Sleek Cat-Eye', description: 'Glossy hand-polished black acetate cat-eye sunglasses with dark grey polarized lenses. Offers maximum UV400 sun protection.', price: 4900, category: 'Sunglasses', gender: 'Women', frame_shape: 'Cat-Eye', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80']), stock: 35 },
  { name: 'Sterling Rimless Oval', description: 'Premium minimalist oval eyeglasses featuring sterling silver polished wire temples and adjustable silicone nose pads for all-day comfort.', price: 4300, category: 'Eyeglasses', gender: 'Men', frame_shape: 'Oval', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80']), stock: 20 },
  { name: 'Kids Hero Square Blue-blocker', description: 'Ergonomic, flexible square glasses for kids in bright navy blue. Keeps eyes protected during tablet screen play and desktop studies.', price: 1750, category: 'Eyeglasses', gender: 'Kids', frame_shape: 'Square', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80']), stock: 55 },
];

const faceMappings = [
  { face_shape: 'round',   recommended_frame_shapes: JSON.stringify(['Square','Rectangle','Wayfarer']) },
  { face_shape: 'oval',    recommended_frame_shapes: JSON.stringify(['Rectangle','Square','Wayfarer','Aviator','Cat-Eye']) },
  { face_shape: 'square',  recommended_frame_shapes: JSON.stringify(['Round','Oval','Aviator']) },
  { face_shape: 'heart',   recommended_frame_shapes: JSON.stringify(['Round','Cat-Eye','Aviator','Wayfarer']) },
  { face_shape: 'diamond', recommended_frame_shapes: JSON.stringify(['Round','Oval','Cat-Eye']) },
];

const settings = [
  { key: 'hero_title',    value: 'Engineered for Style & Clarity' },
  { key: 'hero_subtitle', value: 'Designed with hand-polished premium materials and engineered for visual clarity. We believe in high-fashion, high-function eyewear without the luxury markup.' },
  { key: 'hero_image',    value: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80' },
  { key: 'trending_title',value: 'Trending Frames' },
];

// Admin user — password is 'admin123' (bcrypt hash)
const adminUser = {
  name: 'Specs Admin',
  email: 'admin@specs.com',
  password_hash: '$2a$10$q2mJiCxdZCYfid9VXL3ro.76LVkCLNhjNMq5awBcavpMt7ja45X1S',
  face_shape: null,
};

module.exports = async function seed(query) {
  // Products — skip if any already exist
  const existing = await query('SELECT COUNT(*) as cnt FROM products');
  if (!existing.rows[0] || existing.rows[0].cnt === 0) {
    for (const p of products) {
      await query(
        `INSERT OR IGNORE INTO products (name, description, price, category, gender, frame_shape, image_urls, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.description, p.price, p.category, p.gender, p.frame_shape, p.image_urls, p.stock]
      );
    }
    console.log(`Seeded ${products.length} products.`);
  }

  // Face mappings
  for (const m of faceMappings) {
    await query(
      `INSERT OR IGNORE INTO frame_shape_mapping (face_shape, recommended_frame_shapes) VALUES (?, ?)`,
      [m.face_shape, m.recommended_frame_shapes]
    );
  }

  // CMS settings
  for (const s of settings) {
    await query(
      `INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)`,
      [s.key, s.value]
    );
  }

  // Admin user
  await query(
    `INSERT OR IGNORE INTO users (name, email, password_hash, face_shape) VALUES (?, ?, ?, ?)`,
    [adminUser.name, adminUser.email, adminUser.password_hash, adminUser.face_shape]
  );
};
