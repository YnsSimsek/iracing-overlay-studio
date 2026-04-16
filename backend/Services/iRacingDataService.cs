using IracingOverlayStudio.Models;
using Microsoft.Extensions.Options;

namespace IracingOverlayStudio.Services;

public sealed class OverlayOptions
{
    public int UpdateIntervalMs { get; set; } = 1000;
    public string WebSocketPath { get; set; } = "/ws";
}

public sealed class IRacingDataService(IOptions<OverlayOptions> options) : BackgroundService
{
    private readonly Random _random = new();
    private readonly int _updateIntervalMs = Math.Max(options.Value.UpdateIntervalMs, 200);
    private OverlayUpdate _current = CreateDefault();

    public OverlayUpdate GetCurrent() => _current;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _current = TryReadFromIracingSdk() ?? CreateMockUpdate(_current);
            await Task.Delay(_updateIntervalMs, stoppingToken);
        }
    }

    private OverlayUpdate? TryReadFromIracingSdk()
    {
        // TODO: Integrate iRacing SDK shared memory reader here.
        // Returning null enables the mock fallback for initial project setup.
        return null;
    }

    private OverlayUpdate CreateMockUpdate(OverlayUpdate previous)
    {
        var currentLap = previous.Session.CurrentLap + 1;
        var lapsRemaining = Math.Max(0, 45 - currentLap);

        return new OverlayUpdate
        {
            Timestamp = DateTimeOffset.UtcNow,
            Session = new SessionInfo
            {
                SessionType = "Race",
                TrackName = "Spa-Francorchamps",
                CurrentLap = currentLap,
                LapsRemaining = lapsRemaining,
                IsGreenFlag = true
            },
            Telemetry = new TelemetryData
            {
                SpeedKph = Math.Round(180 + _random.NextDouble() * 95, 1),
                Rpm = 4200 + _random.Next(0, 3600),
                Gear = _random.Next(2, 7),
                Throttle = Math.Round(_random.NextDouble(), 2),
                Brake = Math.Round(_random.NextDouble() * 0.4, 2),
                FuelLiters = Math.Round(Math.Max(0, previous.Telemetry.FuelLiters - 0.2), 1)
            },
            Standings = Enumerable.Range(1, 8)
                .Select(position => new StandingEntry
                {
                    Position = position,
                    DriverName = $"Driver {position}",
                    CarNumber = (10 + position).ToString(),
                    GapToLeader = Math.Round(position == 1 ? 0 : position * 0.74 + _random.NextDouble(), 2),
                    LastLapTime = Math.Round(112.2 + _random.NextDouble() * 1.7, 3)
                })
                .ToList()
        };
    }

    private static OverlayUpdate CreateDefault()
    {
        return new OverlayUpdate
        {
            Session = new SessionInfo
            {
                SessionType = "Practice",
                TrackName = "Loading...",
                CurrentLap = 0,
                LapsRemaining = 0
            },
            Telemetry = new TelemetryData
            {
                FuelLiters = 45
            }
        };
    }
}
