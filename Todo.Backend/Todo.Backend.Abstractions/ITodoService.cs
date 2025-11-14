namespace Todo.Backend.Abstractions;

public interface ITodoService
{
    Task<Models.Todo> CreateTodoAsync(string description);
    Task<Models.Todo> GetTodoAsync(int id);
    Task<List<Models.Todo>> GetAllTodosAsync();
    Task<Models.Todo> UpdateTodoAsync(int id, string? description, bool? isCompleted);
    Task DeleteTodoAsync(int id);
}
