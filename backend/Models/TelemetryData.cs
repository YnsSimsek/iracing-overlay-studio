namespace IracingOverlayStudio.Models;

public sealed class TelemetryData
{
    public double SpeedKph { get; set; }
    public int Rpm { get; set; }
    public int Gear { get; set; }
    public double Throttle { get; set; }
    public double Brake { get; set; }
    public double FuelLiters { get; set; }
}
