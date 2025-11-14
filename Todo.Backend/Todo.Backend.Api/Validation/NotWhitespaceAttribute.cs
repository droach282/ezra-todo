using System.ComponentModel.DataAnnotations;

namespace Todo.Backend.Api.Validation;

/// <summary>
/// Validates that a string is not null, empty, or consists only of whitespace characters.
/// </summary>
public class NotWhitespaceAttribute() : ValidationAttribute("The {0} field cannot be empty or whitespace.")
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        // Null values are handled by [Required] attribute, not by this validator
        if (value is not string stringValue)
        {
            return ValidationResult.Success;
        }

        if (string.IsNullOrWhiteSpace(stringValue))
        {
            return new ValidationResult(
                FormatErrorMessage(validationContext.DisplayName),
                [validationContext.MemberName ?? string.Empty]
            );
        }

        return ValidationResult.Success;
    }
}
