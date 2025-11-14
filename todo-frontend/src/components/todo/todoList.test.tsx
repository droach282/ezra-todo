import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoList from './todoList'
import type { Todo } from '@/models/todo'
import { renderWithQueryClient } from '@/test/test-utils'
import * as todoApi from '@/services/todoApi'

// Mock the todo API
vi.mock('@/services/todoApi', () => ({
  getTodos: vi.fn(),
}))

// Mock child components to focus on TodoList behavior
vi.mock('./todoItem', () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`todo-item-${todo.id}`}>
      {todo.description} - {todo.isCompleted ? 'completed' : 'incomplete'}
    </div>
  ),
}))

vi.mock('./addTodo', () => ({
  default: () => <div data-testid="add-todo">Add Todo Component</div>,
}))

describe('TodoList Component', () => {
  const mockGetTodos = vi.mocked(todoApi.getTodos)

  const mockTodos: Array<Todo> = [
    { id: 1, description: 'Buy groceries', isCompleted: false },
    { id: 2, description: 'Walk the dog', isCompleted: true },
    { id: 3, description: 'Write tests', isCompleted: false },
    { id: 4, description: 'Review PRs', isCompleted: true },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('displays loading message while fetching todos', () => {
      mockGetTodos.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      renderWithQueryClient(<TodoList />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('displays error message when fetch fails', async () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockGetTodos.mockRejectedValue(new Error('Failed to fetch'))

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByText('Sorry, an error occurred.'),
        ).toBeInTheDocument()
      })

      // Verify console.error was called with the error
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('does not render todos or filter button on error', async () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockGetTodos.mockRejectedValue(new Error('Failed to fetch'))

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByText('Sorry, an error occurred.'),
        ).toBeInTheDocument()
      })

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByTestId(/todo-item/)).not.toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Successful Data Loading', () => {
    it('renders all todos when data loads successfully', async () => {
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
        expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
        expect(screen.getByTestId('todo-item-3')).toBeInTheDocument()
        expect(screen.getByTestId('todo-item-4')).toBeInTheDocument()
      })
    })

    it('renders AddTodo component', async () => {
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('add-todo')).toBeInTheDocument()
      })
    })

    it('renders filter toggle button', async () => {
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show incomplete/i }),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Empty Todo List', () => {
    it('renders AddTodo when there are no todos', async () => {
      mockGetTodos.mockResolvedValue([])

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('add-todo')).toBeInTheDocument()
      })
    })

    it('renders filter button even with empty list', async () => {
      mockGetTodos.mockResolvedValue([])

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show incomplete/i }),
        ).toBeInTheDocument()
      })
    })

    it('does not render any TodoItems when list is empty', async () => {
      mockGetTodos.mockResolvedValue([])

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('add-todo')).toBeInTheDocument()
      })

      expect(screen.queryByTestId(/todo-item/)).not.toBeInTheDocument()
    })
  })

  describe('Filter Functionality', () => {
    it('initially shows all todos', async () => {
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
        expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
        expect(screen.getByTestId('todo-item-3')).toBeInTheDocument()
        expect(screen.getByTestId('todo-item-4')).toBeInTheDocument()
      })
    })

    it('shows only incomplete todos when filter is toggled on', async () => {
      const user = userEvent.setup()
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show incomplete/i }),
        ).toBeInTheDocument()
      })

      const filterButton = screen.getByRole('button', {
        name: /show incomplete/i,
      })
      await user.click(filterButton)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show all/i }),
        ).toBeInTheDocument()
      })

      // Incomplete todos should be visible
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument() // incomplete
      expect(screen.getByTestId('todo-item-3')).toBeInTheDocument() // incomplete

      // Completed todos should not be visible
      expect(screen.queryByTestId('todo-item-2')).not.toBeInTheDocument() // completed
      expect(screen.queryByTestId('todo-item-4')).not.toBeInTheDocument() // completed
    })

    it('shows all todos when filter is toggled back off', async () => {
      const user = userEvent.setup()
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show incomplete/i }),
        ).toBeInTheDocument()
      })

      const filterButton = screen.getByRole('button', {
        name: /show incomplete/i,
      })

      // Toggle filter on
      await user.click(filterButton)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show all/i }),
        ).toBeInTheDocument()
      })

      // Toggle filter off
      const showAllButton = screen.getByRole('button', { name: /show all/i })
      await user.click(showAllButton)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show incomplete/i }),
        ).toBeInTheDocument()
      })

      // All todos should be visible again
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-3')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-4')).toBeInTheDocument()
    })

    it('updates button text when filter is toggled', async () => {
      const user = userEvent.setup()
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show incomplete/i }),
        ).toBeInTheDocument()
      })

      const filterButton = screen.getByRole('button', {
        name: /show incomplete/i,
      })
      await user.click(filterButton)

      expect(
        screen.getByRole('button', { name: /show all/i }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /show incomplete/i }),
      ).not.toBeInTheDocument()
    })

    it('updates button styling when filter is toggled', async () => {
      const user = userEvent.setup()
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /show incomplete/i }),
        ).toBeInTheDocument()
      })

      const filterButton = screen.getByRole('button', {
        name: /show incomplete/i,
      })

      // Initially should have default styling
      expect(filterButton).toHaveClass('bg-white')
      expect(filterButton).not.toHaveClass('bg-blue-600')

      await user.click(filterButton)

      const activeButton = screen.getByRole('button', { name: /show all/i })

      // When active should have blue styling
      expect(activeButton).toHaveClass('bg-blue-600')
      expect(activeButton).not.toHaveClass('bg-white')
    })
  })

  describe('Filter with All Completed Todos', () => {
    it('shows no todos when all are completed and filter is on', async () => {
      const user = userEvent.setup()
      const completedTodos: Array<Todo> = [
        { id: 1, description: 'Task 1', isCompleted: true },
        { id: 2, description: 'Task 2', isCompleted: true },
      ]

      mockGetTodos.mockResolvedValue(completedTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      })

      const filterButton = screen.getByRole('button', {
        name: /show incomplete/i,
      })
      await user.click(filterButton)

      await waitFor(() => {
        expect(screen.queryByTestId(/todo-item/)).not.toBeInTheDocument()
      })

      // AddTodo should still be visible
      expect(screen.getByTestId('add-todo')).toBeInTheDocument()

      // Empty message should now be visible
      expect(screen.queryByText('You have no todos.')).toBeInTheDocument()
    })
  })

  describe('Filter with All Incomplete Todos', () => {
    it('shows all todos when all are incomplete and filter is on', async () => {
      const user = userEvent.setup()
      const incompleteTodos: Array<Todo> = [
        { id: 1, description: 'Task 1', isCompleted: false },
        { id: 2, description: 'Task 2', isCompleted: false },
      ]

      mockGetTodos.mockResolvedValue(incompleteTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      })

      const filterButton = screen.getByRole('button', {
        name: /show incomplete/i,
      })
      await user.click(filterButton)

      // All todos should still be visible since they're all incomplete
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
    })
  })

  describe('TodoItem Rendering', () => {
    it('passes correct todo props to TodoItem components', async () => {
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(
          screen.getByText('Buy groceries - incomplete'),
        ).toBeInTheDocument()
        expect(screen.getByText('Walk the dog - completed')).toBeInTheDocument()
        expect(screen.getByText('Write tests - incomplete')).toBeInTheDocument()
        expect(screen.getByText('Review PRs - completed')).toBeInTheDocument()
      })
    })

    it('renders todos in the order they are received', async () => {
      mockGetTodos.mockResolvedValue(mockTodos)

      const { container } = renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      })

      const todoItems = container.querySelectorAll('[data-testid^="todo-item"]')
      expect(todoItems[0]).toHaveAttribute('data-testid', 'todo-item-1')
      expect(todoItems[1]).toHaveAttribute('data-testid', 'todo-item-2')
      expect(todoItems[2]).toHaveAttribute('data-testid', 'todo-item-3')
      expect(todoItems[3]).toHaveAttribute('data-testid', 'todo-item-4')
    })

    it('should display a message when there are no todo items', async () => {
      mockGetTodos.mockResolvedValue([])

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.queryByText('You have no todos.')).toBeInTheDocument();
      })
    })

    it('should not display a message when there are todo items', async () => {
      mockGetTodos.mockResolvedValue(mockTodos)

      renderWithQueryClient(<TodoList />)

      await waitFor(() => {
        expect(screen.queryByText('You have no todos.')).not.toBeInTheDocument();
      })
    })
  })
})
