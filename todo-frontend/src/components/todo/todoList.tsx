import { useQuery } from '@tanstack/react-query'
import TodoItem from './todoItem'
import AddTodo from './addTodo'
import { getTodos } from '@/services/todoApi.ts'
import { useTodoFilter } from '@/hooks/useTodoFilter'

export default function TodoList() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  const { showIncompleteOnly, filteredTodos, toggleFilter } = useTodoFilter(data)

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    console.error(error)
    return <span>Sorry, an error occurred.</span>
  }

  return (
    <div className="max-w-fit flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        <AddTodo className="flex-1" />
        <button
          onClick={toggleFilter}
          className={`px-4 py-2 rounded border-2 transition-colors ${
            showIncompleteOnly
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {showIncompleteOnly ? 'Show All' : 'Show Incomplete'}
        </button>
      </div>
      {filteredTodos.length > 0 ? (
        filteredTodos.map((item) => (
            <TodoItem key={item.id} todo={item} />
          ))
      ): (
        <div className="w-4xl text-2xl p-6 flex justify-center">You have no todos.</div>
      )}

    </div>
  )
}
