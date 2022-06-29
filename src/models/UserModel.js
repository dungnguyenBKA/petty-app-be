import mongoose from 'mongoose';

const {Schema} = mongoose;

const userSchema = new Schema({
    id: String,
    name: String,
    pass: String,
}, {
    timestamps: true,
});

const UserModel = mongoose.model('user_model', userSchema);

export default UserModel
