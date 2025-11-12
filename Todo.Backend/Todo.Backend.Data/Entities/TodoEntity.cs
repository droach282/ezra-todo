using System.ComponentModel.DataAnnotations;

namespace Todo.Backend.Data.Entities;

public class TodoEntity
{
    public int Id { get; init; }
    [MaxLength(80)]
    public required string Description { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedOn { get; init; }
    public DateTime LastModified { get; set; }
}