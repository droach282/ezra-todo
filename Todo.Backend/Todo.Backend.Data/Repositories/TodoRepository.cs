using Todo.Backend.Data;
using Todo.Backend.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Todo.Backend.Abstractions;

namespace Todo.Backend.Data.Repositories;

public class TodoRepository(TodoContext context) : ITodoRepository
{
    public async Task<int> CreateAsync(Todo.Backend.Models.Todo todo)
    {
        var entity = new TodoEntity
        {
            Description = todo.Description,
            IsCompleted = todo.IsCompleted,
            CreatedOn = todo.CreatedOn,
            LastModified = todo.LastModified
        };

        context.Todos.Add(entity);
        await context.SaveChangesAsync();

        return entity.Id;
    }

    public async Task<Todo.Backend.Models.Todo> GetAsync(int id)
    {
        var entity = await context.Todos.FindAsync(id);

        if (entity == null)
        {
            throw new KeyNotFoundException($"Todo with ID {id} not found.");
        }

        return MapToModel(entity);
    }

    public async Task UpdateAsync(Todo.Backend.Models.Todo todo)
    {
        var entity = await context.Todos.FindAsync(todo.Id);

        if (entity == null)
        {
            throw new KeyNotFoundException($"Todo with ID {todo.Id} not found.");
        }

        entity.Description = todo.Description;
        entity.IsCompleted = todo.IsCompleted;
        entity.LastModified = todo.LastModified;

        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await context.Todos.FindAsync(id);

        if (entity == null)
        {
            throw new KeyNotFoundException($"Todo with ID {id} not found.");
        }

        context.Todos.Remove(entity);
        await context.SaveChangesAsync();
    }

    public async Task<List<Todo.Backend.Models.Todo>> GetAllAsync()
    {
        var entities = await context.Todos.ToListAsync();
        return entities.Select(MapToModel).ToList();
    }

    private static Todo.Backend.Models.Todo MapToModel(TodoEntity entity)
    {
        return Todo.Backend.Models.Todo.CreateInstance(
            description: entity.Description,
            isCompleted: entity.IsCompleted,
            createdOn: entity.CreatedOn,
            lastModified: entity.LastModified,
            id: entity.Id
        );
    }
}