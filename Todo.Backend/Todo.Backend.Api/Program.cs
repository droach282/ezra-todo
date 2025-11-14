using Microsoft.EntityFrameworkCore;
using Todo.Backend.Abstractions;
using Todo.Backend.Api;
using Todo.Backend.Data;
using Todo.Backend.Data.Repositories;
using Todo.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();

// Add CORS support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:4173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add validation support for DataAnnotations
builder.Services.AddValidation();

// Add Problem Details support (RFC 7807)
builder.Services.AddProblemDetails();

// Register global exception handler
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Register EF Core DbContext for SQLite
builder.Services.AddDbContext<TodoContext>(options =>
{
    var folder = Environment.SpecialFolder.LocalApplicationData;
    var path = Environment.GetFolderPath(folder);
    var dbPath = Path.Combine(path, "EzraTodo.db");
    options.UseSqlite($"Data Source={dbPath}");
});

// Register repository and service layers
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
builder.Services.AddScoped<ITodoService, TodoService>();

var app = builder.Build();

// Apply database migrations
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TodoContext>();
    context.Database.Migrate();
}

// Configure the HTTP request pipeline
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Enable CORS
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

// Map endpoints
app.MapTodoEndpoints();

app.Run();
