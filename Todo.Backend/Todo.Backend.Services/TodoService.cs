using Todo.Backend.Abstractions;

namespace Todo.Backend.Services;

public class TodoService(ITodoRepository repository) : ITodoService
{
    public async Task<Models.Todo> CreateTodoAsync(string description)
    {
        var now = DateTime.UtcNow;
        var todo = Models.Todo.CreateInstance(
            description: description,
            isCompleted: false,
            createdOn: now,
            lastModified: now
        );

        var id = await repository.CreateAsync(todo);

        // Return a new instance with the ID populated
        return Models.Todo.CreateInstance(
            description: description,
            isCompleted: false,
            createdOn: now,
            lastModified: now,
            id: id
        );
    }

    public async Task<Models.Todo> GetTodoAsync(int id)
    {
        return await repository.GetAsync(id);
    }

    public async Task<List<Models.Todo>> GetAllTodosAsync()
    {
        return await repository.GetAllAsync();
    }

    public async Task<List<Models.Todo>> GetIncompleteTodosAsync()
    {
        return await repository.GetIncompleteAsync();
    }

    public async Task<Models.Todo> UpdateTodoAsync(int id, string? description, bool? isCompleted)
    {
        var todo = await repository.GetAsync(id);
        var now = DateTime.UtcNow;

        if (description is not null)
        {
            todo.UpdateDescription(description, now);
        }

        if (isCompleted is not null)
        {
            if (isCompleted.Value)
            {
                todo.Complete(now);
            }
            else
            {
                todo.ResetCompletion(now);
            }
        }

        await repository.UpdateAsync(todo);
        return todo;
    }

    public async Task DeleteTodoAsync(int id)
    {
        await repository.DeleteAsync(id);
    }
}
