import { useMemo, useState } from 'react'
import type { Todo } from '@/models/todo'

/**
 * Custom hook to manage todo filtering logic
 * Separates filter state and logic from presentation components
 */
export function useTodoFilter(todos: Array<Todo> | undefined) {
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)

  const filteredTodos = useMemo(() => {
    if (!todos) return []

    return showIncompleteOnly
      ? todos.filter((todo) => !todo.isCompleted)
      : todos
  }, [todos, showIncompleteOnly])

  const toggleFilter = () => setShowIncompleteOnly((prev) => !prev)

  return {
    showIncompleteOnly,
    filteredTodos,
    toggleFilter,
  }
}
