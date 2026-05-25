import { connectDB } from './mongodb';
import Product from './models/Product';
import Customer from './models/Customer';
import Order from './models/Order';
import Inventory from './models/Inventory';
import { generateOrderNumber } from './utils';

const ZIPPER_IMAGES = [
  'https://zipper.com.ua/image/cache/catalog/products/z001-800x800.jpg',
  'https://zipper.com.ua/image/cache/catalog/products/z002-800x800.jpg',
];

const products = [
  {
    name: 'Блискавка спіральна No5 чорна',
    slug: 'bliskavka-spiralna-5-chorna',
    category: 'Застібки-блискавки',
    subcategory: 'Спіральні',
    description: 'Якісна спіральна блискавка No5. Підходить для одягу, сумок та взуття.',
    tags: ['блискавка', 'спіральна', 'No5'],
    variants: [
      { color: 'Чорний', colorHex: '#1a1a1a', article: 'ZS5-BLK-001', images: ['/images/z1.jpg'], price: 45, comparePrice: 60 },
      { color: 'Білий', colorHex: '#ffffff', article: 'ZS5-WHT-001', images: ['/images/z2.jpg'], price: 45, comparePrice: 60 },
      { color: 'Синій', colorHex: '#1e40af', article: 'ZS5-BLU-001', images: ['/images/z3.jpg'], price: 48, comparePrice: 65 },
      { color: 'Червоний', colorHex: '#dc2626', article: 'ZS5-RED-001', images: ['/images/z4.jpg'], price: 48 },
    ],
    isActive: true, isFeatured: true, isTopSale: true, topSaleBadge: 'Хіт продажів',
  },
  {
    name: 'Блискавка металева No8 золото',
    slug: 'bliskavka-metaleva-8-zoloto',
    category: 'Застібки-блискавки',
    subcategory: 'Металеві',
    description: 'Преміальна металева блискавка No8 у золотому кольорі.',
    tags: ['блискавка', 'металева', 'No8', 'золото'],
    variants: [
      { color: 'Золото', colorHex: '#d4a017', article: 'ZM8-GLD-001', images: ['/images/zm1.jpg'], price: 120, comparePrice: 150 },
      { color: 'Срібло', colorHex: '#9ca3af', article: 'ZM8-SLV-001', images: ['/images/zm2.jpg'], price: 115 },
      { color: 'Антична латунь', colorHex: '#78716c', article: 'ZM8-ABR-001', images: ['/images/zm3.jpg'], price: 130 },
    ],
    isActive: true, isFeatured: true, isTopSale: true, topSaleBadge: 'Топ',
  },
  {
    name: 'Тасьма для блискавок рулонна 200м',
    slug: 'tasma-dlya-bliskavok-rulonna',
    category: 'Тасьма',
    description: 'Рулонна тасьма для спіральних блискавок, 200 метрів.',
    tags: ['тасьма', 'рулонна', 'спіральна'],
    variants: [
      { color: 'Чорний', colorHex: '#1a1a1a', article: 'TR-BLK-200', images: [], price: 980 },
      { color: 'Білий', colorHex: '#f9fafb', article: 'TR-WHT-200', images: [], price: 980 },
      { color: 'Бежевий', colorHex: '#d6c5a0', article: 'TR-BEI-200', images: [], price: 1050 },
    ],
    isActive: true, isFeatured: false, isTopSale: false,
  },
  {
    name: 'Бігунець металевий No5 авто',
    slug: 'bigunets-metalevyi-5-avto',
    category: 'Фурнітура',
    subcategory: 'Бігунці',
    description: 'Автоматичний металевий бігунець No5 з фіксатором.',
    tags: ['бігунець', 'металевий', 'автомат'],
    variants: [
      { color: 'Нікель', colorHex: '#d1d5db', article: 'BM5-NIK-001', images: [], price: 18 },
      { color: 'Золото', colorHex: '#d4a017', article: 'BM5-GLD-001', images: [], price: 22 },
      { color: 'Чорний нікель', colorHex: '#374151', article: 'BM5-BNK-001', images: [], price: 20 },
    ],
    isActive: true, isFeatured: false, isTopSale: true, topSaleBadge: 'Новинка',
  },
  {
    name: 'Блискавка пластикова No3 різнокольорова',
    slug: 'bliskavka-plastykova-3',
    category: 'Застібки-блискавки',
    subcategory: 'Пластикові',
    description: 'Легка пластикова блискавка No3 для легкого одягу.',
    tags: ['блискавка', 'пластикова', 'No3'],
    variants: [
      { color: 'Жовтий', colorHex: '#fbbf24', article: 'ZP3-YEL-001', images: [], price: 35 },
      { color: 'Зелений', colorHex: '#16a34a', article: 'ZP3-GRN-001', images: [], price: 35 },
      { color: 'Рожевий', colorHex: '#ec4899', article: 'ZP3-PNK-001', images: [], price: 35 },
      { color: 'Оранжевий', colorHex: '#f97316', article: 'ZP3-ORN-001', images: [], price: 35 },
    ],
    isActive: true, isFeatured: true, isTopSale: false,
  },
  {
    name: 'Кнопки металеві 15мм набір 100шт',
    slug: 'knopky-metalevi-15mm',
    category: 'Кнопки',
    description: 'Міцні металеві кнопки діаметром 15мм, набір 100 штук.',
    tags: ['кнопки', 'металеві', '15мм'],
    variants: [
      { color: 'Нікель', colorHex: '#d1d5db', article: 'KM15-NIK-100', images: [], price: 95 },
      { color: 'Золото', colorHex: '#d4a017', article: 'KM15-GLD-100', images: [], price: 105 },
      { color: 'Темно-бронза', colorHex: '#78350f', article: 'KM15-BRZ-100', images: [], price: 100 },
    ],
    isActive: true, isFeatured: false, isTopSale: false,
  },
  {
    name: 'Пряжка пластикова 25мм',
    slug: 'pryazhka-plastykova-25mm',
    category: 'Пряжки',
    description: 'Міцна пластикова пряжка для ременів та сумок.',
    tags: ['пряжка', 'пластикова', '25мм'],
    variants: [
      { color: 'Чорний', colorHex: '#1a1a1a', article: 'PP25-BLK-001', images: [], price: 12 },
      { color: 'Бежевий', colorHex: '#d6c5a0', article: 'PP25-BEI-001', images: [], price: 12 },
    ],
    isActive: true, isFeatured: false, isTopSale: false,
  },
  {
    name: 'Нитки поліестер 40/2 набір 10 котушок',
    slug: 'nytky-poliestr-40-2-nabit',
    category: 'Нитки',
    description: 'Міцні поліестерні нитки для швейних машин, набір 10 котушок.',
    tags: ['нитки', 'поліестер', 'котушки'],
    variants: [
      { color: 'Асорті (базові)', colorHex: '#6b7280', article: 'NP40-ASS-010', images: [], price: 320 },
      { color: 'Чорно-білі', colorHex: '#1a1a1a', article: 'NP40-BW-010', images: [], price: 290 },
    ],
    isActive: true, isFeatured: true, isTopSale: false,
  },
];

