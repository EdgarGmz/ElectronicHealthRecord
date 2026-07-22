using System;
using System.Threading.Tasks;
using AppEHR.Views;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;

namespace AppEHR.Controls
{
    public partial class AppNavBar : ContentView
    {
        public static readonly BindableProperty ActiveTabProperty =
            BindableProperty.Create(nameof(ActiveTab), typeof(int), typeof(AppNavBar), 1, propertyChanged: OnActiveTabChanged);

        public AppNavBar()
        {
            InitializeComponent();
            HighlightActiveTab(ActiveTab);
        }

        public int ActiveTab
        {
            get => (int)GetValue(ActiveTabProperty);
            set => SetValue(ActiveTabProperty, value);
        }

        private static void OnActiveTabChanged(BindableObject bindable, object oldValue, object newValue)
        {
            if (bindable is AppNavBar navBar && newValue is int activeIndex)
            {
                navBar.HighlightActiveTab(activeIndex);
            }
        }

        public void HighlightActiveTab(int index)
        {
            Color primaryColor = (Color)(Application.Current?.Resources["BrandPrimary"] ?? Colors.Orange);
            Color defaultColor = (Application.Current?.RequestedTheme == AppTheme.Dark) ? Colors.White : Colors.Black;

            if (Tab1Label != null) Tab1Label.TextColor = (index == 1) ? primaryColor : defaultColor;
            if (Tab2Label != null) Tab2Label.TextColor = (index == 2) ? primaryColor : defaultColor;
            if (Tab3Label != null) Tab3Label.TextColor = (index == 3) ? primaryColor : defaultColor;
            if (Tab4Label != null) Tab4Label.TextColor = (index == 4) ? primaryColor : defaultColor;
        }

        private async void OnTab1Clicked(object sender, EventArgs e)
        {
            if (ActiveTab == 1) return;
            await Shell.Current.GoToAsync("//DashboardPage");
        }

        private async void OnTab2Clicked(object sender, EventArgs e)
        {
            if (ActiveTab == 2) return;
            await Shell.Current.GoToAsync("//PatientsPage");
        }

        private async void OnTab3Clicked(object sender, EventArgs e)
        {
            if (ActiveTab == 3) return;
            await Shell.Current.GoToAsync("//NotificationsPage");
        }

        private async void OnTab4Clicked(object sender, EventArgs e)
        {
            if (ActiveTab == 4) return;
            await Shell.Current.GoToAsync("//SettingsPage");
        }

        private async void OnCentralQuickApptClicked(object sender, EventArgs e)
        {
            // Micro-animación del botón flotante e icono (ScaleTo + RotateTo)
            try
            {
                _ = CentralBtn.ScaleTo(0.85, 90, Easing.CubicOut)
                    .ContinueWith(t => CentralBtn.ScaleTo(1.0, 100, Easing.CubicIn), TaskScheduler.FromCurrentSynchronizationContext());

                _ = CentralIcon.RotateTo(90, 150, Easing.CubicOut)
                    .ContinueWith(t => CentralIcon.RotateTo(0, 150, Easing.CubicIn), TaskScheduler.FromCurrentSynchronizationContext());
            }
            catch
            {
                // Ignorar excepciones de animación si la vista se desmonta
            }

            // Desplegar modalmente el formulario de citas rápidas (slide-up)
            await Shell.Current.GoToAsync("QuickAppointmentPage");
        }
    }
}
