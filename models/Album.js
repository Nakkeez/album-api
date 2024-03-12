const mongoose = require('mongoose');
const { Schema } = mongoose;

const currentYear = new Date().getFullYear();

const albumSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: [true, 'Artist must be provided'],
    minlength: [3, 'Artist must be atleast 3 characters'],
    maxlength: [50, 'Artist must not be more than 50 characters']
  },
  title: {
    type: String,
    required: [true, 'Title must be provided'],
    minlength: [3, 'Title must be atleast 3 characters'],
    maxlength: [50, 'Title must not be more than 50 characters']
  },
  year: {
    type: Number,
    min: [1900, 'Release year must be 1900 or later'],
    max: [currentYear, 'Release year must not exceed the current year']
  },
  genre: { 
    type: String,
    enum: {
      values: [
        'Classical', 'Pop', 'Hip hop', 'Rock', 'Jazz', 'Country', 'Folk',
        'Reggae', 'Religious', 'Blues', 'Electronic', 'Traditional', 'Latin',
        'R&B', 'Funk', 'Children', 'New-age', null],
      message: '{VALUE} is not supported genre'
    }
  },
  tracks: {
    type: Number,
    min: [1, 'Track count must be more than 0'],
    max: [100, 'Track count must not exceed 100']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  owners: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

albumSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Album', albumSchema);