using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using IracingOverlayStudio.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<OverlayOptions>(builder.Configuration.GetSection("Overlay"));
builder.Services.AddSingleton<IRacingDataService>();
builder.Services.AddSingleton<WidgetConfigService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<IRacingDataService>());
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(origin => origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase));
    });
});

var app = builder.Build();
var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

app.UseCors();
app.UseWebSockets();

var options = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<OverlayOptions>>().Value;
var wsPath = string.IsNullOrWhiteSpace(options.WebSocketPath) ? "/ws" : options.WebSocketPath;

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/config/profiles", (WidgetConfigService service) =>
{
    return Results.Ok(service.ListProfiles());
});

app.MapGet("/api/config/profiles/{profileName}", (string profileName, WidgetConfigService service) =>
{
    try
    {
        var profile = service.LoadProfile(profileName);
        return profile is null ? Results.NotFound() : Results.Content(profile, "application/json");
    }
    catch (ArgumentException)
    {
        return Results.BadRequest("Invalid profile name.");
    }
});

app.MapPut("/api/config/profiles/{profileName}", async (string profileName, HttpRequest request, WidgetConfigService service) =>
{
    try
    {
        using var reader = new StreamReader(request.Body);
        var body = await reader.ReadToEndAsync();
        using var json = JsonDocument.Parse(body);
        service.SaveProfile(profileName, json.RootElement.GetRawText());
        return Results.Ok(new { saved = true, profileName });
    }
    catch (ArgumentException)
    {
        return Results.BadRequest("Invalid profile name.");
    }
    catch (JsonException)
    {
        return Results.BadRequest("Request body must be valid JSON.");
    }
});

app.Map(wsPath, async context =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        await context.Response.WriteAsync("WebSocket endpoint expected.");
        return;
    }

    var dataService = context.RequestServices.GetRequiredService<IRacingDataService>();
    using var socket = await context.WebSockets.AcceptWebSocketAsync();
    var snapshotPayload = dataService.GetSnapshot();
    var snapshotJson = JsonSerializer.Serialize(snapshotPayload, jsonOptions);
    var snapshotBytes = Encoding.UTF8.GetBytes(snapshotJson);
    await socket.SendAsync(snapshotBytes, WebSocketMessageType.Text, true, context.RequestAborted);

    while (socket.State == WebSocketState.Open && !context.RequestAborted.IsCancellationRequested)
    {
        await Task.Delay(options.UpdateIntervalMs, context.RequestAborted);
        if (context.RequestAborted.IsCancellationRequested || socket.State != WebSocketState.Open)
        {
            break;
        }

        var payload = dataService.GetCurrent();
        var json = JsonSerializer.Serialize(payload, jsonOptions);
        var bytes = Encoding.UTF8.GetBytes(json);
        await socket.SendAsync(bytes, WebSocketMessageType.Text, true, context.RequestAborted);
    }
});

app.Run();
