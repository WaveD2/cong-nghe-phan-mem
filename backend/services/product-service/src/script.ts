import Product from "./models/productModel";
import { ProductType } from "./types/interface/IProduct";
import { ProductEvent } from "./types/kafkaType";
import MessageBroker from "./utils/messageBroker";
type Product = Pick<
  ProductType,
  "name" | "description" | "price" | "stock" | "img"
>;
// Danh sách tên sản phẩm bằng tiếng Việt
const productNames: string[] = [
  "Điện thoại thông minh",
  "Máy tính bảng",
  "Laptop cao cấp",
  "Tai nghe không dây",
  "Máy ảnh kỹ thuật số",
  "Đồng hồ thông minh",
  "Loa Bluetooth",
  "Bàn phím cơ",
  "Chuột không dây",
  "Màn hình 4K",
  "Máy in màu",
  "Ổ cứng ngoài",
  "Bộ định tuyến Wi-Fi",
  "Máy pha cà phê",
  "Bình nước thông minh",
];

// Hàm tạo chuỗi mô tả ngẫu nhiên
function generateRandomDescription(): string {
  const adjectives = [
    "hiện đại",
    "tiện lợi",
    "cao cấp",
    "bền bỉ",
    "đẹp mắt",
    "thông minh",
  ];
  const nouns = ["sản phẩm", "thiết bị", "công nghệ", "phụ kiện", "thiết kế"];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `Đây là một ${randomAdjective} ${randomNoun} với hiệu suất tuyệt vời, phù hợp cho mọi nhu cầu sử dụng.`;
}

function generateRandomPrice(): number {
  return Math.floor(Math.random() * (10_000_000 - 100_000 + 1)) + 100_000;
}

function generateRandomStock(): number {
  return Math.floor(Math.random() * (1000 - 11)) + 11;
}
function generateRandomImage(index: number): string {
  return `https://picsum.photos/id/${index + 10}/300/300`;
}

function generateProduct(index: number): Product {
  return {
    name: productNames[Math.floor(Math.random() * productNames.length)],
    description: generateRandomDescription(),
    price: generateRandomPrice(),
    stock: generateRandomStock(),
    img: generateRandomImage(index),
  };
}

function generateProductData(count: number): Product[] {
  const products: Product[] = [];
  for (let i = 0; i < count; i++) {
    products.push(generateProduct(i));
  }
  return products;
}

const mockProducts: Product[] = generateProductData(20);

export const seedProduct = async () => {
  try {
    await Product.deleteMany({});
    const result = await Product.insertMany(mockProducts);
    console.log("seed data xong:::.", result.length);

    const kafka = new MessageBroker();
    await kafka.connect();
    await kafka.publish("Product-Topic", { data: result }, ProductEvent.CREATE);
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};
