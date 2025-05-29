import Product from "./models/productModel";
import { ProductType } from "./types/interface/IProduct";
import { ProductEvent } from "./types/kafkaType";
import MessageBroker from "./utils/messageBroker";

type Product = Pick<
  ProductType,
  "name" | "description" | "price" | "stock" | "img" | "category" | "categorySlug" | "sold"
>;

function toSlug(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}

const categoryData = [
  {
    category: "Điện thoại",
    names: ["iPhone 14 Pro", "Samsung Galaxy S23", "Xiaomi Mi 13", "Oppo Reno 10", "Realme GT Neo"],
    description: () =>
      "Chiếc điện thoại thông minh với hiệu năng vượt trội, thiết kế tinh tế, hỗ trợ 5G và camera siêu nét cho trải nghiệm vượt mong đợi.",
  },
  {
    category: "Tai nghe",
    names: ["Sony WH-1000XM5", "AirPods Pro 2", "JBL Tune 760NC", "SoundPeats Mini", "Anker Soundcore Q30"],
    description: () =>
      "Tai nghe chất lượng cao với khả năng chống ồn chủ động, âm thanh trong trẻo và thời lượng pin ấn tượng cho trải nghiệm âm nhạc tuyệt vời.",
  },
  {
    category: "Laptop",
    names: ["MacBook Pro M2", "Dell XPS 15", "HP Spectre x360", "Asus ROG Strix", "Lenovo ThinkPad X1"],
    description: () =>
      "Laptop hiệu năng mạnh mẽ, thiết kế sang trọng, phù hợp cho công việc, học tập và giải trí với thời lượng pin bền bỉ.",
  },
  {
    category: "Chuột",
    names: ["Logitech MX Master 3", "Razer DeathAdder V2", "Corsair Harpoon", "SteelSeries Rival 3", "Asus ROG Gladius"],
    description: () =>
      "Chuột máy tính độ chính xác cao, thiết kế công thái học giúp thao tác thoải mái cả ngày, phù hợp cho cả làm việc và chơi game.",
  },
  {
    category: "Bàn phím",
    names: ["Keychron K6", "Logitech G Pro X", "Akko 3068B", "Razer BlackWidow V3", "Ducky One 2 Mini"],
    description: () =>
      "Bàn phím cơ chất lượng cao, phản hồi nhạy bén, đèn nền RGB nổi bật và thiết kế nhỏ gọn dành cho game thủ và dân văn phòng.",
  },
];

function generateRandomPrice(min: number, max: number): number {
  const raw = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(raw / 1000) * 1000;
}

function generateRandomStock(): number {
  return Math.floor(Math.random() * 300) + 20;
}

function generateRandomSold(): number {
  return Math.floor(Math.random() * 150);
}

function generateRandomImage(index: number): string {
  return `https://picsum.photos/id/${index + 50}/300/300`;
}

function generateProductData(): Product[] {
  const products: Product[] = [];
  let index = 0;

  for (const { category, names, description } of categoryData) {
    for (const name of names) {
      products.push({
        name,
        description: description(),
        price: generateRandomPrice(500_000, 30_000_000),
        stock: generateRandomStock(),
        sold: generateRandomSold(),
        img: generateRandomImage(index),
        category,
        categorySlug: toSlug(category),
      });
      index++;
    }
  }

  return products;
}

const mockProducts = generateProductData();

export const seedProduct = async () => {
  try {
    await Product.deleteMany({});
    const result = await Product.insertMany(mockProducts);
    console.log("Seed xong dữ liệu sản phẩm:", result.length);

    const kafka = new MessageBroker();
    await kafka.connect();
    await kafka.publish("Product-Topic", { data: result }, ProductEvent.INSERT);
  } catch (error) {
    console.error("Lỗi khi seed products:", error);
  }
};
