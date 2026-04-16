namespace IracingOverlayStudio.Models;

public sealed class DriverStandings
{
    public int DriverId { get; set; }
    public int Position { get; set; }
    public int PositionChange { get; set; }
    public int CurrentLap { get; set; }
    public string PitStatus { get; set; } = "Out";
    public double GapToLeader { get; set; }
    public double IntervalToNext { get; set; }
    public double BestLapTime { get; set; }
    public double LastLapTime { get; set; }
    public bool IsCurrentPlayer { get; set; }
    public DriverInfo Driver { get; set; } = new();
}
