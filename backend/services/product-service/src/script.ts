import data from "./data.json";
import Product from "./models/productModel";
import { ProductEvent } from "./types/kafkaType";
import MessageBroker from "./utils/messageBroker";

export const seedProduct = async () => {
    try {
        await Product.deleteMany({});
        const result = await Product.insertMany(data);
        console.log("seeded", result.length);


        const kafka = new MessageBroker();
        await kafka.connect();
        await kafka.publish("Product-Topic", { data: result }, ProductEvent.INSERT);
    } catch (error) {
        console.log(error);
    }
};