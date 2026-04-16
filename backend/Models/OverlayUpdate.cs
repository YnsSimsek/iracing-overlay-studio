namespace IracingOverlayStudio.Models;

public sealed class OverlayUpdate
{
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    public TelemetryData Telemetry { get; set; } = new();
    public SessionInfo Session { get; set; } = new();
    public List<StandingEntry> Standings { get; set; } = new();
}
