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

    public async Task UpdateTodoDescriptionAsync(int id, string description)
    {
        var todo = await repository.GetAsync(id);
        todo.UpdateDescription(description, DateTime.UtcNow);
        await repository.UpdateAsync(todo);
    }

    public async Task CompleteTodoAsync(int id)
    {
        var todo = await repository.GetAsync(id);
        todo.Complete(DateTime.UtcNow);
        await repository.UpdateAsync(todo);
    }

    public async Task UncompleteTodoAsync(int id)
    {
        var todo = await repository.GetAsync(id);
        todo.ResetCompletion(DateTime.UtcNow);
        await repository.UpdateAsync(todo);
    }

    public async Task DeleteTodoAsync(int id)
    {
        await repository.DeleteAsync(id);
    }
}
