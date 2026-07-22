using System;
using AppEHR.ViewModels;
using Microsoft.Maui.Controls;

namespace AppEHR.Views
{
    public partial class LoginPage : ContentPage
    {
        private const string EyeOpenPath = "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17Z";
        private const string EyeClosedPath = "M12,17A5,5 0 0,1 7,12C7,11.54 7.06,11.1 7.18,10.68L9.2,12.7C9.06,13.1 9,13.54 9,14A5,5 0 0,0 14,19C14.46,19 14.9,18.94 15.3,18.8L17.32,20.82C15.75,21.58 13.95,22 12,22C7,22 2.73,18.89 1,14.5C2.45,10.82 5.37,7.84 9,6.68L11.02,8.7C10.37,9.2 9.8,9.81 9.38,10.5C9.75,10.5 10.12,10.61 10.47,10.8L13.2,13.53C13,13.88 12.89,14.25 12.89,14.62C12.89,15.77 13.82,16.7 14.97,16.7C15.35,16.7 15.72,16.59 16.07,16.39L18.8,19.12C18.38,19.24 17.94,19.3 17.48,19.3M12,7A5,5 0 0,1 17,12C17,12.46 16.94,12.9 16.82,13.32L19.82,16.32C21.45,14.97 22.45,13.1 23,11C21.27,6.61 17,3.5 12,3.5C10.74,3.5 9.53,3.75 8.41,4.2L10.31,6.1C10.85,6 11.42,5.92 12,5.92M12,9A3,3 0 0,0 9.08,11.92L12.08,14.92C12.08,14.92 12.08,14.92 12.08,14.92A3,3 0 0,0 15.08,11.92C15.08,11.92 15.08,11.92 15.08,11.92A3,3 0 0,0 12.08,8.92";

        private const string SunPath = "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zM5.64 4.23a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1-1.41 1.41L5.64 5.64a1 1 0 0 1 0-1.41zm11.31 11.31a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1-1.41 1.41l-1.42-1.42a1 1 0 0 1 0-1.41zM2 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zM5.64 19.77a1 1 0 0 1 0-1.41l1.42-1.42a1 1 0 0 1 1.41 1.41l-1.42 1.42a1 1 0 0 1-1.41 0zm11.31-11.31a1 1 0 0 1 0-1.41l1.42-1.42a1 1 0 0 1 1.41 1.41l-1.42 1.42a1 1 0 0 1-1.41 0z";
        private const string MoonPath = "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z";

        public LoginPage(LoginViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            UpdateThemeIcon();
            if (BindingContext is LoginViewModel viewModel)
            {
                await viewModel.CheckAutoLoginAsync();
            }
        }

        private void UpdateThemeIcon()
        {
            if (Application.Current == null) return;

            var currentTheme = Application.Current.RequestedTheme;
            if (Application.Current.UserAppTheme != AppTheme.Unspecified)
            {
                currentTheme = Application.Current.UserAppTheme == AppTheme.Dark ? AppTheme.Dark : AppTheme.Light;
            }

            var pathStr = currentTheme == AppTheme.Dark ? SunPath : MoonPath;
            var themeIcon = this.FindByName<Microsoft.Maui.Controls.Shapes.Path>("ThemeIconPath");
            if (themeIcon != null)
            {
                var converter = new Microsoft.Maui.Controls.Shapes.PathGeometryConverter();
                themeIcon.Data = (Microsoft.Maui.Controls.Shapes.Geometry)converter.ConvertFromInvariantString(pathStr);
            }
            }

        private void OnThemeToggleClicked(object sender, EventArgs e)
        {
            if (Application.Current == null) return;

            var currentTheme = Application.Current.RequestedTheme;
            if (Application.Current.UserAppTheme != AppTheme.Unspecified)
            {
                currentTheme = Application.Current.UserAppTheme == AppTheme.Dark ? AppTheme.Dark : AppTheme.Light;
            }

            if (currentTheme == AppTheme.Dark)
            {
                Application.Current.UserAppTheme = AppTheme.Light;
            }
            else
            {
                Application.Current.UserAppTheme = AppTheme.Dark;
            }

            UpdateThemeIcon();
        }

        private void OnTogglePasswordClicked(object sender, EventArgs e)
        {
            var passwordEntry = this.FindByName<Entry>("PasswordEntry");
            var eyeIcon = this.FindByName<Microsoft.Maui.Controls.Shapes.Path>("EyeIconPath");

            if (passwordEntry != null && eyeIcon != null)
            {
                passwordEntry.IsPassword = !passwordEntry.IsPassword;

                var converter = new Microsoft.Maui.Controls.Shapes.PathGeometryConverter();
                eyeIcon.Data = (Microsoft.Maui.Controls.Shapes.Geometry)converter.ConvertFromInvariantString(
                    passwordEntry.IsPassword ? EyeOpenPath : EyeClosedPath);
            }
        }
    }
}
