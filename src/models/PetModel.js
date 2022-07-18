import mongoose from 'mongoose';

const {Schema} = mongoose;

const petSchema = new Schema({
  name: String,
  bod: Date,
  avatar: String,
  description: String,
  images: [{type: String}],
}, {
  timestamps: true,
});

const PetModel = mongoose.model('pet_model', petSchema);

export default PetModel
