namespace IracingOverlayStudio.Models;

public sealed class OverlayUpdate
{
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    public bool IsSnapshot { get; set; } = true;
    public int PlayerDriverId { get; set; }
    public TelemetryData Telemetry { get; set; } = new();
    public List<DriverTelemetry> DriverTelemetry { get; set; } = new();
    public SessionInfo Session { get; set; } = new();
    public List<DriverStandings> Standings { get; set; } = new();
    public List<int> ChangedDriverIds { get; set; } = new();
}
