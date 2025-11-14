import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import type { RenderOptions } from '@testing-library/react'

/**
 * Creates a new QueryClient for testing with default options
 * that disable retries and set cache time to 0
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

/**
 * Custom render function that wraps components with QueryClientProvider
 * Use this instead of @testing-library/react's render for components that use queries/mutations
 */
export function renderWithQueryClient(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } =
    options ?? {}

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
