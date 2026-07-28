using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Models;
using AppEHR.Services;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;
using Microsoft.Maui.Storage;

namespace AppEHR.ViewModels
{
    public class ColorPresetOption
    {
        public string Name { get; set; } = string.Empty;
        public string HexColor { get; set; } = string.Empty;
        public Color ColorValue => Color.FromArgb(HexColor);
    }

    public class SettingsViewModel : BaseViewModel
    {
        private readonly AuthService _authService;
        private bool _isDarkMode;
        private bool _isNotificationsMuted;
        private string _selectedFontSize = "Normal";
        private string _selectedColorHex = "#D35400";

        public SettingsViewModel(AuthService authService)
        {
            _authService = authService;
            Title = "Ajustes de Cuenta";

            // Cargar datos de usuario
            var user = _authService.CurrentUser;
            PsychologistName = user?.FullName ?? "Psicólogo";
            Email = user?.Email ?? "correo@utsc.edu.mx";
            EnrollmentNumber = user?.EnrollmentNumber ?? "S/N";
            Phone = !string.IsNullOrEmpty(user?.Phone) ? user.Phone : "No registrado";

            // Cargar preferencias iniciales (Por defecto "Light" / Claro, Switch apagado)
            _isDarkMode = Preferences.Get("app_theme", "Light") == "Dark";
            if (Application.Current != null)
            {
                Application.Current.UserAppTheme = _isDarkMode ? AppTheme.Dark : AppTheme.Light;
            }
            _isNotificationsMuted = Preferences.Get("notifications_muted", false);
            _selectedFontSize = Preferences.Get("font_size_scale", "Normal");
            _selectedColorHex = Preferences.Get("primary_color_hex", "#D35400");

            ColorPresets = new List<ColorPresetOption>
            {
                new ColorPresetOption { Name = "Naranja UTSC", HexColor = "#D35400" },
                new ColorPresetOption { Name = "Azul Institucional", HexColor = "#0078D4" },
                new ColorPresetOption { Name = "Verde Salud", HexColor = "#10B981" },
                new ColorPresetOption { Name = "Violeta Púrpura", HexColor = "#8B5CF6" },
                new ColorPresetOption { Name = "Rojo Vino", HexColor = "#991B1B" }
            };

            SelectColorCommand = new Command<string>(ExecuteSelectColor);
            SelectFontSizeCommand = new Command<string>(ExecuteSelectFontSize);
            LogoutCommand = new Command(async () => await ExecuteLogoutAsync());
        }

        public string PsychologistName { get; }
        public string Email { get; }
        public string EnrollmentNumber { get; }
        public string Phone { get; }

        public List<ColorPresetOption> ColorPresets { get; }

        public bool IsDarkMode
        {
            get => _isDarkMode;
            set
            {
                if (SetProperty(ref _isDarkMode, value))
                {
                    if (Application.Current != null)
                    {
                        Application.Current.UserAppTheme = value ? AppTheme.Dark : AppTheme.Light;
                    }
                    Preferences.Set("app_theme", value ? "Dark" : "Light");
                }
            }
        }

        public bool IsNotificationsMuted
        {
            get => _isNotificationsMuted;
            set
            {
                if (SetProperty(ref _isNotificationsMuted, value))
                {
                    Preferences.Set("notifications_muted", value);
                }
            }
        }

        public string SelectedFontSize
        {
            get => _selectedFontSize;
            set
            {
                if (SetProperty(ref _selectedFontSize, value))
                {
                    Preferences.Set("font_size_scale", value);
                }
            }
        }

        public string SelectedColorHex
        {
            get => _selectedColorHex;
            set
            {
                if (SetProperty(ref _selectedColorHex, value))
                {
                    ApplyPrimaryColor(value);
                }
            }
        }

        public ICommand SelectColorCommand { get; }
        public ICommand SelectFontSizeCommand { get; }
        public ICommand LogoutCommand { get; }

        private void ExecuteSelectColor(string hex)
        {
            if (string.IsNullOrEmpty(hex)) return;
            SelectedColorHex = hex;
        }

        private void ExecuteSelectFontSize(string size)
        {
            if (string.IsNullOrEmpty(size)) return;
            SelectedFontSize = size;
        }

        private void ApplyPrimaryColor(string hex)
        {
            try
            {
                var color = Color.FromArgb(hex);
                if (Application.Current != null)
                {
                    Application.Current.Resources["BrandPrimary"] = color;
                    Application.Current.Resources["Primary"] = color;
                }
                Preferences.Set("primary_color_hex", hex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error applying primary color: {ex.Message}");
            }
        }

        private async Task ExecuteLogoutAsync()
        {
            if (Shell.Current != null)
            {
                bool confirm = await Shell.Current.DisplayAlert("Cerrar Sesión", "¿Estás seguro de que deseas salir de tu cuenta?", "Sí, salir", "Cancelar");
                if (!confirm) return;
            }

            IsBusy = true;
            try
            {
                await _authService.LogoutAsync();
                if (Shell.Current != null)
                {
                    await Shell.Current.GoToAsync("//LoginPage");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error logging out: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
