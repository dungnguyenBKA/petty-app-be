import mongoose from 'mongoose';

const {Schema} = mongoose;

const novelSchema = new Schema({
    title: String,
    coverImage: String,
    detailLink: String,
    author: String,
}, {
    timestamps: true,
});

const NovelModel = mongoose.model('novel_model', novelSchema);

export default NovelModel
