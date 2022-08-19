const mongoose = require('mongoose')

const schema1 = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: [
    { type: String}
  ]
})

const BookSchema = mongoose.model('Book', schema1)

const schema2 = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  born: {
    type: Number,
  },
})

const AuthorShema = mongoose.model('Author', schema2)

const schema3 = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  favoriteGenre: {
    type: String,
  }
})

const UserSchema = mongoose.model('User', schema3)

module.exports = {BookSchema, AuthorShema, UserSchema}