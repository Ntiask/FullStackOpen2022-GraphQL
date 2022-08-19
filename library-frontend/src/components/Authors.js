import {All_Authors, Set_Born} from '../queries.js'
import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'

const Authors = (props) => {
  const [ChangeBornDate] = useMutation(Set_Born)
  const results = useQuery(All_Authors, {pollInterval: 5000})
  const [name , setName] = useState('')
  const [year , setYear] = useState('')

  if (!props.show) {
    return null
  }

  if (results.loading)  {
    return <div>loading...</div>
  }

const ChangeBorn = (event) => {
  event.preventDefault()
  ChangeBornDate({variables: {name: name, setBornTo: parseInt(year)}})
}
  const authors = results.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>Change Author Born Date</h1>
      <form onSubmit={ChangeBorn}>
        Name: <input value={name} onChange={({ target }) => setName(target.value)}/>
        <br/>
        Born in: <input type={year} onChange={({ target }) => setYear(target.value)}/>
        <br/>
        <button>Submit</button>
      </form>
    </div>
  )
}

export default Authors
