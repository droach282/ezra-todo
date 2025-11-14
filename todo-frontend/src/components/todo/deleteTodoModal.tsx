interface DeleteTodoModalProps {
  isOpen: boolean
  todoDescription: string
  onDelete: () => void
  onCancel: () => void
}

export default function DeleteTodoModal({
  isOpen,
  todoDescription,
  onDelete,
  onCancel,
}: DeleteTodoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
      <div className="bg-white p-6 rounded-lg shadow-xl z-20">
        <h3 className="text-lg font-semibold mb-4">Delete Todo</h3>
        <p className="mb-6">
          Are you sure you want to delete "{todoDescription}"?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
