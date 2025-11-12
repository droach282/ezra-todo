using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Todo.Backend.Abstractions;

namespace Todo.Backend.Api;

public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/todos")
            .WithTags("Todos");

        group.MapGet("/", GetAllTodos)
            .WithName("GetAllTodos");

        group.MapGet("/incomplete", GetIncompleteTodos)
            .WithName("GetIncompleteTodos");

        group.MapGet("/{id:int}", GetTodoById)
            .WithName("GetTodoById");

        group.MapPost("/", CreateTodo)
            .WithName("CreateTodo");

        group.MapPut("/{id:int}/description", UpdateTodoDescription)
            .WithName("UpdateTodoDescription");

        group.MapPut("/{id:int}/complete", CompleteTodo)
            .WithName("CompleteTodo");

        group.MapPut("/{id:int}/uncomplete", UncompleteTodo)
            .WithName("UncompleteTodo");

        group.MapDelete("/{id:int}", DeleteTodo)
            .WithName("DeleteTodo");

        return app;
    }

    private static async Task<Ok<List<Models.Todo>>> GetAllTodos(ITodoService todoService)
    {
        var todos = await todoService.GetAllTodosAsync();
        return TypedResults.Ok(todos);
    }

    private static async Task<Ok<List<Models.Todo>>> GetIncompleteTodos(ITodoService todoService)
    {
        var todos = await todoService.GetIncompleteTodosAsync();
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

    private static async Task<Ok<Models.Todo>> UpdateTodoDescription(
        int id,
        UpdateDescriptionRequest request,
        ITodoService todoService)
    {
        await todoService.UpdateTodoDescriptionAsync(id, request.Description);
        var todo = await todoService.GetTodoAsync(id);
        return TypedResults.Ok(todo);
    }

    private static async Task<Ok<Models.Todo>> CompleteTodo(
        int id,
        ITodoService todoService)
    {
        await todoService.CompleteTodoAsync(id);
        var todo = await todoService.GetTodoAsync(id);
        return TypedResults.Ok(todo);
    }

    private static async Task<Ok<Models.Todo>> UncompleteTodo(
        int id,
        ITodoService todoService)
    {
        await todoService.UncompleteTodoAsync(id);
        var todo = await todoService.GetTodoAsync(id);
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
    [StringLength(80, MinimumLength = 1, ErrorMessage = "Description must be between 1 and 80 characters.")]
    string Description);

public record UpdateDescriptionRequest(
    [Required(ErrorMessage = "Description is required.")]
    [StringLength(80, MinimumLength = 1, ErrorMessage = "Description must be between 1 and 80 characters.")]
    string Description);
