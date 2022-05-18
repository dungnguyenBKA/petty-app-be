import mongoose from 'mongoose';
const { Schema } = mongoose;

const postSchema = new Schema({
    id: String,
    title: String,
    body: String,
    userId: String,
});

const PostModel = mongoose.model('post_model', postSchema);

export default PostModel