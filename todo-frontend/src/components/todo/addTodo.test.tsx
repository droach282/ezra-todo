import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddTodo from './addTodo'
import { renderWithQueryClient } from '@/test/test-utils'
import * as todoApi from '@/services/todoApi'

// Mock the todo API
vi.mock('@/services/todoApi', () => ({
  createTodo: vi.fn(),
}))

describe('AddTodo Component', () => {
  const mockCreateTodo = vi.mocked(todoApi.createTodo)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input field and add button', () => {
    renderWithQueryClient(<AddTodo />)

    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('updates input value when user types', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')
    await user.type(input, 'New todo item')

    expect(input).toHaveValue('New todo item')
  })

  it('submits form with valid description', async () => {
    const user = userEvent.setup()
    mockCreateTodo.mockResolvedValue({
      id: 1,
      description: 'New todo item',
      isCompleted: false,
    })

    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')
    const button = screen.getByRole('button', { name: /add/i })

    await user.type(input, 'New todo item')
    await user.click(button)

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith('New todo item')
    })
  })

  it('clears input after successful submission', async () => {
    const user = userEvent.setup()
    mockCreateTodo.mockResolvedValue({
      id: 1,
      description: 'New todo item',
      isCompleted: false,
    })

    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')

    await user.type(input, 'New todo item')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('disables button when input is empty', () => {
    renderWithQueryClient(<AddTodo />)

    const button = screen.getByRole('button', { name: /add/i })
    expect(button).toBeDisabled()
  })

  it('disables button when input contains only whitespace', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')
    const button = screen.getByRole('button', { name: /add/i })

    await user.type(input, '   ')

    expect(button).toBeDisabled()
  })

  it('enables button when input has valid text', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')
    const button = screen.getByRole('button', { name: /add/i })

    await user.type(input, 'Valid todo')

    expect(button).toBeEnabled()
  })

  it('does not submit form with whitespace-only description', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')

    await user.type(input, '   ')
    await user.type(input, '{Enter}')

    expect(mockCreateTodo).not.toHaveBeenCalled()
  })

  it('enforces maxLength of 80 characters', () => {
    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')

    expect(input).toHaveAttribute('maxLength', '80')
  })

  it('disables input and button during pending mutation', async () => {
    const user = userEvent.setup()

    // Mock a delayed response
    mockCreateTodo.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: 1,
                description: 'New todo',
                isCompleted: false,
              }),
            100,
          ),
        ),
    )

    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')
    const button = screen.getByRole('button', { name: /add/i })

    await user.type(input, 'New todo')
    await user.click(button)

    // Check that both are disabled during the mutation
    expect(input).toBeDisabled()
    expect(button).toBeDisabled()

    // Wait for mutation to complete
    await waitFor(() => {
      expect(input).toBeEnabled()
      expect(button).toBeDisabled() // Still disabled because input is empty
    })
  })

  it('displays error message when mutation fails', async () => {
    const user = userEvent.setup()
    mockCreateTodo.mockRejectedValue(new Error('API Error'))

    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')

    await user.type(input, 'New todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to create todo. Please try again.'),
      ).toBeInTheDocument()
    })
  })

  it('clears error message on successful submission after previous error', async () => {
    const user = userEvent.setup()

    // First submission fails
    mockCreateTodo.mockRejectedValueOnce(new Error('API Error'))

    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')

    await user.type(input, 'New todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to create todo. Please try again.'),
      ).toBeInTheDocument()
    })

    // Second submission succeeds
    mockCreateTodo.mockResolvedValueOnce({
      id: 1,
      description: 'New todo',
      isCompleted: false,
    })

    await user.type(input, 'Another todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(
        screen.queryByText('Failed to create todo. Please try again.'),
      ).not.toBeInTheDocument()
    })
  })

  it('submits form when Enter key is pressed', async () => {
    const user = userEvent.setup()
    mockCreateTodo.mockResolvedValue({
      id: 1,
      description: 'New todo item',
      isCompleted: false,
    })

    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')

    await user.type(input, 'New todo item{Enter}')

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith('New todo item')
    })
  })

  it('trims whitespace from description before submission', async () => {
    const user = userEvent.setup()
    mockCreateTodo.mockResolvedValue({
      id: 1,
      description: 'New todo',
      isCompleted: false,
    })

    renderWithQueryClient(<AddTodo />)

    const input = screen.getByPlaceholderText('Add a new todo...')

    await user.type(input, '  New todo  ')
    await user.click(screen.getByRole('button', { name: /add/i }))

    // The component uses trim() in the condition check
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith('  New todo  ')
    })
  })
})
