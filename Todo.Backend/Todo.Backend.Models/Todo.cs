namespace Todo.Backend.Models;

public class Todo
{
    public int Id { get; }
    public string Description { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime CreatedOn { get; private set; }
    public DateTime LastModified { get; private set; }

    private Todo(int id, string description, bool isCompleted, DateTime createdOn, DateTime lastModified)
    {
        Id = id;
        Description = description;
        IsCompleted = isCompleted;
        CreatedOn = createdOn;
        LastModified = lastModified;
    }

    public static Todo CreateInstance(string description, bool isCompleted, DateTime createdOn, DateTime lastModified, int id = 0)
    {
        ValidateDescription(description);
        return new Todo(id, description, isCompleted, createdOn, lastModified);
    }

    public void Complete(DateTime lastModified)
    {
        if (IsCompleted)
        {
            throw new InvalidOperationException("Cannot complete a completed todo.");
        }
        LastModified = lastModified;
        IsCompleted = true;
    }
    
    public void ResetCompletion(DateTime lastModified)
    {
        if (!IsCompleted)
        {
            throw new InvalidOperationException("Cannot reset completion on an incomplete todo.");
        }
        LastModified = lastModified;
        IsCompleted = false;
    }
    
    public void UpdateDescription(string description, DateTime lastModified)
    {
        ValidateDescription(description);
        Description = description;
        LastModified = lastModified;
    }

    private static void ValidateDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException("Description cannot be empty.", nameof(description));
        }

        if (description.Length > 80)
        {
            throw new ArgumentException("Description cannot exceed 80 characters.", nameof(description));
        }
    }
}