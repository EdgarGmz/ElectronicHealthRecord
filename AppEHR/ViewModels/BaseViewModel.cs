using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Devices.Sensors;
using AppEHR.Services;
using Microsoft.Extensions.DependencyInjection;

namespace AppEHR.ViewModels
{
    public class BaseViewModel : INotifyPropertyChanged
    {
        private bool _isBusy;
        private string _title = string.Empty;

        public bool IsBusy
        {
            get => _isBusy;
            set => SetProperty(ref _isBusy, value);
        }

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        protected bool SetProperty<T>(ref T backingStore, T value,
            [CallerMemberName] string propertyName = "",
            Action? onChanged = null)
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
                return false;

            backingStore = value;
            onChanged?.Invoke();
            OnPropertyChanged(propertyName);
            return true;
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        
        protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private string _formattedTime = string.Empty;
        private string _formattedDate = string.Empty;
        private string _currentTemperatureText = string.Empty;
        private string _weatherIcon = string.Empty;
        private bool _isWeatherVisible = false;
        private string _psychologistName = string.Empty;
        private string _psychologistInitials = string.Empty;

        public string FormattedTime
        {
            get => _formattedTime;
            set => SetProperty(ref _formattedTime, value);
        }

        public string FormattedDate
        {
            get => _formattedDate;
            set => SetProperty(ref _formattedDate, value);
        }

        public string CurrentTemperatureText
        {
            get => _currentTemperatureText;
            set => SetProperty(ref _currentTemperatureText, value);
        }

        public string WeatherIcon
        {
            get => _weatherIcon;
            set => SetProperty(ref _weatherIcon, value);
        }

        public bool IsWeatherVisible
        {
            get => _isWeatherVisible;
            set => SetProperty(ref _isWeatherVisible, value);
        }

        public string PsychologistName
        {
            get => _psychologistName;
            set => SetProperty(ref _psychologistName, value);
        }

        public string PsychologistInitials
        {
            get => _psychologistInitials;
            set => SetProperty(ref _psychologistInitials, value);
        }

        protected void InitializeWeatherAndDateTime()
        {
            try
            {
                var authService = App.Current?.Handler?.MauiContext?.Services?.GetService<AuthService>();
                if (authService != null && authService.CurrentUser != null)
                {
                    PsychologistName = authService.CurrentUser.FullName;
                    PsychologistInitials = authService.CurrentUser.Initials;
                }
                else
                {
                    PsychologistName = "Psicólogo";
                    PsychologistInitials = "P";
                }
            }
            catch
            {
                PsychologistName = "Psicólogo";
                PsychologistInitials = "P";
            }

            UpdateDateTime();

            try
            {
                var timer = Application.Current?.Dispatcher?.CreateTimer();
                if (timer != null)
                {
                    timer.Interval = TimeSpan.FromSeconds(60);
                    timer.Tick += (s, e) => UpdateDateTime();
                    timer.Start();
                }
            }
            catch
            {
                // Evitar excepciones en simuladores o CI sin dispatcher de MAUI activo
            }
        }

        private void UpdateDateTime()
        {
            var now = DateTime.Now;
            FormattedTime = now.ToString("HH:mm");
            
            var culture = new System.Globalization.CultureInfo("es-MX");
            var dateStr = now.ToString("ddd, d MMM", culture);
            if (!string.IsNullOrEmpty(dateStr))
            {
                FormattedDate = char.ToUpper(dateStr[0]) + dateStr.Substring(1);
            }
        }

        protected async Task FetchWeatherAsync()
        {
            try
            {
                var request = new GeolocationRequest(GeolocationAccuracy.Medium, TimeSpan.FromSeconds(5));
                var location = await Geolocation.Default.GetLocationAsync(request);

                if (location != null)
                {
                    double lat = location.Latitude;
                    double lon = location.Longitude;

                    using (var client = new System.Net.Http.HttpClient())
                    {
                        client.Timeout = TimeSpan.FromSeconds(8);
                        var response = await client.GetAsync($"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code");
                        if (response.IsSuccessStatusCode)
                        {
                            var content = await response.Content.ReadAsStringAsync();
                            using (var doc = System.Text.Json.JsonDocument.Parse(content))
                            {
                                var root = doc.RootElement;
                                if (root.TryGetProperty("current", out var currentEl))
                                {
                                    if (currentEl.TryGetProperty("temperature_2m", out var tempEl) &&
                                        currentEl.TryGetProperty("weather_code", out var codeEl))
                                    {
                                        double tempVal = tempEl.GetDouble();
                                        int codeVal = codeEl.GetInt32();

                                        CurrentTemperatureText = $"{Math.Round(tempVal)}°C";
                                        WeatherIcon = GetWeatherEmoji(codeVal);
                                        IsWeatherVisible = true;
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error fetching weather details: {ex.Message}");
            }

            IsWeatherVisible = false;
        }

        private string GetWeatherEmoji(int code)
        {
            return code switch
            {
                0 => "☀️",
                1 or 2 or 3 => "⛅",
                45 or 48 => "🌫️",
                51 or 53 or 55 => "🌧️",
                61 or 63 or 65 => "🌧️",
                71 or 73 or 75 => "❄️",
                80 or 81 or 82 => "🌧️",
                95 or 96 or 99 => "⛈️",
                _ => "🌡️"
            };
        }
    }
}
