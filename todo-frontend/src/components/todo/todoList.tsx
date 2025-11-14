import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import TodoItem from './todoItem'
import AddTodo from './addTodo'
import { getTodos } from '@/services/todoApi.ts'

export default function TodoList() {
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    console.error(error)
    return <span>Sorry, an error occurred.</span>
  }

  const filteredData = showIncompleteOnly
    ? data.filter((todo) => !todo.isCompleted)
    : data

  return (
    <div className="max-w-fit flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
          className={`px-4 py-2 rounded border-2 transition-colors ${
            showIncompleteOnly
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {showIncompleteOnly ? 'Show All' : 'Show Incomplete'}
        </button>
      </div>
      {filteredData.map((item) => (
        <TodoItem key={item.id} todo={item} />
      ))}
      <AddTodo />
    </div>
  )
}