const customers = [
  { name: 'Тетяна Мельник', email: 'tetyana@example.com', phone: '+380671234567', city: 'Київ', totalOrders: 5, totalSpent: 2340 },
  { name: 'Олег Коваль', email: 'oleg@example.com', phone: '+380502345678', city: 'Харків', totalOrders: 3, totalSpent: 1120 },
  { name: 'Наталія Бойко', email: 'natalia@example.com', phone: '+380663456789', city: 'Львів', totalOrders: 8, totalSpent: 4560 },
  { name: 'Михайло Сидоренко', email: 'mykhailo@example.com', phone: '+380734567890', city: 'Дніпро', totalOrders: 2, totalSpent: 780 },
  { name: 'Ірина Петренко', email: 'iryna@example.com', phone: '+380955678901', city: 'Одеса', totalOrders: 12, totalSpent: 8900 },
  { name: 'Андрій Шевченко', email: 'andriy@example.com', phone: '+380676789012', city: 'Запоріжжя', totalOrders: 1, totalSpent: 345 },
  { name: 'Людмила Кравченко', email: 'ludmyla@example.com', phone: '+380507890123', city: 'Вінниця', totalOrders: 6, totalSpent: 3200 },
  { name: 'Василь Гриценко', email: 'vasyl@example.com', phone: '+380668901234', city: 'Полтава', totalOrders: 4, totalSpent: 1890 },
];

export async function seedDatabase() {
  await connectDB();

  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    return { message: 'Database already seeded' };
  }

  // Insert products
  const insertedProducts = await Product.insertMany(products);

  // Insert customers
  await Customer.insertMany(customers);

  // Create inventory entries
  const inventoryItems = [];
  for (const product of insertedProducts) {
    for (const variant of product.variants) {
      inventoryItems.push({
        productId: product._id.toString(),
        productName: product.name,
        variantArticle: variant.article,
        variantColor: variant.color,
        warehouse: 'warehouse1',
        quantity: Math.floor(Math.random() * 50) + 10,
        reservedQuantity: Math.floor(Math.random() * 5),
        minQuantity: 5,
      });
      inventoryItems.push({
        productId: product._id.toString(),
        productName: product.name,
        variantArticle: variant.article,
        variantColor: variant.color,
        warehouse: 'warehouse2',
        quantity: Math.floor(Math.random() * 30) + 5,
        reservedQuantity: Math.floor(Math.random() * 3),
        minQuantity: 3,
      });
    }
  }
  await Inventory.insertMany(inventoryItems);

  // Create sample orders
  const statuses = ['new', 'processing', 'shipped', 'delivered', 'paid'] as const;
  const orders = [];
  const customerList = await Customer.find();
  const productList = await Product.find();

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  for (let i = 0; i < 30; i++) {
    const customer = customerList[Math.floor(Math.random() * customerList.length)];
    const product = productList[Math.floor(Math.random() * productList.length)];
    const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
    const qty = Math.floor(Math.random() * 5) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    orders.push({
      orderNumber: generateOrderNumber() + `-${i}`,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        city: customer.city || '',
        address: 'вул. Шевченка, 10',
      },
      items: [{
        productId: product._id.toString(),
        productName: product.name,
        variantArticle: variant.article,
        variantColor: variant.color,
        image: variant.images[0] || '',
        price: variant.price,
        quantity: qty,
      }],
      totalAmount: variant.price * qty,
      status,
      warehouse: Math.random() > 0.5 ? 'warehouse1' : 'warehouse2',
      ttn: status !== 'new' ? `59000${Math.floor(Math.random() * 9000000 + 1000000)}` : undefined,
      source: Math.random() > 0.3 ? 'store' : 'manual',
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    });
  }

  await Order.insertMany(orders);

  return { message: 'Database seeded successfully' };
}
