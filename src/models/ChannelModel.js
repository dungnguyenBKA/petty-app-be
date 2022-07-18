import mongoose from 'mongoose';

const {Schema} = mongoose;

const channelSchema = new Schema(
  {
    userIds: Array,
  },
  {
    timestamps: true,
  }
);

const ChannelModel = mongoose.model('channel_model', channelSchema);

export default ChannelModel
