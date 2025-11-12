namespace Todo.Backend.Models.Tests;

public class TodoTests
{
    private const string Bogus = "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness, it was the spring of hope, it was the winter of despair.";
    private readonly DateTime _nowish = DateTime.Now;
    
    [Fact]
    public void Todo_WithEmptyDescription_ShouldThrowArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            Todo.CreateInstance(
                string.Empty, 
                false, 
                _nowish, 
                _nowish)
        );
    }

    [Fact]
    public void Todo_Complete_WhenAlreadyCompleted_ShouldThrowInvalidOperationException()
    {
        var subject = Todo.CreateInstance(
            "The thing",
            true,
            _nowish,
            _nowish);
        Assert.Throws<InvalidOperationException>(() => subject.Complete(_nowish));
    }

    [Fact]
    public void Todo_Complete_ShouldUpdateLastModified()
    {
        var subject = Todo.CreateInstance(
            "The thing",
            false,
            _nowish.AddDays(-1),
            _nowish.AddDays(-1));
        
        subject.Complete(_nowish);
        Assert.Equal(_nowish, subject.LastModified);
        Assert.NotEqual(_nowish, subject.CreatedOn);
    }

    [Fact]
    public void Todo_ResetCompletion_WhenAlreadyIncomplete_ShouldThrowInvalidOperationException()
    {
        var subject = Todo.CreateInstance(
            "The thing",
            false,
            _nowish.AddDays(-1),
            _nowish.AddDays(-1));
        
        Assert.Throws<InvalidOperationException>(() => subject.ResetCompletion(_nowish));
    }

    [Fact]
    public void Todo_ResetCompletion_ShouldUpdateLastModified()
    {
        var subject = Todo.CreateInstance(
            "The thing",
            true,
            _nowish.AddDays(-1),
            _nowish.AddDays(-1));
        
        subject.ResetCompletion(_nowish);
        Assert.Equal(_nowish, subject.LastModified);
        Assert.NotEqual(_nowish, subject.CreatedOn);
    }

    [Fact]
    public void Todo_UpdateDescription_WithEmptyDescription_ShouldThrowArgumentException()
    {
        var subject = Todo.CreateInstance(
            "The thing",
            true,
            _nowish.AddDays(-1),
            _nowish.AddDays(-1));
        
        Assert.Throws<ArgumentException>(() => subject.UpdateDescription(string.Empty, _nowish));
    }

    [Fact]
    public void Todo_DescriptionLongerThanMaxLength_ShouldThrowArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            Todo.CreateInstance(
                Bogus,
                false,
                _nowish,
                _nowish)
        );
    }

    [Fact]
    public void Todo_UpdateDescription_WithDescriptionLongerThanMaxLength_ShouldThrowArgumentException()
    {
        var subject = Todo.CreateInstance(
            "The thing",
            true,
            _nowish.AddDays(-1),
            _nowish.AddDays(-1));
        
        Assert.Throws<ArgumentException>(() => subject.UpdateDescription(Bogus, _nowish));
    }
}
