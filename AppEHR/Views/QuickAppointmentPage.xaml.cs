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
    }
}
