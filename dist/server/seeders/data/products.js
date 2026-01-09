/**
 * Product catalog for demo order generation
 */
export const products = [
    // Furniture (30%)
    { name: "Coastal Sofa", category: "furniture", price: 899 },
    { name: "Modern Coffee Table", category: "furniture", price: 349 },
    { name: "Dining Chair Set (4)", category: "furniture", price: 599 },
    { name: "Velvet Accent Chair", category: "furniture", price: 449 },
    { name: "Console Table", category: "furniture", price: 399 },
    { name: "Bookshelf Unit", category: "furniture", price: 279 },
    { name: "TV Stand", category: "furniture", price: 329 },
    // Decor (40%)
    { name: "Ceramic Vase Set", category: "decor", price: 49 },
    { name: "Abstract Wall Art", category: "decor", price: 129 },
    { name: "Throw Pillow (Set of 2)", category: "decor", price: 39 },
    { name: "Modern Table Lamp", category: "decor", price: 89 },
    { name: "Decorative Mirror", category: "decor", price: 159 },
    { name: "Scented Candle Set", category: "decor", price: 35 },
    { name: "Marble Sculpture", category: "decor", price: 79 },
    { name: "Photo Frame Set", category: "decor", price: 45 },
    { name: "Decorative Tray", category: "decor", price: 29 },
    { name: "Wall Clock", category: "decor", price: 69 },
    // Textiles (20%)
    { name: "Luxury Throw Blanket", category: "textiles", price: 79 },
    { name: "Area Rug 5x7", category: "textiles", price: 299 },
    { name: "Curtain Panels (Set of 2)", category: "textiles", price: 69 },
    { name: "Bedding Set Queen", category: "textiles", price: 149 },
    { name: "Table Runner", category: "textiles", price: 35 },
    // Lighting (10%)
    { name: "Pendant Light Fixture", category: "lighting", price: 199 },
    { name: "Floor Lamp", category: "lighting", price: 179 },
    { name: "LED String Lights", category: "lighting", price: 29 },
    { name: "Desk Lamp", category: "lighting", price: 59 }
];
export function getRandomProducts(count = 2) {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
export function getProductsByCategory(category) {
    return products.filter(p => p.category === category);
}
