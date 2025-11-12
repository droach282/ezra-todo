namespace Todo.Backend.Abstractions;

public interface ITodoService
{
    Task<Models.Todo> CreateTodoAsync(string description);
    Task<Models.Todo> GetTodoAsync(int id);
    Task<List<Models.Todo>> GetAllTodosAsync();
    Task<List<Models.Todo>> GetIncompleteTodosAsync();
    Task UpdateTodoDescriptionAsync(int id, string description);
    Task CompleteTodoAsync(int id);
    Task UncompleteTodoAsync(int id);
    Task DeleteTodoAsync(int id);
}
