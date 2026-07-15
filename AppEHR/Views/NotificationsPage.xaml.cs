using System;
using AppEHR.ViewModels;
using Microsoft.Maui.Controls;

namespace AppEHR.Views
{
    public partial class NotificationsPage : ContentPage
    {
        public NotificationsPage(NotificationsViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();
            if (BindingContext is NotificationsViewModel viewModel)
            {
                await viewModel.LoadNotificationsAsync();
            }
        }
    }
}
