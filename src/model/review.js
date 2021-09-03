import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    comment: { type: String, required: true },
    rate: { type: Number, required: true }
}
);


export default mongoose.model('reviews', ReviewSchema);