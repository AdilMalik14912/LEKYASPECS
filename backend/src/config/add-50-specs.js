const { Client } = require('pg');
require('dotenv').config({ path: 'C:/Users/Admin/Specs/backend/.env' });

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres'
});

const products = [
  {
    name: 'Aerodynamic Carbon Aviator',
    description: 'Ultralight aerospace carbon fiber aviators with matte charcoal finishing and smoke grey polarized sun lenses.',
    price: 5900.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 25
  },
  {
    name: 'Chelsea Velvet Cat-Eye',
    description: 'Deep burgundy velvet-finish hand-polished acetate cat-eye eyeglasses, perfect for a chic and structured daily look.',
    price: 3600.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 30
  },
  {
    name: 'Novello Classic Wayfarer',
    description: 'Dark walnut wood-grain textured Wayfarer optical spectacles with anti-blue ray computer glass shielding.',
    price: 4200.00,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 40
  },
  {
    name: 'Vapour Rimless Round',
    description: 'Ultra-minimalist frame-free round glasses with thin silver titanium temples and weightless nose bridges.',
    price: 4900.00,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 15
  },
  {
    name: 'Amber Retro Square',
    description: 'Chunky tortoiseshell square sunglasses with warm amber gradient sun lenses, styled for an iconic retro beach vibe.',
    price: 3800.00,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=600&q=80'],
    stock: 20
  },
  {
    name: 'Ocean Mirror Sports',
    description: 'Impact-resistant aerodynamic wrap-around sports sunglasses with blue mirror coating and dust seals.',
    price: 3100.00,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 22
  },
  {
    name: 'Urban Matte Rectangle',
    description: 'Full-rim matte navy rectangular spectacles with scratch-resistant digital screen protective filters.',
    price: 2900.00,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Rectangle',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 45
  },
  {
    name: 'Rosewood Oval Classic',
    description: 'Hand-finished rosewood acetate oval wireframes with anti-glare lenses and flexible spring hinges.',
    price: 3900.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80'],
    stock: 28
  },
  {
    name: 'Junior Candy Pink Round',
    description: 'Bendable kids specs in bright candy pink silicone frame. Safe blue-light block lens for virtual classrooms.',
    price: 1699.00,
    category: 'Eyeglasses',
    gender: 'Kids',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80'],
    stock: 50
  },
  {
    name: 'Aero Blackout Aviator',
    description: 'Military-grade matte black steel frame aviator sunglasses with dark polarized scratch-proof safety glasses.',
    price: 5400.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 35
  },
  {
    name: 'Opal Crystal Square',
    description: 'Clear crystal square spectacles for ladies. Lightweight frames with gold interior reinforcing wire cores.',
    price: 3700.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 18
  },
  {
    name: 'Nomad Gold Wayfarer',
    description: 'Classic wayfarer spectacles with 14k gold-plated temple joints and polished clear transparent acetate frame.',
    price: 4600.00,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 30
  },
  {
    name: 'Phoebe Round Wireframe',
    description: 'Ultra-chic geometric round eyeglasses in brushed bronze coating, matching well with narrow and oval faces.',
    price: 4100.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 25
  },
  {
    name: 'Safari Polarized Oval',
    description: 'Desert sand-tinted frame sunglasses with deep olive polarized lens, offering full UV400 sun blocking.',
    price: 4800.00,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 19
  },
  {
    name: 'Phoenix Red Cat-Eye',
    description: 'Vibrant cherry red semi-transparent cat-eye sunglasses. Gives a bold high-fashion styling edge.',
    price: 3999.00,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 24
  },
  {
    name: 'Stealth Matte Rectangle',
    description: 'Sleek matte black polycarbonate reading glasses for men. Durable hinges with comfortable nose support.',
    price: 2499.00,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Rectangle',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 40
  },
  {
    name: 'Starlight Gold Round',
    description: 'Delicate gold-plated round wireframe spectacles with star engraving details on the metallic temple legs.',
    price: 6800.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80'],
    stock: 12
  },
  {
    name: 'Pacific Blue Wayfarer',
    description: 'Navy blue transparent wayfarer sunglasses, complete with silver mirror polarized anti-scratch lenses.',
    price: 3990.00,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 33
  },
  {
    name: 'Luna Silver Cat-Eye',
    description: 'Sleek polished sterling silver wireframe cat-eye spectacles. High-end accessory with adjustable nose pieces.',
    price: 5200.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 16
  },
  {
    name: 'Atlas Thick Square',
    description: 'Heavy-set chunky square optical glasses in premium black acetate. Gives a sharp bold aesthetic.',
    price: 3500.00,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 22
  },
  {
    name: 'Sunset Gold Aviator',
    description: '18k rose gold-plated aviator sunglasses featuring yellow-to-orange gradient polarized sunset lenses.',
    price: 6300.00,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 27
  },
  {
    name: 'Tuscany Tortoise Round',
    description: 'Classy round computer glasses in hand-crafted honey tortoise shell pattern. High-quality spring hinge structures.',
    price: 4300.00,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 35
  },
  {
    name: 'Shadow Black Oval',
    description: 'Retro oval sunglasses with dark polarized G-15 sun shielding, designed for comfortable driving visibility.',
    price: 4500.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 14
  },
  {
    name: 'Metro Crystal Rectangle',
    description: 'Translucent grey acetate rectangular specs. Clean professional look with blue light blocking lenses.',
    price: 3100.00,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Rectangle',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 29
  },
  {
    name: 'Pixie Kids Lilac Round',
    description: 'Flexible soft lilac color kids specs. Completely metal-free structures for safe playing.',
    price: 1800.00,
    category: 'Eyeglasses',
    gender: 'Kids',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80'],
    stock: 42
  },
  {
    name: 'Breeze Pink Cat-Eye',
    description: 'Blush pink clear frame cat-eye sunglasses with soft rose gold polarized protective gradient lenses.',
    price: 3200.00,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 25
  },
  {
    name: 'Clubmaster Vintage Bronze',
    description: 'Classic semi-rimless browline optical glasses with deep bronze metal rims and wood finish temple legs.',
    price: 4999.00,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 18
  },
  {
    name: 'Aero Silver polarized Aviators',
    description: 'Polished silver titanium aviators with premium grey polarized anti-reflective sun protection glass.',
    price: 5800.00,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 31
  },
  {
    name: 'Zen Minimalist Round',
    description: 'Rimless black titanium circular spectacles. Barely-there look with extreme frame flex durability.',
    price: 5500.00,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 21
  },
  {
    name: 'Driftwood Wayfarer',
    description: 'Eco-friendly wayfarer sunglasses made from natural driftwood fibers, with dark charcoal polarized lenses.',
    price: 4100.00,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 36
  },
  {
    name: 'Chrono Sports Shield',
    description: 'High-performance wrap-around shield sports sunglasses. Shatterproof polarized lens for cycling and running.',
    price: 3400.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 19
  },
  {
    name: 'Marina Blue Oval',
    description: 'Pastel blue oval spectacles with protective anti-blue light coating. Ideal for digital workers.',
    price: 2800.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80'],
    stock: 23
  },
  {
    name: 'Vogue Gold Hexagon',
    description: 'Delicate gold hexagonal wireframe eyeglasses. Modern design with lightweight metal materials.',
    price: 4700.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 17
  },
  {
    name: 'Cosmo Glitter Cat-Eye',
    description: 'Dazzling navy blue glitter cat-eye spectacles. High-gloss fashion statement with flex temples.',
    price: 3900.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 14
  },
  {
    name: 'Alpine Polarized Rectangle',
    description: 'Sporty rectangular wrap sunglasses with heavy frame build, polarized grey lenses, and UV400 shield.',
    price: 2990.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Rectangle',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 38
  },
  {
    name: 'Junior Sky Blue Square',
    description: 'Durable, bendy blue square glasses for school-going kids. Scratch-resistant blue cut computer safety glasses.',
    price: 1599.00,
    category: 'Eyeglasses',
    gender: 'Kids',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80'],
    stock: 55
  },
  {
    name: 'Desert Sand Wayfarer',
    description: 'Warm beige wayfarer sunglasses with gradient brown polarized sun blocking, matching outdoor trips.',
    price: 3600.00,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=600&q=80'],
    stock: 22
  },
  {
    name: 'Executive Rimless Rectangle',
    description: 'Corporate style rimless silver rectangular optical spectacles. Professional style with high indexing lenses.',
    price: 5999.00,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Rectangle',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 11
  },
  {
    name: 'Retro Lemon Round',
    description: 'Classic yellow tinted translucent round sunglasses. Ideal for summer styling, beach trips, and fun.',
    price: 2900.00,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 30
  },
  {
    name: 'Monarch Gold Cat-Eye',
    description: 'Luxury thick-rimmed gold browline cat-eye sunglasses with dark amber polarized UV protective glasses.',
    price: 6500.00,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 20
  },
  {
    name: 'Nomad Tortoise Oval',
    description: 'Medium-fit oval sunglasses in hand-polished dark honey tortoise shell. Premium polarized sun lenses.',
    price: 4400.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 26
  },
  {
    name: 'Hologram Clear Square',
    description: 'Clear translucent square specs. Modern futuristic shape with blue cut digital filters.',
    price: 3750.00,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 45
  },
  {
    name: 'Kids Turbo Orange Shield',
    description: 'Highly flexible, kids wrap sunglasses in neon orange frame. Shatterproof safety lenses with full UV protection.',
    price: 1499.00,
    category: 'Sunglasses',
    gender: 'Kids',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80'],
    stock: 60
  },
  {
    name: 'Soho Sleek Rectangle',
    description: 'Slim profile black metal rectangular specs for men. Sturdy stainless steel build with anti-glare glasses.',
    price: 3200.00,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Rectangle',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 42
  },
  {
    name: 'Siren Red polarized Wayfarer',
    description: 'Glossy cherry red acetate wayfarer sunglasses with dark smoke grey polarized safety sun lenses.',
    price: 4800.00,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 25
  },
  {
    name: 'Capri Gold Round',
    description: 'Ultra-thin gold wireframes with crystal acetate temple tips. Delicate round shape for clean aesthetics.',
    price: 4900.00,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 18
  },
  {
    name: 'Goliath Oversized Square',
    description: 'Extra wide chunky black square sunglasses for men, fitted with impact-resistant dark sun glass.',
    price: 4200.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 35
  },
  {
    name: 'Iris Lavender Cat-Eye',
    description: 'Elegant lavender tinted cat-eye spectacles. Feminine wireframe structure with spring flex temples.',
    price: 3500.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 21
  },
  {
    name: 'Cruiser polarized Aviator',
    description: 'Gunmetal steel frame aviator sunglasses with silver mirror polarized lenses. Sturdy double nose bridge.',
    price: 5600.00,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 30
  },
  {
    name: 'Aero Rose Gold Aviator',
    description: 'Feminine polished rose gold aviator spectacles, fitted with blue-cut zero-power computer glasses.',
    price: 5100.00,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80'],
    stock: 22
  }
];

async function seed() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL for seeding 50 products...');
    
    // Clear any products seeded with similar names previously to prevent duplication
    const names = products.map(p => p.name);
    await client.query('DELETE FROM products WHERE name = ANY($1)', [names]);
    console.log('Cleaned up existing duplicate seeder entries.');

    for (const prod of products) {
      await client.query(
        `INSERT INTO products (name, description, price, category, gender, frame_shape, image_urls, stock) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          prod.name,
          prod.description,
          prod.price,
          prod.category,
          prod.gender,
          prod.frame_shape,
          prod.image_urls,
          prod.stock
        ]
      );
    }
    
    console.log('Seeded 50 premium eyewears successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

seed();
