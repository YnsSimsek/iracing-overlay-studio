namespace IracingOverlayStudio.Models;

public sealed class StandingEntry
{
    public int Position { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string CarNumber { get; set; } = string.Empty;
    public double GapToLeader { get; set; }
    public double LastLapTime { get; set; }
}
