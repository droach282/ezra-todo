import { useEffect, useState } from 'react'
import DeleteTodoModal from './deleteTodoModal'
import TodoItemEditMode from './todoItemEditMode'
import TodoItemViewMode from './todoItemViewMode'
import type { Todo } from '@/models/todo.ts'
import { useDeleteTodo, useUpdateTodo } from '@/hooks/useTodoMutations'

export default function TodoItem({ todo }: { todo: Todo }) {
  const [editMode, setEditMode] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [description, setDescription] = useState<string>(todo.description)

  useEffect(() => {
    setDescription(todo.description)
  }, [todo.description])

  const { mutation: todoMutation, error: updateError } = useUpdateTodo(todo.id)
  const { mutation: deleteMutation, error: deleteError } = useDeleteTodo(
    todo.id,
    () => setDeleteMode(false),
  )

  const error = updateError || deleteError

  function toggleCompleted() {
    todoMutation.mutate({ isCompleted: !todo.isCompleted })
  }

  function saveDescription() {
    todoMutation.mutate(
      { description: description },
      {
        onSuccess: () => {
          setEditMode(false)
        },
      },
    )
  }

  function cancelEdit() {
    setDescription(todo.description)
    setEditMode(false)
  }

  function handleDelete() {
    deleteMutation.mutate(todo.id)
  }

  const isLoading = todoMutation.isPending || deleteMutation.isPending

  return (
    <>
      <div className="flex flex-col gap-2">
        <div
          className={`flex border-2 rounded-md border-gray-200 gap-4 p-3 items-center h-14 w-4xl ${isLoading ? 'opacity-50' : ''}`}
        >
          <input
            type="checkbox"
            checked={todo.isCompleted}
            disabled={editMode || isLoading}
            onChange={() => toggleCompleted()}
          />
          {editMode ? (
            <TodoItemEditMode
              description={description}
              setDescription={setDescription}
              isLoading={isLoading}
              onSave={saveDescription}
              onCancel={cancelEdit}
            />
          ) : (
            <TodoItemViewMode
              description={description}
              isLoading={isLoading}
              onEdit={() => setEditMode(true)}
              onDelete={() => setDeleteMode(true)}
            />
          )}
        </div>
        {error && <div className="text-red-600 text-sm px-3">{error}</div>}
      </div>

      <DeleteTodoModal
        isOpen={deleteMode}
        todoDescription={todo.description}
        onDelete={handleDelete}
        onCancel={() => setDeleteMode(false)}
      />
    </>
  )
}
