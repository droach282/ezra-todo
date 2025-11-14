import { useEffect, useState } from 'react'

/**
 * Custom hook to manage edit and delete mode state for a todo item
 * Separates UI state logic from presentation components
 */
export function useEditMode(initialDescription: string) {
  const [editMode, setEditMode] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [description, setDescription] = useState<string>(initialDescription)

  // Sync description when initial value changes (e.g., from server update)
  useEffect(() => {
    setDescription(initialDescription)
  }, [initialDescription])

  const enterEditMode = () => setEditMode(true)
  const exitEditMode = () => setEditMode(false)

  const enterDeleteMode = () => setDeleteMode(true)
  const exitDeleteMode = () => setDeleteMode(false)

  const resetDescription = () => {
    setDescription(initialDescription)
  }

  const cancelEdit = () => {
    resetDescription()
    exitEditMode()
  }

  return {
    // State
    editMode,
    deleteMode,
    description,

    // Setters
    setDescription,

    // Actions
    enterEditMode,
    exitEditMode,
    enterDeleteMode,
    exitDeleteMode,
    cancelEdit,
  }
}
