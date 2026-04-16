namespace IracingOverlayStudio.Models;

public sealed class SessionInfo
{
    public string SessionType { get; set; } = "Practice";
    public string TrackName { get; set; } = "Unknown Track";
    public int RemainingTimeSeconds { get; set; }
    public int SessionLaps { get; set; }
    public int LapsRemaining { get; set; }
    public int CurrentLap { get; set; }
    public bool IsGreenFlag { get; set; }
}
