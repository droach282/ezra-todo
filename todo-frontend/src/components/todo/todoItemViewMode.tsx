import { EditIcon, TrashIcon } from 'lucide-react'

interface TodoItemViewModeProps {
  description: string
  isLoading: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function TodoItemViewMode({
  description,
  isLoading,
  onEdit,
  onDelete,
}: TodoItemViewModeProps) {
  return (
    <>
      <div className="flex-1 p-2">{description}</div>
      <EditIcon
        className={`${isLoading ? 'opacity-50' : 'cursor-pointer'}`}
        onClick={isLoading ? undefined : onEdit}
      />
      <TrashIcon
        className={`${isLoading ? 'opacity-50' : 'cursor-pointer'}`}
        onClick={isLoading ? undefined : onDelete}
      />
    </>
  )
}
