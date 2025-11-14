import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from './todoItem'
import type { Todo } from '@/models/todo'
import { renderWithQueryClient } from '@/test/test-utils'
import * as todoApi from '@/services/todoApi'

// Mock the todo API
vi.mock('@/services/todoApi', () => ({
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}))

describe('TodoItem Component', () => {
  const mockUpdateTodo = vi.mocked(todoApi.updateTodo)
  const mockDeleteTodo = vi.mocked(todoApi.deleteTodo)

  const mockTodo: Todo = {
    id: 1,
    description: 'Test todo item',
    isCompleted: false,
  }

  const completedTodo: Todo = {
    id: 2,
    description: 'Completed todo',
    isCompleted: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders todo description', () => {
      renderWithQueryClient(<TodoItem todo={mockTodo} />)
      expect(screen.getByText('Test todo item')).toBeInTheDocument()
    })

    it('renders unchecked checkbox for incomplete todo', () => {
      renderWithQueryClient(<TodoItem todo={mockTodo} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('renders checked checkbox for completed todo', () => {
      renderWithQueryClient(<TodoItem todo={completedTodo} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('renders edit and delete icons', () => {
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      // Check for SVG icons by their class names (lucide-react icons)
      const editIcon = container.querySelector('svg.lucide-square-pen')
      const deleteIcon = container.querySelector('svg.lucide-trash')

      expect(editIcon).toBeInTheDocument()
      expect(deleteIcon).toBeInTheDocument()
    })
  })

  describe('Toggling Completion', () => {
    it('calls updateTodo when checkbox is clicked', async () => {
      const user = userEvent.setup()
      mockUpdateTodo.mockResolvedValue({
        ...mockTodo,
        isCompleted: true,
      })

      renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith(1, { isCompleted: true })
      })
    })

    it('toggles from completed to incomplete', async () => {
      const user = userEvent.setup()
      mockUpdateTodo.mockResolvedValue({
        ...completedTodo,
        isCompleted: false,
      })

      renderWithQueryClient(<TodoItem todo={completedTodo} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith(2, { isCompleted: false })
      })
    })
  })

  describe('Edit Mode', () => {
    it('enters edit mode when edit icon is clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      expect(editIcon).toBeInTheDocument()

      await user.click(editIcon!)

      // Should show input with current description
      await waitFor(() => {
        const input = screen.getByDisplayValue('Test todo item')
        expect(input).toBeInTheDocument()
      })

      // Should show save and cancel icons instead of edit/delete
      expect(container.querySelector('svg.lucide-save')).toBeInTheDocument()
      expect(container.querySelector('svg.lucide-circle-x')).toBeInTheDocument()
    })

    it('focuses input when entering edit mode', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      await waitFor(() => {
        const input = screen.getByDisplayValue('Test todo item')
        expect(input).toHaveFocus()
      })
    })

    it('allows editing the description', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      const input = await screen.findByDisplayValue('Test todo item')
      await user.clear(input)
      await user.type(input, 'Updated todo')

      expect(input).toHaveValue('Updated todo')
    })

    it('saves changes when save icon is clicked', async () => {
      const user = userEvent.setup()
      mockUpdateTodo.mockResolvedValue({
        ...mockTodo,
        description: 'Updated todo',
      })

      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      const input = await screen.findByDisplayValue('Test todo item')
      await user.clear(input)
      await user.type(input, 'Updated todo')

      const saveIcon = container.querySelector('svg.lucide-save')
      await user.click(saveIcon!)

      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith(1, {
          description: 'Updated todo',
        })
      })

      // Should exit edit mode
      await waitFor(() => {
        expect(
          screen.queryByDisplayValue('Updated todo'),
        ).not.toBeInTheDocument()
      })
    })

    it('saves changes when Enter key is pressed', async () => {
      const user = userEvent.setup()
      mockUpdateTodo.mockResolvedValue({
        ...mockTodo,
        description: 'Updated via Enter',
      })

      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      const input = await screen.findByDisplayValue('Test todo item')
      await user.clear(input)
      await user.type(input, 'Updated via Enter{Enter}')

      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith(1, {
          description: 'Updated via Enter',
        })
      })

      // Should exit edit mode
      await waitFor(() => {
        expect(
          screen.queryByDisplayValue('Updated via Enter'),
        ).not.toBeInTheDocument()
      })
    })

    it('cancels edit and restores original description', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      const input = await screen.findByDisplayValue('Test todo item')
      await user.clear(input)
      await user.type(input, 'Updated todo')

      const cancelIcon = container.querySelector('svg.lucide-circle-x')
      await user.click(cancelIcon!)

      // Should exit edit mode and not call update
      expect(mockUpdateTodo).not.toHaveBeenCalled()

      // Should show original description
      await waitFor(() => {
        expect(screen.getByText('Test todo item')).toBeInTheDocument()
      })
    })

    it('disables checkbox during edit mode', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('enforces maxLength of 80 characters in edit input', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      const input = await screen.findByDisplayValue('Test todo item')
      expect(input).toHaveAttribute('maxLength', '80')
    })
  })

  describe('Delete Functionality', () => {
    it('opens delete modal when delete icon is clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const deleteIcon = container.querySelector('svg.lucide-trash')
      await user.click(deleteIcon!)

      // Should show modal with confirmation message
      expect(screen.getByText('Delete Todo')).toBeInTheDocument()
      expect(
        screen.getByText(/Are you sure you want to delete "Test todo item"/),
      ).toBeInTheDocument()
    })

    it('deletes todo when delete is confirmed', async () => {
      const user = userEvent.setup()
      mockDeleteTodo.mockResolvedValue(undefined)

      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const deleteIcon = container.querySelector('svg.lucide-trash')
      await user.click(deleteIcon!)

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockDeleteTodo).toHaveBeenCalledWith(1)
      })
    })

    it('closes modal when cancel is clicked without deleting', async () => {
      const user = userEvent.setup()
      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const deleteIcon = container.querySelector('svg.lucide-trash')
      await user.click(deleteIcon!)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument()
      })

      // Should not call delete
      expect(mockDeleteTodo).not.toHaveBeenCalled()
    })

    it('closes modal after successful deletion', async () => {
      const user = userEvent.setup()
      mockDeleteTodo.mockResolvedValue(undefined)

      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const deleteIcon = container.querySelector('svg.lucide-trash')
      await user.click(deleteIcon!)

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading state during update', async () => {
      const user = userEvent.setup()
      mockUpdateTodo.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ...mockTodo,
                  isCompleted: true,
                }),
              100,
            ),
          ),
      )

      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      // Should apply opacity-50 class during loading
      const todoContainer = container.querySelector('.opacity-50')
      expect(todoContainer).toBeInTheDocument()

      // Wait for mutation to complete
      await waitFor(
        () => {
          expect(mockUpdateTodo).toHaveBeenCalled()
        },
        { timeout: 200 },
      )
    })

    it('disables checkbox during loading', async () => {
      const user = userEvent.setup()
      mockUpdateTodo.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ...mockTodo,
                  isCompleted: true,
                }),
              100,
            ),
          ),
      )

      renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      // Checkbox should be disabled during mutation
      await waitFor(() => {
        expect(checkbox).toBeDisabled()
      })
    })

    it('disables edit input during save', async () => {
      const user = userEvent.setup()
      let resolveUpdate: (value: Todo) => void

      // Create a promise that won't resolve until we manually resolve it
      mockUpdateTodo.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve as (value: Todo) => void
          }),
      )

      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const editIcon = container.querySelector('svg.lucide-square-pen')
      await user.click(editIcon!)

      const input = await screen.findByDisplayValue('Test todo item')

      const saveIcon = container.querySelector('svg.lucide-save')
      await user.click(saveIcon!)

      // Check that input is disabled while mutation is pending
      await waitFor(() => {
        expect(input).toBeDisabled()
      })

      // Resolve the mutation and wait for state updates to complete
      await waitFor(() => {
        resolveUpdate!({ ...mockTodo, description: 'Test todo item' })
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when update fails', async () => {
      const user = userEvent.setup()
      mockUpdateTodo.mockRejectedValue(new Error('Update failed'))

      renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to update todo. Please try again.'),
        ).toBeInTheDocument()
      })
    })

    it('displays error message when delete fails', async () => {
      const user = userEvent.setup()
      mockDeleteTodo.mockRejectedValue(new Error('Delete failed'))

      const { container } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      const deleteIcon = container.querySelector('svg.lucide-trash')
      await user.click(deleteIcon!)

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to delete todo. Please try again.'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Description Updates', () => {
    it('updates description when todo prop changes', () => {
      const { rerender } = renderWithQueryClient(<TodoItem todo={mockTodo} />)

      expect(screen.getByText('Test todo item')).toBeInTheDocument()

      const updatedTodo = { ...mockTodo, description: 'Changed description' }
      rerender(<TodoItem todo={updatedTodo} />)

      expect(screen.getByText('Changed description')).toBeInTheDocument()
    })
  })
})
