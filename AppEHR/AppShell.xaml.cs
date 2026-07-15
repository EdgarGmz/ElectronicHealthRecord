using AppEHR.Views;
using Microsoft.Maui.Controls;

namespace AppEHR
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();
            Routing.RegisterRoute(nameof(QuickAppointmentPage), typeof(QuickAppointmentPage));
            Routing.RegisterRoute(nameof(NotificationDetailPage), typeof(NotificationDetailPage));
        }
    }
}

