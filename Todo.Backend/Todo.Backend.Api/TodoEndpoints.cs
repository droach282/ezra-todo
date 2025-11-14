using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Todo.Backend.Abstractions;
using Todo.Backend.Api.Validation;

namespace Todo.Backend.Api;

public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/todos")
            .WithTags("Todos");

        group.MapGet("/", GetAllTodos)
            .WithName("GetAllTodos");

        group.MapGet("/{id:int}", GetTodoById)
            .WithName("GetTodoById");

        group.MapPost("/", CreateTodo)
            .WithName("CreateTodo");

        group.MapPatch("/{id:int}", UpdateTodo)
            .WithName("UpdateTodo");

        group.MapDelete("/{id:int}", DeleteTodo)
            .WithName("DeleteTodo");

        return app;
    }

    private static async Task<Ok<List<Models.Todo>>> GetAllTodos(ITodoService todoService)
    {
        var todos = await todoService.GetAllTodosAsync();
        return TypedResults.Ok(todos);
    }

    private static async Task<Ok<Models.Todo>> GetTodoById(
        int id,
        ITodoService todoService)
    {
        var todo = await todoService.GetTodoAsync(id);
        return TypedResults.Ok(todo);
    }

    private static async Task<Created<Models.Todo>> CreateTodo(
        CreateTodoRequest request,
        ITodoService todoService)
    {
        var todo = await todoService.CreateTodoAsync(request.Description);
        return TypedResults.Created($"/todos/{todo.Id}", todo);
    }

    private static async Task<Ok<Models.Todo>> UpdateTodo(
        int id,
        UpdateTodoRequest request,
        ITodoService todoService)
    {
        var todo = await todoService.UpdateTodoAsync(id, request.Description, request.IsCompleted);
        return TypedResults.Ok(todo);
    }

    private static async Task<NoContent> DeleteTodo(
        int id,
        ITodoService todoService)
    {
        await todoService.DeleteTodoAsync(id);
        return TypedResults.NoContent();
    }
}

// DTOs
public record CreateTodoRequest(
    [Required(ErrorMessage = "Description is required.")]
    [NotWhitespace]
    [StringLength(80, ErrorMessage = "Description cannot exceed 80 characters.")]
    string Description);

public record UpdateTodoRequest(
    [NotWhitespace]
    [StringLength(80, ErrorMessage = "Description cannot exceed 80 characters.")]
    string? Description,
    bool? IsCompleted);
