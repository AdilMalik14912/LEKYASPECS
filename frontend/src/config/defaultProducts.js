// Default products catalog fallback for frontend
const defaultCatalog = [
  {
    id: 1,
    name: 'Onyx Matte Rectangle',
    description: 'Engineered with ultra-light matte acetate, these classic black rectangular frames offer a sophisticated look for daily office and digital screen usage.',
    price: 3499,
    category: 'Eyeglasses',
    gender: 'Men',
    frame_shape: 'Rectangle',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 45,
    average_rating: 4.8,
    review_count: 12
  },
  {
    id: 2,
    name: 'Rose Gold Stella Round',
    description: 'Beautifully crafted round wireframes made from premium titanium, finished with an elegant rose gold polish. Light as a feather and extremely durable.',
    price: 4999,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 30,
    average_rating: 4.9,
    review_count: 18
  },
  {
    id: 3,
    name: 'Tortoise Shell Chelsea Cat-Eye',
    description: 'Make a bold style statement with these hand-polished acetate cat-eye frames in vintage tortoise shell pattern. Ideal for styling up any outfit.',
    price: 3899,
    category: 'Eyeglasses',
    gender: 'Women',
    frame_shape: 'Cat-Eye',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
    stock: 25,
    average_rating: 4.7,
    review_count: 9
  },
  {
    id: 4,
    name: 'Clear Crystal Wayfarer',
    description: 'A modern twist on a classic shape. These crystal-clear acetate frames adapt to any face tone, featuring golden metal rivets for a touch of premium luxury.',
    price: 4200,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 50,
    average_rating: 5.0,
    review_count: 24
  },
  {
    id: 5,
    name: 'Titanium Rimless Oval',
    description: 'Ultra-minimalist frameless glasses engineered from aerospace-grade Japanese titanium. Weighs less than 10 grams.',
    price: 5500,
    category: 'Eyeglasses',
    gender: 'Unisex',
    frame_shape: 'Oval',
    image_urls: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    stock: 20,
    average_rating: 4.9,
    review_count: 15
  },
  {
    id: 6,
    name: 'Kids Flexi-Blue blocker',
    description: 'Impact-resistant flexible rubber frames designed specifically for children. Includes anti-blue light coating for online learning.',
    price: 1899,
    category: 'Eyeglasses',
    gender: 'Kids',
    frame_shape: 'Round',
    image_urls: ['https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'],
    stock: 40,
    average_rating: 4.6,
    review_count: 8
  },
  {
    id: 7,
    name: 'Aero Gold polarized Aviators',
    description: 'Classic pilot aviator sunglasses featuring 24k gold-plated metal rims and dark green polarized lenses with UV400 protection.',
    price: 6500,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 35,
    average_rating: 4.9,
    review_count: 31
  },
  {
    id: 8,
    name: 'Onyx Premium polarized Wayfarer',
    description: 'Bold black wayfarer sunglasses with HD polarized lenses to reduce road glare and enhance visual contrast while driving.',
    price: 4800,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 28,
    average_rating: 4.8,
    review_count: 22
  }
];

module.exports = defaultCatalog;
module.exports.default = defaultCatalog;
