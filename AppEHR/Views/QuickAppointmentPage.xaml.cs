using System;
using System.Threading.Tasks;
using AppEHR.ViewModels;
using Microsoft.Maui.Controls;

namespace AppEHR.Views
{
    public partial class QuickAppointmentPage : ContentPage
    {
        public QuickAppointmentPage(QuickAppointmentViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();

            // Animación de deslizamiento suave desde abajo al entrar
            try
            {
                RootContainer.TranslationY = 600;
                RootContainer.Opacity = 0.2;

                await Task.WhenAll(
                    RootContainer.TranslateTo(0, 0, 320, Easing.CubicOut),
                    RootContainer.FadeTo(1, 280)
                );
            }
            catch
            {
                // Fallback sin animación si falla la vista
                RootContainer.TranslationY = 0;
                RootContainer.Opacity = 1;
            }
        }

        private async void OnCloseButtonClicked(object sender, EventArgs e)
        {
            // Animación suave de deslizamiento inverso hacia abajo al ocultar
            try
            {
                await Task.WhenAll(
                    RootContainer.TranslateTo(0, 600, 260, Easing.CubicIn),
                    RootContainer.FadeTo(0, 220)
                );
            }
            catch
            {
                // Ignorar
            }

            if (BindingContext is QuickAppointmentViewModel vm)
            {
                if (vm.CancelCommand != null && vm.CancelCommand.CanExecute(null))
                {
                    vm.CancelCommand.Execute(null);
                }
                else
                {
                    await Shell.Current.GoToAsync("..");
                }
            }
            else
            {
                await Shell.Current.GoToAsync("..");
            }
        }
    }
}
