-- Specs Database Seed Data

-- 1. Populate Face-Shape mappings
INSERT INTO frame_shape_mapping (face_shape, recommended_frame_shapes) VALUES
('round', ARRAY['Square', 'Rectangle', 'Wayfarer']),
('oval', ARRAY['Rectangle', 'Square', 'Wayfarer', 'Aviator', 'Cat-Eye']),
('square', ARRAY['Round', 'Oval', 'Aviator']),
('heart', ARRAY['Round', 'Cat-Eye', 'Aviator', 'Wayfarer']),
('diamond', ARRAY['Round', 'Oval', 'Cat-Eye'])
ON CONFLICT (face_shape) DO UPDATE 
SET recommended_frame_shapes = EXCLUDED.recommended_frame_shapes;

-- 2. Populate Sample Products
INSERT INTO products (name, description, price, category, gender, frame_shape, image_urls, stock) VALUES
-- Eyeglasses
('Onyx Matte Rectangle', 'Engineered with ultra-light matte acetate, these classic black rectangular frames offer a sophisticated look for daily office and digital screen usage.', 3499.00, 'Eyeglasses', 'Men', 'Rectangle', ARRAY[
    'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'
], 45),

('Rose Gold Stella Round', 'Beautifully crafted round wireframes made from premium titanium, finished with an elegant rose gold polish. Light as a feather and extremely durable.', 4999.00, 'Eyeglasses', 'Women', 'Round', ARRAY[
    'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'
], 30),

('Tortoise Shell Chelsea Cat-Eye', 'Make a bold style statement with these hand-polished acetate cat-eye frames in vintage tortoise shell pattern. Ideal for styling up any outfit.', 3899.00, 'Eyeglasses', 'Women', 'Cat-Eye', ARRAY[
    'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'
], 25),

('Clear Crystal Wayfarer', 'A modern twist on a classic shape. These crystal-clear acetate frames adapt to any face tone, featuring golden metal rivets for a touch of premium luxury.', 4200.00, 'Eyeglasses', 'Unisex', 'Wayfarer', ARRAY[
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'
], 50),

('Titanium Rimless Oval', 'Minimalist, rimless design with oval lenses and gold plated temples. Perfect for those who prefer an invisible, weightless eyewear experience.', 5500.00, 'Eyeglasses', 'Unisex', 'Oval', ARRAY[
    'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'
], 15),

('Kids Flexi-Blue blocker', 'Indestructible, flexible silicon frames designed specifically for kids. Equipped with zero-power blue light protection lenses for online school classes.', 1899.00, 'Eyeglasses', 'Kids', 'Round', ARRAY[
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80'
], 60),

-- Sunglasses
('Aero Gold polarized Aviators', 'The ultimate classic. 24k gold-plated double bridge metal aviators with premium green polarized lenses. Complete UV400 protection.', 6500.00, 'Sunglasses', 'Unisex', 'Aviator', ARRAY[
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'
], 40),

('Onyx Premium polarized Wayfarer', 'Crafted from bio-based acetate with a dark matte finish and grey polarized impact-resistant lenses. Engineered for driving and outdoor sports.', 4800.00, 'Sunglasses', 'Men', 'Wayfarer', ARRAY[
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'
], 35),

('Champagne Glass Square', 'Warm champagne-hued semi-transparent frames with gradient brown lenses. Provides a sunny, glamorous retro aesthetic for beach trips.', 4600.00, 'Sunglasses', 'Women', 'Square', ARRAY[
    'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&w=600&q=80'
], 20),

('Vintage Clubmaster Classic', 'Iconic browline sunglasses with black top-acetate rims and gold-tinted bottom metal rims. Features polarized G-15 classic green lenses.', 5200.00, 'Sunglasses', 'Men', 'Square', ARRAY[
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=600&q=80'
], 18),

('Kids Aviator Junior', 'Retro aviator sunglasses downsized for children. Shatterproof polycarbonate lenses with UV protection and soft-grip temples.', 1599.00, 'Sunglasses', 'Kids', 'Aviator', ARRAY[
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80'
], 30),

('Neon Sports Wrap', 'Highly aerodynamic wrap-around sports sunglasses with mirror-coated polarized shield lenses. Offers complete dust and wind protection for cycling and running.', 3200.00, 'Sunglasses', 'Unisex', 'Oval', ARRAY[
    'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'
], 22),

('Gold Rimless Aviator Classic', 'Sleek rimless aviator eyeglasses with 18k gold-plated bridge and temple tips. Features premium anti-reflective blue light protection lenses.', 5200.00, 'Eyeglasses', 'Unisex', 'Aviator', ARRAY['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'], 25),
('Tortoise Vintage Wayfarer', 'Vintage-inspired chunky wayfarer sunglasses in rich dark tortoise shell acetate. Outfitted with G-15 classic green polarized lenses.', 4500.00, 'Sunglasses', 'Men', 'Wayfarer', ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'], 40),
('Hexa Titanium Gold', 'Ultra-thin hexagonal gold wireframe spectacles made of lightweight memory titanium. Elegant geometric silhouette designed for modern style.', 4800.00, 'Eyeglasses', 'Women', 'Round', ARRAY['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'], 18),
('Midnight Sleek Cat-Eye', 'Glossy hand-polished black acetate cat-eye sunglasses with dark grey polarized lenses. Offers maximum UV400 sun protection.', 4900.00, 'Sunglasses', 'Women', 'Cat-Eye', ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'], 35),
('Sterling Rimless Oval', 'Premium minimalist oval eyeglasses featuring sterling silver polished wire temples and adjustable silicone nose pads for all-day comfort.', 4300.00, 'Eyeglasses', 'Men', 'Oval', ARRAY['https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&q=80'], 20),
('Kids Hero Square Blue-blocker', 'Ergonomic, flexible square glasses for kids in bright navy blue. Keeps eyes protected during tablet screen play and desktop studies.', 1750.00, 'Eyeglasses', 'Kids', 'Square', ARRAY['https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80'], 55);

-- 3. Seed Default Admin User (Password is 'admin123' bcrypt-hashed)
-- bcryptjs hash for 'admin123': $2a$10$q2mJiCxdZCYfid9VXL3ro.76LVkCLNhjNMq5awBcavpMt7ja45X1S
-- Let's insert a default administrator account.
INSERT INTO users (name, email, password_hash, face_shape) VALUES
('Specs Admin', 'admin@specs.com', '$2a$10$q2mJiCxdZCYfid9VXL3ro.76LVkCLNhjNMq5awBcavpMt7ja45X1S', NULL)
ON CONFLICT (email) DO NOTHING;

-- 4. Seed default CMS Settings
INSERT INTO store_settings (key, value) VALUES
('hero_title', 'Engineered for Style & Clarity'),
('hero_subtitle', 'Designed with hand-polished premium materials and engineered for visual clarity. We believe in high-fashion, high-function eyewear without the luxury markup.'),
('hero_image', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80'),
('trending_title', 'Trending Frames')
ON CONFLICT (key) DO NOTHING;
