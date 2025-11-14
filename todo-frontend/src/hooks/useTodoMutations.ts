import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Todo } from '@/models/todo.ts'
import { createTodo, deleteTodo, updateTodo } from '@/services/todoApi.ts'

function useOptimisticTodoMutation<TVariables, TData = void>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  optimisticUpdate: (todos: Array<Todo>, vars: TVariables) => Array<Todo>,
  errorMessage: string,
  options?: {
    onSuccess?: (
      data: TData,
      queryClient: ReturnType<typeof useQueryClient>,
    ) => void
  },
) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      setError(null)
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos'])

      queryClient.setQueryData(
        ['todos'],
        (oldTodos: Array<Todo> | undefined) =>
          oldTodos ? optimisticUpdate(oldTodos, variables) : oldTodos,
      )

      return { previousTodos }
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data, queryClient)
    },
    onError: (_err, _var, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
      setError(errorMessage)
    },
  })

  return { mutation, error, setError }
}

export function useUpdateTodo(todoId: number) {
  return useOptimisticTodoMutation(
    (updates: { isCompleted?: boolean; description?: string }) =>
      updateTodo(todoId, updates),
    (todos, updates) =>
      todos.map((t) => (t.id === todoId ? { ...t, ...updates } : t)),
    'Failed to update todo. Please try again.',
    {
      onSuccess: (updatedTodo, queryClient) => {
        queryClient.setQueryData(
          ['todos'],
          (oldTodos: Array<Todo> | undefined) =>
            oldTodos?.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
        )
      },
    },
  )
}

export function useDeleteTodo(todoId: number, onDeleteSuccess?: () => void) {
  return useOptimisticTodoMutation(
    () => deleteTodo(todoId),
    (todos) => todos.filter((t) => t.id !== todoId),
    'Failed to delete todo. Please try again.',
    {
      onSuccess: onDeleteSuccess,
    },
  )
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (description: string) => createTodo(description),
    onMutate: () => {
      setError(null)
    },
    onSuccess: (newTodo) => {
      queryClient.setQueryData(
        ['todos'],
        (oldTodos: Array<Todo> | undefined) =>
          oldTodos ? [...oldTodos, newTodo] : [newTodo],
      )
    },
    onError: () => {
      setError('Failed to create todo. Please try again.')
    },
  })

  return { mutation, error, setError }
}
