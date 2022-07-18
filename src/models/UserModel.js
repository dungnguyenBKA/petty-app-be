import mongoose from 'mongoose';

const {Schema} = mongoose;

const userSchema = new Schema({
    name: String,
    username: String,
    pass: String,
    avatar: String,
    description: String,
}, {
    timestamps: true,
});

const UserModel = mongoose.model('user_model', userSchema);

export default UserModel
