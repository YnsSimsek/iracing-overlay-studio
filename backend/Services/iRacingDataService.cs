using IracingOverlayStudio.Models;
using Microsoft.Extensions.Options;

namespace IracingOverlayStudio.Services;

public sealed class OverlayOptions
{
    public int UpdateIntervalMs { get; set; } = 16;
    public string WebSocketPath { get; set; } = "/ws";
}

public sealed class IRacingDataService(IOptions<OverlayOptions> options) : BackgroundService
{
    private const int PlayerDriverId = 1;
    private const int SessionLapLimit = 45;
    private const int SessionDurationSeconds = 3600;

    private readonly Random _random = new();
    private readonly object _sync = new();
    private readonly int _updateIntervalMs = Math.Max(options.Value.UpdateIntervalMs, 16);
    private readonly Dictionary<int, MockDriverState> _mockDrivers = CreateMockDrivers();
    private OverlayUpdate _currentSnapshot = CreateDefault();
    private OverlayUpdate _current = CreateDefault();
    private int _tick;

    public OverlayUpdate GetCurrent()
    {
        lock (_sync)
        {
            return Clone(_current);
        }
    }

    public OverlayUpdate GetSnapshot()
    {
        lock (_sync)
        {
            return Clone(_currentSnapshot);
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var previousSnapshot = CreateDefault();

        while (!stoppingToken.IsCancellationRequested)
        {
            var nextSnapshot = TryReadFromIracingSdk(previousSnapshot) ?? CreateMockUpdate(previousSnapshot);
            var delta = CreateDelta(previousSnapshot, nextSnapshot);

            lock (_sync)
            {
                _currentSnapshot = nextSnapshot;
                _current = delta;
            }

            previousSnapshot = nextSnapshot;
            await Task.Delay(_updateIntervalMs, stoppingToken);
        }
    }

    private OverlayUpdate? TryReadFromIracingSdk(OverlayUpdate previous)
    {
        // TODO: Read iRacing SDK shared memory and map to DriverStandings/DriverTelemetry.
        // Keep the same update contract and return incremental data through CreateDelta.
        return null;
    }

    private OverlayUpdate CreateMockUpdate(OverlayUpdate previous)
    {
        _tick++;
        var dt = _updateIntervalMs / 1000.0;

        foreach (var driver in _mockDrivers.Values)
        {
            var isPittingNow = driver.PitTicksRemaining > 0 || _random.NextDouble() < 0.0009;
            if (isPittingNow && driver.PitTicksRemaining <= 0)
            {
                driver.PitTicksRemaining = _random.Next(80, 180);
            }

            if (driver.PitTicksRemaining > 0)
            {
                driver.PitTicksRemaining--;
                driver.PitStatus = "InPit";
            }
            else
            {
                driver.PitStatus = "Out";
            }

            var paceNoise = 0.98 + _random.NextDouble() * 0.04;
            var pitPenalty = driver.PitStatus == "InPit" ? 0.5 : 1.0;
            var lapGain = dt / driver.BaseLapTimeSeconds * paceNoise * pitPenalty;
            driver.DistanceLaps += lapGain;
            driver.CurrentLapTimeSeconds += dt;
            driver.RaceTimeSeconds += dt + (driver.PitStatus == "InPit" ? 0.05 : 0);

            var completedLaps = (int)Math.Floor(driver.DistanceLaps);
            if (completedLaps > driver.CompletedLaps)
            {
                driver.CompletedLaps = completedLaps;
                driver.LastLapTimeSeconds = Math.Round(driver.CurrentLapTimeSeconds, 3);
                driver.BestLapTimeSeconds = driver.BestLapTimeSeconds <= 0
                    ? driver.LastLapTimeSeconds
                    : Math.Round(Math.Min(driver.BestLapTimeSeconds, driver.LastLapTimeSeconds), 3);
                driver.CurrentLapTimeSeconds = 0;
            }

            driver.SpeedKph = Math.Round((driver.PitStatus == "InPit" ? 82 : 220) + _random.NextDouble() * 32, 1);
            driver.Gear = driver.PitStatus == "InPit" ? 2 : _random.Next(4, 8);
            driver.Throttle = Math.Round(driver.PitStatus == "InPit" ? 0.35 : 0.75 + _random.NextDouble() * 0.25, 2);
            driver.Brake = Math.Round(driver.PitStatus == "InPit" ? 0.2 : _random.NextDouble() * 0.35, 2);
        }

        var ordered = _mockDrivers.Values
            .OrderByDescending(x => x.DistanceLaps)
            .ThenBy(x => x.RaceTimeSeconds)
            .ToList();

        var previousPositions = previous.Standings.ToDictionary(x => x.DriverId, x => x.Position);
        var standings = new List<DriverStandings>(ordered.Count);
        var driverTelemetry = new List<DriverTelemetry>(ordered.Count);
        var leader = ordered.FirstOrDefault();
        var sessionLap = ordered.Count == 0 ? 0 : ordered.Max(x => x.CompletedLaps + 1);

        for (var index = 0; index < ordered.Count; index++)
        {
            var driver = ordered[index];
            var position = index + 1;
            var previousPosition = previousPositions.GetValueOrDefault(driver.Driver.Id, position);
            var positionChange = previousPosition - position;
            var gapToLeader = leader is null
                ? 0
                : Math.Max(0, (leader.DistanceLaps - driver.DistanceLaps) * 110);
            var intervalToNext = index == 0
                ? 0
                : Math.Max(0, (ordered[index - 1].DistanceLaps - driver.DistanceLaps) * 110);

            standings.Add(new DriverStandings
            {
                DriverId = driver.Driver.Id,
                Position = position,
                PositionChange = positionChange,
                CurrentLap = driver.CompletedLaps + 1,
                PitStatus = driver.PitStatus,
                GapToLeader = Math.Round(gapToLeader, 3),
                IntervalToNext = Math.Round(intervalToNext, 3),
                BestLapTime = driver.BestLapTimeSeconds <= 0 ? 0 : driver.BestLapTimeSeconds,
                LastLapTime = driver.LastLapTimeSeconds <= 0 ? 0 : driver.LastLapTimeSeconds,
                IsCurrentPlayer = driver.Driver.Id == PlayerDriverId,
                Driver = driver.Driver
            });

            driverTelemetry.Add(new DriverTelemetry
            {
                DriverId = driver.Driver.Id,
                SpeedKph = driver.SpeedKph,
                Gear = driver.Gear,
                Throttle = driver.Throttle,
                Brake = driver.Brake
            });
        }

        var playerTelemetry = driverTelemetry.FirstOrDefault(x => x.DriverId == PlayerDriverId);

        return new OverlayUpdate
        {
            Timestamp = DateTimeOffset.UtcNow,
            IsSnapshot = true,
            PlayerDriverId = PlayerDriverId,
            Session = new SessionInfo
            {
                SessionType = "Race",
                TrackName = "Spa-Francorchamps",
                RemainingTimeSeconds = Math.Max(0, SessionDurationSeconds - _tick * _updateIntervalMs / 1000),
                SessionLaps = SessionLapLimit,
                CurrentLap = sessionLap,
                LapsRemaining = Math.Max(0, SessionLapLimit - sessionLap),
                IsGreenFlag = true
            },
            Telemetry = new TelemetryData
            {
                SpeedKph = playerTelemetry?.SpeedKph ?? 0,
                Rpm = 4200 + _random.Next(0, 3600),
                Gear = playerTelemetry?.Gear ?? 0,
                Throttle = playerTelemetry?.Throttle ?? 0,
                Brake = playerTelemetry?.Brake ?? 0,
                FuelLiters = Math.Round(Math.Max(0, previous.Telemetry.FuelLiters - 0.01), 2)
            },
            DriverTelemetry = driverTelemetry,
            Standings = standings,
            ChangedDriverIds = standings.Select(x => x.DriverId).ToList()
        };
    }

    private OverlayUpdate CreateDelta(OverlayUpdate previous, OverlayUpdate next)
    {
        if (previous.Standings.Count == 0 || _tick % 300 == 0)
        {
            return Clone(next);
        }

        var previousStandingsByDriver = previous.Standings.ToDictionary(x => x.DriverId, x => x);
        var previousTelemetryByDriver = previous.DriverTelemetry.ToDictionary(x => x.DriverId, x => x);
        var changedStandings = new List<DriverStandings>();
        var changedTelemetry = new List<DriverTelemetry>();
        var changedDriverIds = new HashSet<int>();

        foreach (var standing in next.Standings)
        {
            if (!previousStandingsByDriver.TryGetValue(standing.DriverId, out var prior) || HasStandingChanged(prior, standing))
            {
                changedStandings.Add(standing);
                changedDriverIds.Add(standing.DriverId);
            }
        }

        foreach (var telemetry in next.DriverTelemetry)
        {
            if (!previousTelemetryByDriver.TryGetValue(telemetry.DriverId, out var prior) || HasTelemetryChanged(prior, telemetry))
            {
                changedTelemetry.Add(telemetry);
                changedDriverIds.Add(telemetry.DriverId);
            }
        }

        return new OverlayUpdate
        {
            Timestamp = next.Timestamp,
            IsSnapshot = false,
            PlayerDriverId = next.PlayerDriverId,
            Session = next.Session,
            Telemetry = next.Telemetry,
            DriverTelemetry = changedTelemetry,
            Standings = changedStandings,
            ChangedDriverIds = changedDriverIds.ToList()
        };
    }

    private static bool HasStandingChanged(DriverStandings previous, DriverStandings current)
    {
        return previous.Position != current.Position
            || previous.PositionChange != current.PositionChange
            || previous.CurrentLap != current.CurrentLap
            || previous.PitStatus != current.PitStatus
            || Math.Abs(previous.GapToLeader - current.GapToLeader) > 0.01
            || Math.Abs(previous.IntervalToNext - current.IntervalToNext) > 0.01
            || Math.Abs(previous.BestLapTime - current.BestLapTime) > 0.001
            || Math.Abs(previous.LastLapTime - current.LastLapTime) > 0.001;
    }

    private static bool HasTelemetryChanged(DriverTelemetry previous, DriverTelemetry current)
    {
        return previous.Gear != current.Gear
            || Math.Abs(previous.SpeedKph - current.SpeedKph) > 0.1
            || Math.Abs(previous.Throttle - current.Throttle) > 0.01
            || Math.Abs(previous.Brake - current.Brake) > 0.01;
    }

    private static OverlayUpdate Clone(OverlayUpdate source)
    {
        return new OverlayUpdate
        {
            Timestamp = source.Timestamp,
            IsSnapshot = source.IsSnapshot,
            PlayerDriverId = source.PlayerDriverId,
            Telemetry = new TelemetryData
            {
                SpeedKph = source.Telemetry.SpeedKph,
                Rpm = source.Telemetry.Rpm,
                Gear = source.Telemetry.Gear,
                Throttle = source.Telemetry.Throttle,
                Brake = source.Telemetry.Brake,
                FuelLiters = source.Telemetry.FuelLiters
            },
            Session = new SessionInfo
            {
                SessionType = source.Session.SessionType,
                TrackName = source.Session.TrackName,
                RemainingTimeSeconds = source.Session.RemainingTimeSeconds,
                SessionLaps = source.Session.SessionLaps,
                LapsRemaining = source.Session.LapsRemaining,
                CurrentLap = source.Session.CurrentLap,
                IsGreenFlag = source.Session.IsGreenFlag
            },
            DriverTelemetry = source.DriverTelemetry
                .Select(x => new DriverTelemetry
                {
                    DriverId = x.DriverId,
                    SpeedKph = x.SpeedKph,
                    Gear = x.Gear,
                    Throttle = x.Throttle,
                    Brake = x.Brake
                })
                .ToList(),
            Standings = source.Standings
                .Select(x => new DriverStandings
                {
                    DriverId = x.DriverId,
                    Position = x.Position,
                    PositionChange = x.PositionChange,
                    CurrentLap = x.CurrentLap,
                    PitStatus = x.PitStatus,
                    GapToLeader = x.GapToLeader,
                    IntervalToNext = x.IntervalToNext,
                    BestLapTime = x.BestLapTime,
                    LastLapTime = x.LastLapTime,
                    IsCurrentPlayer = x.IsCurrentPlayer,
                    Driver = new DriverInfo
                    {
                        Id = x.Driver.Id,
                        Name = x.Driver.Name,
                        CarNumber = x.Driver.CarNumber,
                        CountryCode = x.Driver.CountryCode,
                        IRating = x.Driver.IRating,
                        Team = x.Driver.Team
                    }
                })
                .ToList(),
            ChangedDriverIds = source.ChangedDriverIds.ToList()
        };
    }

    private static OverlayUpdate CreateDefault()
    {
        return new OverlayUpdate
        {
            IsSnapshot = true,
            PlayerDriverId = PlayerDriverId,
            Session = new SessionInfo
            {
                SessionType = "Practice",
                TrackName = "Loading...",
                RemainingTimeSeconds = SessionDurationSeconds,
                SessionLaps = SessionLapLimit,
                CurrentLap = 0,
                LapsRemaining = SessionLapLimit
            },
            Telemetry = new TelemetryData
            {
                FuelLiters = 45
            }
        };
    }

    private static Dictionary<int, MockDriverState> CreateMockDrivers()
    {
        var drivers = new[]
        {
            new DriverInfo { Id = 1, Name = "You", CarNumber = "07", CountryCode = "TR", IRating = 2611, Team = "YUKA Esports" },
            new DriverInfo { Id = 2, Name = "L. Verstappen", CarNumber = "18", CountryCode = "NL", IRating = 3480, Team = "Orange Apex" },
            new DriverInfo { Id = 3, Name = "S. Perez", CarNumber = "91", CountryCode = "MX", IRating = 3060, Team = "Monolith Racing" },
            new DriverInfo { Id = 4, Name = "A. Martins", CarNumber = "22", CountryCode = "PT", IRating = 2785, Team = "Lumen Sim" },
            new DriverInfo { Id = 5, Name = "K. Ito", CarNumber = "55", CountryCode = "JP", IRating = 2882, Team = "Fuji Dynamics" },
            new DriverInfo { Id = 6, Name = "C. Smith", CarNumber = "11", CountryCode = "US", IRating = 2420, Team = "Northwind GT" },
            new DriverInfo { Id = 7, Name = "F. Silva", CarNumber = "63", CountryCode = "BR", IRating = 2330, Team = "Verde Torque" },
            new DriverInfo { Id = 8, Name = "M. Chen", CarNumber = "88", CountryCode = "CN", IRating = 2510, Team = "Dragon Pulse" }
        };

        return drivers.ToDictionary(
            x => x.Id,
            x => new MockDriverState
            {
                Driver = x,
                BaseLapTimeSeconds = 110 + x.Id * 0.22
            });
    }

    private sealed class MockDriverState
    {
        public DriverInfo Driver { get; set; } = new();
        public double BaseLapTimeSeconds { get; set; }
        public double DistanceLaps { get; set; }
        public int CompletedLaps { get; set; }
        public double CurrentLapTimeSeconds { get; set; }
        public double BestLapTimeSeconds { get; set; }
        public double LastLapTimeSeconds { get; set; }
        public double RaceTimeSeconds { get; set; }
        public int PitTicksRemaining { get; set; }
        public string PitStatus { get; set; } = "Out";
        public double SpeedKph { get; set; }
        public int Gear { get; set; } = 4;
        public double Throttle { get; set; }
        public double Brake { get; set; }
    }
}
