// Sample phone products matching backend schema structure
export const sampleProducts = [
    {
        product_id: 1,
        brand: "Samsung",
        model_name: "Galaxy S24 Ultra",
        description: "Latest flagship with ultra performance and stunning display",
        base_price: 1299.99,
        image_url: "https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=500&q=80",
        is_active: true
    },
    {
        product_id: 2,
        brand: "Apple",
        model_name: "iPhone 15 Pro Max",
        description: "Premium smartphone with titanium design and A17 Pro chip",
        base_price: 1199.99,
        image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80",
        is_active: true
    },
    {
        product_id: 3,
        brand: "Google",
        model_name: "Pixel 8 Pro",
        description: "Google's flagship with AI-powered camera and pure Android",
        base_price: 999.99,
        image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
        is_active: true
    },
    {
        product_id: 4,
        brand: "OnePlus",
        model_name: "OnePlus 12",
        description: "Fast charging flagship with Snapdragon 8 Gen 3",
        base_price: 899.99,
        image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80",
        is_active: true
    },
    {
        product_id: 5,
        brand: "Xiaomi",
        model_name: "Xiaomi 14 Ultra",
        description: "Photography powerhouse with Leica optics",
        base_price: 1099.99,
        image_url: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=500&q=80",
        is_active: true
    },
    {
        product_id: 6,
        brand: "Samsung",
        model_name: "Galaxy Z Fold 5",
        description: "Foldable innovation with multitasking capabilities",
        base_price: 1799.99,
        image_url: "https://images.unsplash.com/photo-1628815113969-0487917f0a36?w=500&q=80",
        is_active: true
    },
    {
        product_id: 7,
        brand: "Nothing",
        model_name: "Nothing Phone 2",
        description: "Unique design with Glyph interface and clean software",
        base_price: 699.99,
        image_url: "https://images.unsplash.com/photo-1592286927505-b6b07f8e80ec?w=500&q=80",
        is_active: true
    },
    {
        product_id: 8,
        brand: "OPPO",
        model_name: "Find X6 Pro",
        description: "Premium camera flagship with Hasselblad collaboration",
        base_price: 1049.99,
        image_url: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&q=80",
        is_active: true
    },
    {
        product_id: 9,
        brand: "Motorola",
        model_name: "Edge 40 Pro",
        description: "Curved display beauty with powerful performance",
        base_price: 799.99,
        image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
        is_active: true
    },
    {
        product_id: 10,
        brand: "Sony",
        model_name: "Xperia 1 V",
        description: "Professional creator's phone with 4K display",
        base_price: 1399.99,
        image_url: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&q=80",
        is_active: true
    },
    {
        product_id: 11,
        brand: "Realme",
        model_name: "GT 5",
        description: "Budget flagship killer with impressive specs",
        base_price: 599.99,
        image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
        is_active: true
    },
    {
        product_id: 12,
        brand: "ASUS",
        model_name: "ROG Phone 7",
        description: "Gaming beast with cooling system and triggers",
        base_price: 1099.99,
        image_url: "https://images.unsplash.com/photo-1603891131431-20f0ec0f2b4c?w=500&q=80",
        is_active: true
    }
];

// Sample variants for demo mode
export const sampleVariants = {
    1: [
        { variant_id: 1, product_id: 1, color: "Black", ram: "12GB", storage: "256GB", price: 1299.99, stock_qty: 10, sku_code: "SAM-S24U-BLK-256", image_url: "https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=500&q=80" },
        { variant_id: 2, product_id: 1, color: "Titanium Gray", ram: "12GB", storage: "512GB", price: 1399.99, stock_qty: 8, sku_code: "SAM-S24U-TGY-512", image_url: "https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=500&q=80" },
        { variant_id: 3, product_id: 1, color: "Violet", ram: "16GB", storage: "1TB", price: 1599.99, stock_qty: 5, sku_code: "SAM-S24U-VIO-1TB", image_url: "https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da9?w=500&q=80" }
    ],
    2: [
        { variant_id: 4, product_id: 2, color: "Natural Titanium", ram: "8GB", storage: "256GB", price: 1199.99, stock_qty: 12, sku_code: "APL-IP15PM-NTI-256", image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80" },
        { variant_id: 5, product_id: 2, color: "Blue Titanium", ram: "8GB", storage: "512GB", price: 1399.99, stock_qty: 10, sku_code: "APL-IP15PM-BTI-512", image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80" },
        { variant_id: 6, product_id: 2, color: "White Titanium", ram: "8GB", storage: "1TB", price: 1599.99, stock_qty: 6, sku_code: "APL-IP15PM-WTI-1TB", image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80" }
    ],
    3: [
        { variant_id: 7, product_id: 3, color: "Obsidian", ram: "12GB", storage: "128GB", price: 999.99, stock_qty: 15, sku_code: "GOO-P8P-OBS-128", image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80" },
        { variant_id: 8, product_id: 3, color: "Bay Blue", ram: "12GB", storage: "256GB", price: 1099.99, stock_qty: 12, sku_code: "GOO-P8P-BAY-256", image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80" },
        { variant_id: 9, product_id: 3, color: "Porcelain", ram: "12GB", storage: "512GB", price: 1199.99, stock_qty: 8, sku_code: "GOO-P8P-POR-512", image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80" }
    ]
};
