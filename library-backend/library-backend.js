const { ApolloServer, gql, UserInputError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Initial_Data = require('./Initials')
const {BookSchema} = require('./mongooseSchema')
const {AuthorShema} = require('./mongooseSchema')
const {UserSchema} = require('./mongooseSchema')

const JWT_SECRET = 'HELEVATINSALAINEN'

const MONGODB_URI = 'mongodb+srv://Niko:pr2jk@cluster0.hb3dt.mongodb.net/Library?retryWrites=true&w=majority'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

console.log('connecting to', MONGODB_URI)

/*  INITIAL DATA PUSH TO DB AUTHORS
Initial_Data.Initial_Authors.forEach(x => {
  const initial = new AuthorShema(x)
  initial.save().then(response => console.log(response))
}) */

/* INITIAL DATA PUSH TO BOOKS
Initial_Data.Initial_Books.forEach(x => {
  const initial = new BookSchema(x)
  initial.save().then(response => console.log(response))})
*/



// GRAPHQL



const typeDefs = gql`

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
      name: String!,
      id: ID!,
      born: Int,
      bookCount: Int,
      books: [Book]
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Query {
      BookCount: Int!,
      AuthorCount: Int!,
      findBook(title: String!): Book!,
      findAuthor(name: String!): Author!,
      allBooks(author: String, genre: String): [Book!]!,
      allAuthors: [Author!]!
      me: User
  }
  type Mutation {
      addBook(
        title: String!,
        published: Int!,
        author: String!,
        id: ID,
        genres: [String!]!
      ): Book
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
      editAuthor(
        name: String!,
        setBornTo: Int!,
      ): Author  
  }
  type Token {
    value: String!
  }


`

const resolvers = {
  Query: {
    BookCount: () => BookSchema.collection.countDocuments(),
    AuthorCount: () => AuthorShema.collection.countDocuments(),
    findBook: async (root, args) => BookSchema.findOne({title: args.title}),
    findAuthor: async (root, args) => AuthorShema.findOne({name: args.name}),
    me: async (root, args, context) => {
      const user = await UserSchema.findOne({username: context.currentUser})
      return user
    },
    allBooks: async (root, args) => {

        if (args.author && args.genre) {
          const author = await AuthorShema.findOne({name: args.author})
            const books = BookSchema.find({})
            return [(await books)].filter(p => p.author.id.toString() === author._id.toString() && p.genres.includes(args.genre))
        }
        
        if (args.author) {
            const author = await AuthorShema.findOne({name: args.author})
            const books = await BookSchema.find({})
            return books.filter(p => p.author.toString() === author._id.toString())
        }
        if (args.genre){
          const books = await BookSchema.find({})
          return books.filter(p => p.genres.includes(args.genre))
          
        }
        return BookSchema.find({})
      },

    allAuthors: async () => AuthorShema.find({}),
        },

    Author: {
            bookCount: async (root) => {
              const author = await AuthorShema.findOne({name: root.name})
              const books = await BookSchema.find({})
              return books.filter(p => p.author._id.toString() === author._id.toString()).length
            },

            books: async (root) => {
              const author = await AuthorShema.findOne({name: root.name})
              const books = await BookSchema.find({})
              return books.filter(p => p.author._id.toString() === author._id.toString())
            },
      },
    
    Book: {
            author: async (root) => {
              const author = await AuthorShema.findById({_id: root.author.toString()})
              console.log(author)
              return author
            },
    },
    Mutation: {
            addBook: async (root, args, context) => {
                const currentUser = context.currentUser
                if (!currentUser){
                  throw new AuthenticationError("not authenticated")
                }
                const author = await AuthorShema.findOne({name: args.author})

                if (author) {
                      const Book = {
                        title: args.title,
                        published: args.published,
                        author: author._id,
                        genres: args.genres,
                        //id: uuid()
                      }
                      const req = new BookSchema(Book)
                      const response = await req.save().catch(error => {
                        throw new UserInputError(error.message, {invalidArgs: args,
                        })
                      })
                      
                      return response

                } else {
                      const newAuth = new AuthorShema({
                        name: args.author,
                        bookCount: 1
                      })

                      
                      const req = await newAuth.save().catch(error => {
                        throw new UserInputError(error.message, {invalidArgs: args,
                        })
                      })
                      
                      const Book = {
                        title: args.title,
                        published: args.published,
                        author: req._id,
                        genres: args.genres,
                        //id: uuid()
                      }
                      const req1 = new BookSchema(Book)
                      
                      const response = await req1.save().catch(error => {
                        throw new UserInputError(error.message, {invalidArgs: args,
                        })
                      })
                      
                  return response
                }
                
            
            
            },

          editAuthor: async (root, args, context) => {
              
              //might not work.  repair later
            const currentUser = context.currentUser
            if (!currentUser){
              throw new AuthenticationError("not authenticated")
            }
            const response = await AuthorShema.findOneAndUpdate({name: args.name},{born: args.setBornTo})
            return response
            },
            createUser: async (root, args) => {
              const user = new UserSchema({
                username: args.username, 
                favoriteGenre: args.favoriteGenre
              })
              return user.save()
              .catch(error => {throw new UserInputError(error.message, {
                invalidArgs: args,
              })
            })
            },
            login: async (root,args) => {
              const user = await UserSchema.findOne({username: args.username})
              if (!user || args.password !== 'secret') {
                throw new UserInputError("Wrong Credentials")
              }
              const userForToken = {
                username: user.username,
                id: user._id,
              }
              return {value: jwt.sign(userForToken, JWT_SECRET)}
            },
        },
    
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = decodedToken.username
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})