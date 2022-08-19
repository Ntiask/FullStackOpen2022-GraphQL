import {All_Books} from '../queries.js'
import { useQuery } from '@apollo/client'
import { useState } from 'react'


const Books = (props) => {
  const [booklist , setBooklist] = useState({})
  const [filter , setFilter] = useState('')
  const { loading, error, data } = useQuery(All_Books, {onCompleted: setBooklist, variables:{genre: filter}, pollInterval:5000})
  let allGenres = []

  if (!props.show) {
    return null
  }
  
  booklist.allBooks.forEach(book => {
    book.genres.forEach(genre => {
       if (!allGenres.includes(genre)){
         allGenres.push(genre)
       }
    });
  })

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booklist.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
          </tr>
          ))}

        </tbody>
      </table>
      {allGenres.map(genre => {return <button key={genre} onClick={() => setFilter(genre)}>{genre}</button>})}
      {<button onClick={() => setFilter('')}>All Genres</button>}
      
    </div>
  )
}

export default Books
