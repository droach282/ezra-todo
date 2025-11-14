import { useEffect, useRef } from 'react'
import { SaveIcon, XCircleIcon } from 'lucide-react'

interface TodoItemEditModeProps {
  description: string
  setDescription: (value: string) => void
  isLoading: boolean
  onSave: () => void
  onCancel: () => void
}

export default function TodoItemEditMode({
  description,
  setDescription,
  isLoading,
  onSave,
  onCancel,
}: TodoItemEditModeProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onSave()
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        className="flex-1 p-1 border-2 border-gray-200 rounded"
        type="text"
        maxLength={80}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <SaveIcon
        className={`${isLoading ? 'opacity-50' : 'cursor-pointer'}`}
        onClick={isLoading ? undefined : onSave}
      />
      <XCircleIcon
        className={`${isLoading ? 'opacity-50' : 'cursor-pointer'}`}
        onClick={isLoading ? undefined : onCancel}
      />
    </>
  )
}
