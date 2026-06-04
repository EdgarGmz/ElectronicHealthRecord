using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Models;
using AppEHR.Services;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.Controls;

namespace AppEHR.ViewModels
{
    public class DashboardViewModel : BaseViewModel
    {
        private readonly AppointmentService _appointmentService;
        private readonly AuthService _authService;
        private DashboardStats _stats = new DashboardStats();
        private string _selectedViewMode = "today"; // today, week, month
        private string _psychologistName = string.Empty;

        public DashboardViewModel(AppointmentService appointmentService, AuthService authService)
        {
            _appointmentService = appointmentService;
            _authService = authService;
            
            Title = "Mi Agenda";
            Appointments = new ObservableCollection<Appointment>();

            LoadDataCommand = new Command(async () => await LoadDataAsync());
            ChangeViewModeCommand = new Command<string>(async (mode) => await ExecuteChangeViewModeAsync(mode));
            WhatsAppCommand = new Command<string>(async (phone) => await OpenWhatsAppAsync(phone));
            EmailCommand = new Command<string>(async (email) => await OpenEmailAsync(email));
            NavigateToQuickAppointmentCommand = new Command(async () => await NavigateToQuickAppointmentAsync());
            LogoutCommand = new Command(async () => await ExecuteLogoutCommandAsync());

            PsychologistName = _authService.CurrentUser?.FullName ?? "Psicólogo";
        }

        public ObservableCollection<Appointment> Appointments { get; }

        public DashboardStats Stats
        {
            get => _stats;
            set => SetProperty(ref _stats, value);
        }

        public string SelectedViewMode
        {
            get => _selectedViewMode;
            set => SetProperty(ref _selectedViewMode, value);
        }

        public string PsychologistName
        {
            get => _psychologistName;
            set => SetProperty(ref _psychologistName, value);
        }

        public ICommand LoadDataCommand { get; }
        public ICommand ChangeViewModeCommand { get; }
        public ICommand WhatsAppCommand { get; }
        public ICommand EmailCommand { get; }
        public ICommand NavigateToQuickAppointmentCommand { get; }
        public ICommand LogoutCommand { get; }

        public async Task LoadDataAsync()
        {
            if (IsBusy) return;
            IsBusy = true;

            try
            {
                // Cargar estadísticas
                Stats = await _appointmentService.GetDashboardStatsAsync();

                // Cargar citas según el modo
                DateTime start, end;
                var now = DateTime.Today;

                if (SelectedViewMode == "week")
                {
                    var diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
                    start = now.AddDays(-1 * diff);
                    end = start.AddDays(7).AddTicks(-1);
                }
                else if (SelectedViewMode == "month")
                {
                    start = new DateTime(now.Year, now.Month, 1);
                    end = start.AddMonths(1).AddDays(-1);
                }
                else // "today"
                {
                    start = now;
                    end = now.AddDays(1).AddTicks(-1);
                }

                var list = await _appointmentService.GetAppointmentsAsync(start, end);
                
                Appointments.Clear();
                foreach (var appt in list)
                {
                    Appointments.Add(appt);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading dashboard data: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task ExecuteChangeViewModeAsync(string mode)
        {
            SelectedViewMode = mode;
            await LoadDataAsync();
        }

        private async Task OpenWhatsAppAsync(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return;
            try
            {
                // Sanitizar número de teléfono (dejar solo dígitos)
                var cleanPhone = new string(phone.Where(char.IsDigit).ToArray());
                // Agregar prefijo de país de México (+52) si el número es de 10 dígitos
                if (cleanPhone.Length == 10)
                {
                    cleanPhone = "52" + cleanPhone;
                }

                var uri = new Uri($"https://wa.me/{cleanPhone}");
                await Launcher.Default.OpenAsync(uri);
            }
            catch
            {
                // Manejar error si no se puede abrir el navegador/app
            }
        }

        private async Task OpenEmailAsync(string? email)
        {
            if (string.IsNullOrWhiteSpace(email)) return;
            try
            {
                var uri = new Uri($"mailto:{email.Trim()}");
                await Launcher.Default.OpenAsync(uri);
            }
            catch
            {
                // Manejar error
            }
        }

        private async Task NavigateToQuickAppointmentAsync()
        {
            // Navegar a la pantalla de Cita Rápida
            await Shell.Current.GoToAsync("QuickAppointmentPage");
        }

        private async Task ExecuteLogoutCommandAsync()
        {
            await _authService.LogoutAsync();
            await Shell.Current.GoToAsync("///LoginPage");
        }
    }
}
