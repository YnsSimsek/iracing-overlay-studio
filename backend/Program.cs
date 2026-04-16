using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using IracingOverlayStudio.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<OverlayOptions>(builder.Configuration.GetSection("Overlay"));
builder.Services.AddSingleton<IRacingDataService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<IRacingDataService>());

var app = builder.Build();
var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

app.UseWebSockets();

var options = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<OverlayOptions>>().Value;
var wsPath = string.IsNullOrWhiteSpace(options.WebSocketPath) ? "/ws" : options.WebSocketPath;

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

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
