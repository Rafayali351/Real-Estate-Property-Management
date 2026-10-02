namespace RealEstate.Api.Common;

public class ServiceUnavailableException : Exception
{
    public ServiceUnavailableException(string message) : base(message)
    {
    }

    public ServiceUnavailableException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
