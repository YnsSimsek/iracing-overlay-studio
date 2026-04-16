using System.Text.RegularExpressions;

namespace IracingOverlayStudio.Services;

public sealed class WidgetConfigService(IHostEnvironment hostEnvironment)
{
    private static readonly Regex SafeProfileName = new("^[a-zA-Z0-9_-]+$", RegexOptions.Compiled);
    private readonly string _profilesDirectory = Path.Combine(hostEnvironment.ContentRootPath, "Configs", "profiles");

    public IReadOnlyList<string> ListProfiles()
    {
        EnsureDirectory();
        return Directory.GetFiles(_profilesDirectory, "*.json")
            .Select(Path.GetFileNameWithoutExtension)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .OrderBy(x => x)
            .ToList()!;
    }

    public string? LoadProfile(string profileName)
    {
        var path = GetProfilePath(profileName);
        if (!File.Exists(path))
        {
            return null;
        }

        return File.ReadAllText(path);
    }

    public void SaveProfile(string profileName, string json)
    {
        EnsureDirectory();
        var path = GetProfilePath(profileName);
        File.WriteAllText(path, json);
    }

    private string GetProfilePath(string profileName)
    {
        if (string.IsNullOrWhiteSpace(profileName) || !SafeProfileName.IsMatch(profileName))
        {
            throw new ArgumentException("Profile name is invalid.", nameof(profileName));
        }

        return Path.Combine(_profilesDirectory, $"{profileName}.json");
    }

    private void EnsureDirectory()
    {
        Directory.CreateDirectory(_profilesDirectory);
    }
}
