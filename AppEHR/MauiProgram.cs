using Microsoft.Extensions.Logging;
using AppEHR.Services;
using AppEHR.ViewModels;
using AppEHR.Views;

namespace AppEHR
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                });

            // Register Services
            builder.Services.AddSingleton<ApiService>();
            builder.Services.AddSingleton<AuthService>();
            builder.Services.AddSingleton<PatientService>();
            builder.Services.AddSingleton<AppointmentService>();
            builder.Services.AddSingleton<NotificationService>();

            // Register ViewModels
            builder.Services.AddTransient<LoginViewModel>();
            builder.Services.AddTransient<DashboardViewModel>();
            builder.Services.AddTransient<QuickAppointmentViewModel>();
            builder.Services.AddTransient<PatientsViewModel>();
            builder.Services.AddTransient<NotificationsViewModel>();
            builder.Services.AddTransient<NotificationDetailViewModel>();

            // Register Views
            builder.Services.AddTransient<LoginPage>();
            builder.Services.AddTransient<DashboardPage>();
            builder.Services.AddTransient<QuickAppointmentPage>();
            builder.Services.AddTransient<PatientsPage>();
            builder.Services.AddTransient<NotificationsPage>();
            builder.Services.AddTransient<NotificationDetailPage>();

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}

