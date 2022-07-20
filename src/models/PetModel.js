import mongoose from 'mongoose';

const {Schema} = mongoose;

const petSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  dob: Date,
  avatar: String,
  description: String,
  images: {
    type: [{type: String}],
  },
  owner_id: Schema.Types.ObjectId,
}, {
  timestamps: true,
});

function arrayEmpty(val) {
  return val.length <= 0;
}

const PetModel = mongoose.model('pet_model', petSchema);

export default PetModel
