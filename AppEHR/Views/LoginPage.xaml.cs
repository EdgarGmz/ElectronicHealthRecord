using AppEHR.ViewModels;
using Microsoft.Maui.Controls;

namespace AppEHR.Views
{
    public partial class LoginPage : ContentPage
    {
        public LoginPage(LoginViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            if (BindingContext is LoginViewModel viewModel)
            {
                await viewModel.CheckAutoLoginAsync();
            }
        }
    }
}
