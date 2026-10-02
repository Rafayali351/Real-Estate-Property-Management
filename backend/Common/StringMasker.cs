namespace RealEstate.Api.Common;

public static class StringMasker
{
    public static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            return email;
        }

        var parts = email.Split('@', 2);
        var name = parts[0];
        var domain = parts[1];

        if (name.Length <= 2)
        {
            return $"{name[0]}*@{domain}";
        }

        var first = name[0];
        var last = name[^1];
        var stars = new string('*', Math.Min(4, name.Length - 2));

        return $"{first}{stars}{last}@{domain}";
    }

    public static string MaskPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return phone;
        }

        var cleaned = phone.Trim();
        if (cleaned.Length <= 5)
        {
            return "***" + cleaned[^2..];
        }

        // e.g. +923001234567 -> +92 *** ***4567
        var prefix = cleaned.Length >= 3 ? cleaned[..3] : "+92";
        var last4 = cleaned[^4..];

        return $"{prefix} *** ***{last4}";
    }
}
