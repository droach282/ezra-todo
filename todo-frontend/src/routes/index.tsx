import { createFileRoute } from '@tanstack/react-router'
import TodoList from '@/components/todo/todoList.tsx'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <TodoList />
    </div>
  )
}
