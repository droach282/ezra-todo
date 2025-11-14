import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { useCreateTodo } from '@/hooks/useTodoMutations'

export default function AddTodo({className}: {className?: string}) {
  const [description, setDescription] = useState('')
  const { mutation, error } = useCreateTodo()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (description.trim()) {
      mutation.mutate(description, {
        onSuccess: () => {
          setDescription('')
        },
      })
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new todo..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={80}
          className="flex-1 p-2 border-2 border-gray-200 rounded"
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          disabled={mutation.isPending || !description.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <PlusIcon size={20} />
          Add
        </button>
      </form>
      {error && <div className="text-red-600 text-sm px-2">{error}</div>}
    </div>
  )
}
