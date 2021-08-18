import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, required: true, unique: true, lowercase: true },
    imageUrl: { type: String, required: true, unique: true, lowercase: true },
    price: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true, unique: true, lowercase: true },
},
{
    timestamps: true,
}
);


export default mongoose.model('User', UserSchema, 'test');