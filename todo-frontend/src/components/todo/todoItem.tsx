import DeleteTodoModal from './deleteTodoModal'
import TodoItemEditMode from './todoItemEditMode'
import TodoItemViewMode from './todoItemViewMode'
import type { Todo } from '@/models/todo.ts'
import { useDeleteTodo, useUpdateTodo } from '@/hooks/useTodoMutations'
import { useEditMode } from '@/hooks/useEditMode'

export default function TodoItem({ todo }: { todo: Todo }) {
  const {
    editMode,
    deleteMode,
    description,
    setDescription,
    enterEditMode,
    exitEditMode,
    enterDeleteMode,
    exitDeleteMode,
    cancelEdit,
  } = useEditMode(todo.description)

  const { mutation: todoMutation, error: updateError } = useUpdateTodo(todo.id)
  const { mutation: deleteMutation, error: deleteError } = useDeleteTodo(
    todo.id,
    exitDeleteMode,
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
          exitEditMode()
        },
      },
    )
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
              onEdit={enterEditMode}
              onDelete={enterDeleteMode}
            />
          )}
        </div>
        {error && <div className="text-red-600 text-sm px-3">{error}</div>}
      </div>

      <DeleteTodoModal
        isOpen={deleteMode}
        todoDescription={todo.description}
        onDelete={handleDelete}
        onCancel={exitDeleteMode}
      />
    </>
  )
}
