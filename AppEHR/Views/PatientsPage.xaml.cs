using System;
using AppEHR.ViewModels;
using Microsoft.Maui.Controls;

namespace AppEHR.Views
{
    public partial class PatientsPage : ContentPage
    {
        public PatientsPage(PatientsViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            if (BindingContext is PatientsViewModel viewModel)
            {
                await viewModel.LoadPatientsAsync();
            }
        }
    }
}
