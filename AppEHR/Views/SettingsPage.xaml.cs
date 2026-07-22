using AppEHR.ViewModels;
using Microsoft.Maui.Controls;

namespace AppEHR.Views
{
    public partial class SettingsPage : ContentPage
    {
        public SettingsPage(SettingsViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }
    }
}
