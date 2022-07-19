import mongoose from 'mongoose';

const {Schema} = mongoose;

const petSchema = new Schema({
  name: String,
  dob: Date,
  avatar: String,
  description: String,
  images: [{type: String}],
  owner_id: Schema.Types.ObjectId,
}, {
  timestamps: true,
});

const PetModel = mongoose.model('pet_model', petSchema);

export default PetModel
