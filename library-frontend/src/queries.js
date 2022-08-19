import { gql } from '@apollo/client'

export const All_Authors = gql`
  query {
    allAuthors  {
      name
      born
      bookCount
    }
  },
`
export const All_Books = gql`
  query AllBooks($genre: String) {
  allBooks(genre: $genre) {
    title
    genres
    published
    author {
      name
    }
  }
},
`
export const New_Book= gql`
mutation addBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) 
{addBook(title: $title, published: $published, author: $author, genres: $genres) {
    title
    published
    genres
    author {
      name
    }
  }
}
`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const Set_Born= gql`
mutation setBorn($name: String!, $setBornTo: Int!){editAuthor(name: $name, setBornTo: $setBornTo) {
    name
    born
  }
  }
`

