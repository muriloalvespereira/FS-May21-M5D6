import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    productId:[{ type: Schema.Types.ObjectId, ref: "products" }],
    qty: { type: Number, required: true }
}
);
export default mongoose.model('cart', cartSchema);