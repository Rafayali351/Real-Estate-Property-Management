using System.Security.Claims;
using RealEstate.Api.Models;

namespace RealEstate.Api.Services;

public interface ITokenService
{
    string GenerateSessionToken(User user);
    string GenerateChallengeToken(int userId, string purpose);
    bool ValidateChallengeToken(string token, out int userId, out string purpose);
    ClaimsPrincipal? GetPrincipalFromToken(string token);
}
