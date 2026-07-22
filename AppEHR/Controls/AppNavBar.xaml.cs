using System;
using System.Threading.Tasks;
using AppEHR.Views;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Controls.Shapes;
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

            UpdateTabState(1, index == 1, Tab1Label, Tab1Icon, primaryColor);
            UpdateTabState(2, index == 2, Tab2Label, Tab2Icon, primaryColor);
            UpdateTabState(3, index == 3, Tab3Label, Tab3Icon, primaryColor);
            UpdateTabState(4, index == 4, Tab4Label, Tab4Icon, primaryColor);
        }

        private void UpdateTabState(int tabIndex, bool isActive, Label? label, Microsoft.Maui.Controls.Shapes.Path? icon, Color primaryColor)
        {
            if (label == null || icon == null) return;

            if (isActive)
            {
                label.TextColor = primaryColor;
                icon.Stroke = new SolidColorBrush(primaryColor);
            }
            else
            {
                // Restaurar el color correspondiente al tema activo
                Color lightColor = (Color)(Application.Current?.Resources["Gray900"] ?? Colors.Black);
                Color darkColor = (Color)(Application.Current?.Resources["White"] ?? Colors.White);

                label.SetAppThemeColor(Label.TextColorProperty, lightColor, darkColor);
                icon.SetAppThemeColor(Microsoft.Maui.Controls.Shapes.Path.StrokeProperty, lightColor, darkColor);
            }
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
