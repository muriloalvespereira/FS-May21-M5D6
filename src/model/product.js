import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    comments:[{ type: Schema.Types.ObjectId, ref: "reviews" }],

},
{
    timestamps: true,
}
);


export default mongoose.model('products', ProductSchema);