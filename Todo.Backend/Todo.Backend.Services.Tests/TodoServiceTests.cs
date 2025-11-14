using Moq;
using Todo.Backend.Abstractions;

namespace Todo.Backend.Services.Tests;

public class TodoServiceTests
{
    private readonly Mock<ITodoRepository> _mockRepository;
    private readonly TodoService _service;
    private readonly DateTime _now;

    public TodoServiceTests()
    {
        _mockRepository = new Mock<ITodoRepository>();
        _service = new TodoService(_mockRepository.Object);
        _now = DateTime.UtcNow;
    }

    #region CreateTodoAsync Tests

    [Fact]
    public async Task CreateTodoAsync_ShouldCallRepositoryCreate()
    {
        // Arrange
        const string description = "Test todo";
        const int expectedId = 42;
        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Models.Todo>()))
            .ReturnsAsync(expectedId);

        // Act
        await _service.CreateTodoAsync(description);

        // Assert
        _mockRepository.Verify(r => r.CreateAsync(It.Is<Models.Todo>(t =>
            t.Description == description &&
            !t.IsCompleted
        )), Times.Once);
    }

    [Fact]
    public async Task CreateTodoAsync_ShouldReturnTodoWithIdFromRepository()
    {
        // Arrange
        const string description = "Test todo";
        const int expectedId = 42;
        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Models.Todo>()))
            .ReturnsAsync(expectedId);

        // Act
        var result = await _service.CreateTodoAsync(description);

        // Assert
        Assert.Equal(expectedId, result.Id);
        Assert.Equal(description, result.Description);
        Assert.False(result.IsCompleted);
    }

    [Fact]
    public async Task CreateTodoAsync_ShouldSetUtcTimestamps()
    {
        // Arrange
        const string description = "Test todo";
        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Models.Todo>()))
            .ReturnsAsync(1);

        // Act
        var before = DateTime.UtcNow;
        var result = await _service.CreateTodoAsync(description);
        var after = DateTime.UtcNow;

        // Assert
        Assert.InRange(result.CreatedOn, before.AddSeconds(-1), after.AddSeconds(1));
        Assert.InRange(result.LastModified, before.AddSeconds(-1), after.AddSeconds(1));
        Assert.Equal(result.CreatedOn, result.LastModified);
    }

    [Fact]
    public async Task CreateTodoAsync_WithEmptyDescription_ShouldThrowArgumentException()
    {
        // Arrange & Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _service.CreateTodoAsync(string.Empty));
    }

    #endregion

    #region GetTodoAsync Tests

    [Fact]
    public async Task GetTodoAsync_ShouldCallRepositoryGetWithCorrectId()
    {
        // Arrange
        const int todoId = 42;
        var expectedTodo = Models.Todo.CreateInstance(
            "Test todo",
            false,
            _now,
            _now,
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(expectedTodo);

        // Act
        await _service.GetTodoAsync(todoId);

        // Assert
        _mockRepository.Verify(r => r.GetAsync(todoId), Times.Once);
    }

    [Fact]
    public async Task GetTodoAsync_ShouldReturnTodoFromRepository()
    {
        // Arrange
        const int todoId = 42;
        var expectedTodo = Models.Todo.CreateInstance(
            "Test todo",
            false,
            _now,
            _now,
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(expectedTodo);

        // Act
        var result = await _service.GetTodoAsync(todoId);

        // Assert
        Assert.Equal(expectedTodo, result);
        Assert.Equal(todoId, result.Id);
        Assert.Equal("Test todo", result.Description);
    }

    #endregion

    #region GetAllTodosAsync Tests

    [Fact]
    public async Task GetAllTodosAsync_ShouldCallRepositoryGetAll()
    {
        // Arrange
        var expectedTodos = new List<Models.Todo>
        {
            Models.Todo.CreateInstance("Todo 1", false, _now, _now, 1),
            Models.Todo.CreateInstance("Todo 2", true, _now, _now, 2)
        };
        _mockRepository.Setup(r => r.GetAllAsync())
            .ReturnsAsync(expectedTodos);

        // Act
        await _service.GetAllTodosAsync();

        // Assert
        _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task GetAllTodosAsync_ShouldReturnAllTodosFromRepository()
    {
        // Arrange
        var expectedTodos = new List<Models.Todo>
        {
            Models.Todo.CreateInstance("Todo 1", false, _now, _now, 1),
            Models.Todo.CreateInstance("Todo 2", true, _now, _now, 2),
            Models.Todo.CreateInstance("Todo 3", false, _now, _now, 3)
        };
        _mockRepository.Setup(r => r.GetAllAsync())
            .ReturnsAsync(expectedTodos);

        // Act
        var result = await _service.GetAllTodosAsync();

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Equal(expectedTodos, result);
    }

    [Fact]
    public async Task GetAllTodosAsync_WithEmptyRepository_ShouldReturnEmptyList()
    {
        // Arrange
        _mockRepository.Setup(r => r.GetAllAsync())
            .ReturnsAsync(new List<Models.Todo>());

        // Act
        var result = await _service.GetAllTodosAsync();

        // Assert
        Assert.Empty(result);
    }

    #endregion

    #region UpdateTodoAsync Tests

    [Fact]
    public async Task UpdateTodoAsync_WithDescriptionOnly_ShouldUpdateDescription()
    {
        // Arrange
        const int todoId = 42;
        const string newDescription = "Updated description";
        var todo = Models.Todo.CreateInstance(
            "Original description",
            false,
            _now.AddDays(-1),
            _now.AddDays(-1),
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(todo);

        // Act
        var result = await _service.UpdateTodoAsync(todoId, newDescription, null);

        // Assert
        Assert.Equal(newDescription, result.Description);
        Assert.False(result.IsCompleted);
        _mockRepository.Verify(r => r.UpdateAsync(It.Is<Models.Todo>(t =>
            t.Description == newDescription &&
            t.Id == todoId
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateTodoAsync_WithIsCompletedTrue_ShouldCompleteTodo()
    {
        // Arrange
        const int todoId = 42;
        var todo = Models.Todo.CreateInstance(
            "Test todo",
            false,
            _now.AddDays(-1),
            _now.AddDays(-1),
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(todo);

        // Act
        var result = await _service.UpdateTodoAsync(todoId, null, true);

        // Assert
        Assert.True(result.IsCompleted);
        Assert.Equal("Test todo", result.Description);
        _mockRepository.Verify(r => r.UpdateAsync(It.Is<Models.Todo>(t =>
            t.IsCompleted &&
            t.Id == todoId
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateTodoAsync_WithIsCompletedFalse_ShouldResetCompletion()
    {
        // Arrange
        const int todoId = 42;
        var todo = Models.Todo.CreateInstance(
            "Test todo",
            true,
            _now.AddDays(-1),
            _now.AddDays(-1),
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(todo);

        // Act
        var result = await _service.UpdateTodoAsync(todoId, null, false);

        // Assert
        Assert.False(result.IsCompleted);
        Assert.Equal("Test todo", result.Description);
        _mockRepository.Verify(r => r.UpdateAsync(It.Is<Models.Todo>(t =>
            !t.IsCompleted &&
            t.Id == todoId
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateTodoAsync_WithBothParameters_ShouldUpdateBoth()
    {
        // Arrange
        const int todoId = 42;
        const string newDescription = "Updated description";
        var todo = Models.Todo.CreateInstance(
            "Original description",
            false,
            _now.AddDays(-1),
            _now.AddDays(-1),
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(todo);

        // Act
        var result = await _service.UpdateTodoAsync(todoId, newDescription, true);

        // Assert
        Assert.Equal(newDescription, result.Description);
        Assert.True(result.IsCompleted);
        _mockRepository.Verify(r => r.UpdateAsync(It.Is<Models.Todo>(t =>
            t.Description == newDescription &&
            t.IsCompleted &&
            t.Id == todoId
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateTodoAsync_WithNullParameters_ShouldNotUpdateAnything()
    {
        // Arrange
        const int todoId = 42;
        const string originalDescription = "Original description";
        var todo = Models.Todo.CreateInstance(
            originalDescription,
            false,
            _now.AddDays(-1),
            _now.AddDays(-1),
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(todo);

        // Act
        var result = await _service.UpdateTodoAsync(todoId, null, null);

        // Assert
        Assert.Equal(originalDescription, result.Description);
        Assert.False(result.IsCompleted);
        _mockRepository.Verify(r => r.UpdateAsync(It.Is<Models.Todo>(t =>
            t.Description == originalDescription &&
            !t.IsCompleted &&
            t.Id == todoId
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateTodoAsync_ShouldUpdateLastModifiedTimestamp()
    {
        // Arrange
        const int todoId = 42;
        var oldTimestamp = _now.AddDays(-1);
        var todo = Models.Todo.CreateInstance(
            "Test todo",
            false,
            oldTimestamp,
            oldTimestamp,
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(todo);

        // Act
        var before = DateTime.UtcNow;
        var result = await _service.UpdateTodoAsync(todoId, "New description", null);
        var after = DateTime.UtcNow;

        // Assert
        Assert.InRange(result.LastModified, before.AddSeconds(-1), after.AddSeconds(1));
        Assert.NotEqual(oldTimestamp, result.LastModified);
        Assert.Equal(oldTimestamp, result.CreatedOn); // CreatedOn should not change
    }

    [Fact]
    public async Task UpdateTodoAsync_WithEmptyDescription_ShouldThrowArgumentException()
    {
        // Arrange
        const int todoId = 42;
        var todo = Models.Todo.CreateInstance(
            "Test todo",
            false,
            _now,
            _now,
            todoId);
        _mockRepository.Setup(r => r.GetAsync(todoId))
            .ReturnsAsync(todo);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _service.UpdateTodoAsync(todoId, string.Empty, null));
    }

    #endregion

    #region DeleteTodoAsync Tests

    [Fact]
    public async Task DeleteTodoAsync_ShouldCallRepositoryDeleteWithCorrectId()
    {
        // Arrange
        const int todoId = 42;
        _mockRepository.Setup(r => r.DeleteAsync(todoId))
            .Returns(Task.CompletedTask);

        // Act
        await _service.DeleteTodoAsync(todoId);

        // Assert
        _mockRepository.Verify(r => r.DeleteAsync(todoId), Times.Once);
    }

    [Fact]
    public async Task DeleteTodoAsync_ShouldCompleteSuccessfully()
    {
        // Arrange
        const int todoId = 42;
        _mockRepository.Setup(r => r.DeleteAsync(todoId))
            .Returns(Task.CompletedTask);

        // Act
        var task = _service.DeleteTodoAsync(todoId);

        // Assert
        await task; // Should not throw
        Assert.True(task.IsCompletedSuccessfully);
    }

    #endregion
}
