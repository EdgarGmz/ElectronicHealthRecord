using AppEHR.ViewModels;
using Microsoft.Maui.Controls;

namespace AppEHR.Views
{
    public partial class DashboardPage : ContentPage
    {
        public DashboardPage(DashboardViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            if (BindingContext is DashboardViewModel vm)
            {
                await vm.LoadDataAsync();
            }
        }
    }
}
