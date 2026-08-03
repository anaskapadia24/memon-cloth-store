const Product = require('../models/Product');
const Category = require('../models/Category');
const Setting = require('../models/Setting');

const defaultCategories = [
  { id: 'school-uniforms', name: 'School Uniforms' },
  { id: 'womens-wear', name: "Women's Wear" },
  { id: 'kids-wear', name: 'Kids Wear' },
  { id: 'fabrics', name: 'Fabrics & Materials' },
  { id: 'new-arrivals', name: 'New Arrivals' }
];

const defaultProducts = [
  { name:"Classic School Uniform Set", cat:"school-uniforms", price:599, desc:"Durable cotton blend school uniform with shirt and pants. Perfect for daily wear.", img:"https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&q=80", badge:"Bestseller" },
  { name:"Girls School Uniform Dress", cat:"school-uniforms", price:549, desc:"Comfortable and stylish school dress for girls. Easy to maintain fabric.", img:"https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&q=80", badge:"" },
  { name:"Premium Cotton Shirt Fabric", cat:"fabrics", price:299, desc:"High-quality cotton fabric per meter. Available in multiple colors and patterns.", img:"https://images.unsplash.com/photo-1558171813-4c088753af8f?w=500&q=80", badge:"" },
  { name:"Women's Kurta Set", cat:"womens-wear", price:899, desc:"Elegant cotton kurta with palazzo. Perfect for casual and festive occasions.", img:"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80", badge:"New" },
  { name:"Kids Party Wear Frock", cat:"kids-wear", price:699, desc:"Beautiful party wear frock for girls aged 3-10. Soft and comfortable fabric.", img:"https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&q=80", badge:"Popular" },
  { name:"Silk Blend Saree Material", cat:"fabrics", price:1299, desc:"Premium silk blend saree material with rich texture and beautiful drape.", img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80", badge:"Premium" },
  { name:"Boys School Blazer", cat:"school-uniforms", price:1199, desc:"Formal school blazer with school emblem option. Warm and comfortable.", img:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80", badge:"" },
  { name:"Women's Dupatta Collection", cat:"womens-wear", price:399, desc:"Beautiful printed dupattas in various designs. Lightweight and elegant.", img:"https://images.unsplash.com/photo-1594761051656-153faee00291?w=500&q=80", badge:"New" },
  { name:"Kids Cotton T-Shirt Pack", cat:"kids-wear", price:449, desc:"Pack of 3 soft cotton t-shirts for kids. Colorful and comfortable for daily wear.", img:"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80", badge:"Value Pack" },
  { name:"Embroidered Fabric Material", cat:"new-arrivals", price:799, desc:"Beautifully embroidered fabric material for special occasions. Limited stock.", img:"https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80", badge:"New Arrival" },
  { name:"Summer Cotton Dress Material", cat:"new-arrivals", price:599, desc:"Lightweight cotton dress material perfect for Mumbai summers. Breathable fabric.", img:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80", badge:"New Arrival" },
  { name:"School Sports Uniform", cat:"school-uniforms", price:499, desc:"Comfortable sports uniform for school. Moisture-wicking fabric for active days.", img:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80", badge:"" }
];

const defaultSettings = {
  storeName: 'MEMON CLOTH STORE',
  tagline: 'Quality Fabrics at Affordable Prices',
  address: 'Ghass Bazar Road, Near National Urdu Primary School, Kalyan West, Mumbai',
  phone: '+91 84528 03023',
  whatsapp: '918452803023'
};

async function seedData() {
  try {
    // Check if data already exists
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();

    if (productCount === 0) {
      await Product.insertMany(defaultProducts);
      console.log('Seeded default products');
    }

    if (categoryCount === 0) {
      await Category.insertMany(defaultCategories);
      console.log('Seeded default categories');
    }

    // Seed settings
    for (const [key, value] of Object.entries(defaultSettings)) {
      await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
    }
    console.log('Seeded default settings');

  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = seedData;
