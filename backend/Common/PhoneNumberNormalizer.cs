using System.Text.RegularExpressions;

namespace RealEstate.Api.Common;

public static class PhoneNumberNormalizer
{
    private static readonly Regex DigitsOnlyRegex = new(@"[^\d+]", RegexOptions.Compiled);

    /// <summary>
    /// Normalizes a phone number to standard E.164 format.
    /// Handles Pakistani local numbers (03xx -> +923xx), 0092... -> +92..., and international numbers.
    /// </summary>
    public static string Normalize(string rawPhone, string defaultCountryCode = "+92")
    {
        if (string.IsNullOrWhiteSpace(rawPhone))
        {
            throw new ArgumentException("Phone number cannot be empty.", nameof(rawPhone));
        }

        // Remove spaces, dashes, brackets
        var cleaned = DigitsOnlyRegex.Replace(rawPhone.Trim(), "");

        // If starts with 00, replace with +
        if (cleaned.StartsWith("00"))
        {
            cleaned = "+" + cleaned[2..];
        }

        // If starts with single 0 (e.g. 03001234567 in Pakistan)
        if (cleaned.StartsWith("0") && !cleaned.StartsWith("+"))
        {
            var countryCodeDigits = defaultCountryCode.TrimStart('+');
            cleaned = "+" + countryCodeDigits + cleaned[1..];
        }

        // If doesn't start with +, prepend default country code
        if (!cleaned.StartsWith("+"))
        {
            var countryCodeDigits = defaultCountryCode.TrimStart('+');
            cleaned = "+" + countryCodeDigits + cleaned;
        }

        // Validate E.164 format: + followed by 8 to 15 digits
        if (!Regex.IsMatch(cleaned, @"^\+[1-9]\d{7,14}$"))
        {
            throw new ArgumentException($"Invalid phone number format: '{rawPhone}'. Must be a valid E.164 number.", nameof(rawPhone));
        }

        return cleaned;
    }

    public static bool TryNormalize(string rawPhone, out string normalized, string defaultCountryCode = "+92")
    {
        try
        {
            normalized = Normalize(rawPhone, defaultCountryCode);
            return true;
        }
        catch
        {
            normalized = string.Empty;
            return false;
        }
    }
}
