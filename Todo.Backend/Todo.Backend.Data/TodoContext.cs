using Todo.Backend.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Todo.Backend.Data;

public class TodoContext(DbContextOptions<TodoContext> options) : DbContext(options)
{
    public DbSet<TodoEntity> Todos { get; set; }
}