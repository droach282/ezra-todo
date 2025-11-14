import axios from 'axios'
import type { Todo } from '@/models/todo.ts'
import { ENDPOINTS } from '@/config/api.ts'

export const getTodos = async (): Promise<Array<Todo>> => {
  const response = await axios.get<Array<Todo>>(ENDPOINTS.todos)
  return response.data
}

export const getTodo = async (id: number): Promise<Todo> => {
  const response = await axios.get<Todo>(ENDPOINTS.todos + `/${id}`)
  return response.data
}

export const createTodo = async (description: string): Promise<Todo> => {
  const response = await axios.post<Todo>(ENDPOINTS.todos, { description })
  return response.data
}

export const updateTodo = async (
  id: number,
  updates: { isCompleted?: boolean; description?: string },
): Promise<Todo> => {
  const response = await axios.patch<Todo>(ENDPOINTS.todos + `/${id}`, updates)
  return response.data
}

export const deleteTodo = async (id: number): Promise<void> => {
  await axios.delete(ENDPOINTS.todos + `/${id}`)
}
