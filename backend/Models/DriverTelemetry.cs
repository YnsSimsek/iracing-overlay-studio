namespace IracingOverlayStudio.Models;

public sealed class DriverTelemetry
{
    public int DriverId { get; set; }
    public double SpeedKph { get; set; }
    public int Gear { get; set; }
    public double Throttle { get; set; }
    public double Brake { get; set; }
}
