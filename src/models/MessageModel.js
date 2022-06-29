import mongoose from 'mongoose';

const {Schema} = mongoose;

const messageSchema = new Schema({
  message: String,
  channel_id: String,
}, {
  timestamps: true
});

const MessageModel = mongoose.model('message_model', messageSchema);

export default MessageModel
