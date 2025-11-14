using System.ComponentModel.DataAnnotations;
using Todo.Backend.Api.Validation;

namespace Todo.Backend.Api.Tests;

public class NotWhitespaceAttributeTests
{
    private readonly NotWhitespaceAttribute _attribute = new();

    [Fact]
    public void IsValid_WithValidString_ReturnsSuccess()
    {
        // Arrange
        var context = new ValidationContext(new object()) { MemberName = "Description" };
        const string validValue = "Valid description";

        // Act
        var result = _attribute.GetValidationResult(validValue, context);

        // Assert
        Assert.Equal(ValidationResult.Success, result);
    }

    [Fact]
    public void IsValid_WithNull_ReturnsSuccess()
    {
        // Arrange
        // Note: [Required] attribute handles null validation, not [NotWhitespace]
        var context = new ValidationContext(new object()) { MemberName = "Description" };

        // Act
        var result = _attribute.GetValidationResult(null, context);

        // Assert
        Assert.Equal(ValidationResult.Success, result);
    }

    [Fact]
    public void IsValid_WithEmptyString_ReturnsFailure()
    {
        // Arrange
        var context = new ValidationContext(new object()) { MemberName = "Description" };
        const string emptyValue = "";

        // Act
        var result = _attribute.GetValidationResult(emptyValue, context);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("cannot be empty or whitespace", result.ErrorMessage);
    }

    [Fact]
    public void IsValid_WithWhitespaceOnly_ReturnsFailure()
    {
        // Arrange
        var context = new ValidationContext(new object()) { MemberName = "Description" };
        const string whitespaceValue = "   ";

        // Act
        var result = _attribute.GetValidationResult(whitespaceValue, context);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("cannot be empty or whitespace", result.ErrorMessage);
    }

    [Fact]
    public void IsValid_WithTabsAndSpaces_ReturnsFailure()
    {
        // Arrange
        var context = new ValidationContext(new object()) { MemberName = "Description" };
        const string whitespaceValue = "\t\n  \r\n";

        // Act
        var result = _attribute.GetValidationResult(whitespaceValue, context);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("cannot be empty or whitespace", result.ErrorMessage);
    }

    [Fact]
    public void IsValid_WithStringContainingWhitespace_ReturnsSuccess()
    {
        // Arrange
        var context = new ValidationContext(new object()) { MemberName = "Description" };
        const string validValue = "Valid description with spaces";

        // Act
        var result = _attribute.GetValidationResult(validValue, context);

        // Assert
        Assert.Equal(ValidationResult.Success, result);
    }

    [Fact]
    public void IsValid_WithLeadingAndTrailingWhitespace_ReturnsSuccess()
    {
        // Arrange
        var context = new ValidationContext(new object()) { MemberName = "Description" };
        const string validValue = "  Valid description  ";

        // Act
        var result = _attribute.GetValidationResult(validValue, context);

        // Assert
        Assert.Equal(ValidationResult.Success, result);
    }

    [Fact]
    public void IsValid_WithNonStringValue_ReturnsSuccess()
    {
        // Arrange
        var context = new ValidationContext(new object()) { MemberName = "SomeProperty" };
        const int nonStringValue = 42;

        // Act
        var result = _attribute.GetValidationResult(nonStringValue, context);

        // Assert
        Assert.Equal(ValidationResult.Success, result);
    }
}
