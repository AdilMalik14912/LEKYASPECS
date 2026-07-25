/**
 * defaultSeedData.js — In-memory default store data fallback.
 * Guarantees that Products, Admins, Customers, Orders, and Filters ALWAYS
 * return rich data even if Turso DB connection is fresh or pending migration.
 */

const defaultProducts = [
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
    image_urls: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'],
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
    name: 'Aero Gold Polarized Aviators',
    description: 'The ultimate classic. 24k gold-plated double bridge metal aviators with premium green polarized lenses. Complete UV400 protection.',
    price: 6500,
    category: 'Sunglasses',
    gender: 'Unisex',
    frame_shape: 'Aviator',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    stock: 40,
    average_rating: 4.9,
    review_count: 31
  },
  {
    id: 6,
    name: 'Onyx Premium Polarized Wayfarer',
    description: 'Crafted from bio-based acetate with a dark matte finish and grey polarized impact-resistant lenses. Engineered for driving and outdoor sports.',
    price: 4800,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Wayfarer',
    image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80','https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 35,
    average_rating: 4.8,
    review_count: 15
  },
  {
    id: 7,
    name: 'Champagne Glass Square',
    description: 'Warm champagne-hued semi-transparent frames with gradient brown lenses. Provides a sunny, glamorous retro aesthetic for beach trips.',
    price: 4600,
    category: 'Sunglasses',
    gender: 'Women',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'],
    stock: 20,
    average_rating: 4.6,
    review_count: 8
  },
  {
    id: 8,
    name: 'Vintage Clubmaster Classic',
    description: 'Iconic browline sunglasses with black top-acetate rims and gold-tinted bottom metal rims. Features polarized G-15 classic green lenses.',
    price: 5200,
    category: 'Sunglasses',
    gender: 'Men',
    frame_shape: 'Square',
    image_urls: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=600&q=80'],
    stock: 18,
    average_rating: 4.9,
    review_count: 22
  }
];

const defaultCustomers = [
  { id: 1, name: 'Adil Malik', email: 'dev.parceluncle@gmail.com', phone: '+91 9876543210', role: 'admin', face_shape: 'oval', created_at: '2026-07-20T10:00:00Z' },
  { id: 2, name: 'Rohan Sharma', email: 'rohan.sharma@example.com', phone: '+91 9123456789', role: 'user', face_shape: 'round', created_at: '2026-07-21T11:30:00Z' },
  { id: 3, name: 'Priya Verma', email: 'priya.verma@example.com', phone: '+91 9811223344', role: 'user', face_shape: 'square', created_at: '2026-07-22T14:15:00Z' },
  { id: 4, name: 'Ananya Gupta', email: 'ananya.gupta@example.com', phone: '+91 9988776655', role: 'user', face_shape: 'heart', created_at: '2026-07-23T09:45:00Z' }
];

const defaultAdmins = [
  { id: 1, name: 'Specs Admin', email: 'dev.parceluncle@gmail.com', role: 'admin', created_at: '2026-07-20T10:00:00Z' },
  { id: 2, name: 'Super Admin', email: 'admin@specs.com', role: 'admin', created_at: '2026-07-20T10:00:00Z' }
];

const defaultOrders = [
  {
    id: 1001,
    user_name: 'Adil Malik',
    user_email: 'dev.parceluncle@gmail.com',
    total_amount: 8398,
    status: 'Paid',
    payment_method: 'UPI Online',
    parcel_uncle_waybill: 'PU-98214-DEL',
    parcel_uncle_status: 'DISPATCHED',
    created_at: '2026-07-24T12:00:00Z',
    items: [
      { product_name: 'Onyx Matte Rectangle', quantity: 1, price: 3499 },
      { product_name: 'Onyx Premium Polarized Wayfarer', quantity: 1, price: 4800 }
    ]
  },
  {
    id: 1002,
    user_name: 'Rohan Sharma',
    user_email: 'rohan.sharma@example.com',
    total_amount: 4999,
    status: 'Pending',
    payment_method: 'COD',
    parcel_uncle_waybill: null,
    parcel_uncle_status: null,
    created_at: '2026-07-25T08:30:00Z',
    items: [
      { product_name: 'Rose Gold Stella Round', quantity: 1, price: 4999 }
    ]
  }
];

module.exports = {
  defaultProducts,
  defaultCustomers,
  defaultAdmins,
  defaultOrders
};
