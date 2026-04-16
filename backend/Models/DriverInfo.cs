namespace IracingOverlayStudio.Models;

public sealed class DriverInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CarNumber { get; set; } = string.Empty;
    public string CountryCode { get; set; } = "UN";
    public int IRating { get; set; }
    public string Team { get; set; } = string.Empty;
}
