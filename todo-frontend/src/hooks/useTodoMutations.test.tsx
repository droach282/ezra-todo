import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useCreateTodo, useDeleteTodo, useUpdateTodo } from './useTodoMutations'
import type { Todo } from '@/models/todo'
import * as todoApi from '@/services/todoApi'
import { createTestQueryClient } from '@/test/test-utils'

// Mock the todo API
vi.mock('@/services/todoApi', () => ({
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}))

describe('useTodoMutations Hooks', () => {
  const mockCreateTodo = vi.mocked(todoApi.createTodo)
  const mockUpdateTodo = vi.mocked(todoApi.updateTodo)
  const mockDeleteTodo = vi.mocked(todoApi.deleteTodo)

  const mockTodo: Todo = {
    id: 1,
    description: 'Test todo',
    isCompleted: false,
  }

  const mockTodos: Array<Todo> = [
    { id: 1, description: 'First todo', isCompleted: false },
    { id: 2, description: 'Second todo', isCompleted: true },
    { id: 3, description: 'Third todo', isCompleted: false },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCreateTodo', () => {
    it('calls createTodo API with correct description', async () => {
      const queryClient = createTestQueryClient()
      const newTodo: Todo = {
        id: 4,
        description: 'New todo',
        isCompleted: false,
      }

      mockCreateTodo.mockResolvedValue(newTodo)

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate('New todo')
      })

      await waitFor(() => {
        expect(result.current.mutation.isSuccess).toBe(true)
      })

      expect(mockCreateTodo).toHaveBeenCalledWith('New todo')
      expect(mockCreateTodo).toHaveBeenCalledTimes(1)
    })

    it('sets error message when creation fails', async () => {
      const queryClient = createTestQueryClient()

      mockCreateTodo.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate('New todo')
      })

      await waitFor(() => {
        expect(result.current.mutation.isError).toBe(true)
      })

      expect(result.current.error).toBe(
        'Failed to create todo. Please try again.',
      )
    })

    it('clears error on next mutation attempt', async () => {
      const queryClient = createTestQueryClient()

      // First attempt fails
      mockCreateTodo.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate('New todo')
      })

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Failed to create todo. Please try again.',
        )
      })

      // Second attempt succeeds
      mockCreateTodo.mockResolvedValue(mockTodo)

      act(() => {
        result.current.mutation.mutate('New todo')
      })

      await waitFor(() => {
        expect(result.current.error).toBe(null)
      })
    })

    it('allows manual error clearing via setError', () => {
      const queryClient = createTestQueryClient()

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      // Manually set error
      act(() => {
        result.current.setError('Custom error')
      })
      expect(result.current.error).toBe('Custom error')

      // Clear it
      act(() => {
        result.current.setError(null)
      })
      expect(result.current.error).toBe(null)
    })
  })

  describe('useUpdateTodo', () => {
    it('calls updateTodo API with correct parameters', async () => {
      const queryClient = createTestQueryClient()
      const updatedTodo: Todo = {
        ...mockTodos[0],
        description: 'Updated description',
      }

      mockUpdateTodo.mockResolvedValue(updatedTodo)

      const { result } = renderHook(() => useUpdateTodo(1), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate({ description: 'Updated description' })
      })

      await waitFor(() => {
        expect(result.current.mutation.isSuccess).toBe(true)
      })

      expect(mockUpdateTodo).toHaveBeenCalledWith(1, {
        description: 'Updated description',
      })
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1)
    })

    it('calls updateTodo with partial updates', async () => {
      const queryClient = createTestQueryClient()
      const updatedTodo: Todo = { ...mockTodos[0], isCompleted: true }

      mockUpdateTodo.mockResolvedValue(updatedTodo)

      const { result } = renderHook(() => useUpdateTodo(1), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate({ isCompleted: true })
      })

      await waitFor(() => {
        expect(result.current.mutation.isSuccess).toBe(true)
      })

      expect(mockUpdateTodo).toHaveBeenCalledWith(1, { isCompleted: true })
    })

    it('sets error message when update fails', async () => {
      const queryClient = createTestQueryClient()

      mockUpdateTodo.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useUpdateTodo(1), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate({ description: 'Updated description' })
      })

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Failed to update todo. Please try again.',
        )
      })
    })

    it('clears error on next mutation attempt', async () => {
      const queryClient = createTestQueryClient()

      mockUpdateTodo.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useUpdateTodo(1), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate({ description: 'Updated' })
      })

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Failed to update todo. Please try again.',
        )
      })

      mockUpdateTodo.mockResolvedValue({
        ...mockTodos[0],
        description: 'Updated',
      })

      act(() => {
        result.current.mutation.mutate({ description: 'Updated' })
      })

      await waitFor(() => {
        expect(result.current.error).toBe(null)
      })
    })
  })

  describe('useDeleteTodo', () => {
    it('calls deleteTodo API with correct ID', async () => {
      const queryClient = createTestQueryClient()

      mockDeleteTodo.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteTodo(1), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate(1)
      })

      await waitFor(() => {
        expect(result.current.mutation.isSuccess).toBe(true)
      })

      expect(mockDeleteTodo).toHaveBeenCalledWith(1)
      expect(mockDeleteTodo).toHaveBeenCalledTimes(1)
    })

    it('calls onDeleteSuccess callback when provided', async () => {
      const queryClient = createTestQueryClient()
      const onDeleteSuccess = vi.fn()

      mockDeleteTodo.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteTodo(1, onDeleteSuccess), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate(1)
      })

      await waitFor(() => {
        expect(result.current.mutation.isSuccess).toBe(true)
      })

      expect(onDeleteSuccess).toHaveBeenCalled()
      expect(onDeleteSuccess).toHaveBeenCalledTimes(1)
    })

    it('does not call onDeleteSuccess callback on error', async () => {
      const queryClient = createTestQueryClient()
      const onDeleteSuccess = vi.fn()

      mockDeleteTodo.mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useDeleteTodo(1, onDeleteSuccess), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate(1)
      })

      await waitFor(() => {
        expect(result.current.mutation.isError).toBe(true)
      })

      expect(onDeleteSuccess).not.toHaveBeenCalled()
    })

    it('sets error message when deletion fails', async () => {
      const queryClient = createTestQueryClient()

      mockDeleteTodo.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useDeleteTodo(1), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate(1)
      })

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Failed to delete todo. Please try again.',
        )
      })
    })

    it('clears error on next mutation attempt', async () => {
      const queryClient = createTestQueryClient()

      mockDeleteTodo.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useDeleteTodo(1), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      })

      act(() => {
        result.current.mutation.mutate(1)
      })

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Failed to delete todo. Please try again.',
        )
      })

      mockDeleteTodo.mockResolvedValue(undefined)

      act(() => {
        result.current.mutation.mutate(1)
      })

      await waitFor(() => {
        expect(result.current.error).toBe(null)
      })
    })
  })
})
