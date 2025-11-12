namespace Todo.Backend.Abstractions;

public interface ITodoRepository
{
    Task<int> CreateAsync(Models.Todo todo);
    Task<Models.Todo> GetAsync(int id);
    Task UpdateAsync(Models.Todo todo);
    Task DeleteAsync(int id);
    Task<List<Models.Todo>> GetAllAsync();
    Task<List<Models.Todo>> GetIncompleteAsync();
}