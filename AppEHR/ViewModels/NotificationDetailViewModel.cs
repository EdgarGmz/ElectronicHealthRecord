using System;
using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Models;
using AppEHR.Services;
using Microsoft.Maui.Controls;

namespace AppEHR.ViewModels
{
    [QueryProperty(nameof(NotificationId), "notificationId")]
    public class NotificationDetailViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private string? _notificationId;
        private Notification? _currentNotification;

        public NotificationDetailViewModel(NotificationService notificationService)
        {
            _notificationService = notificationService;
            Title = "Detalle de Notificación";

            CloseCommand = new Command(async () => await ExecuteCloseCommandAsync());
            DeleteCommand = new Command(async () => await ExecuteDeleteCommandAsync());
        }

        public string? NotificationId
        {
            get => _notificationId;
            set
            {
                if (SetProperty(ref _notificationId, value) && !string.IsNullOrEmpty(value))
                {
                    Task.Run(async () => await LoadNotificationAsync(value));
                }
            }
        }

        public Notification? CurrentNotification
        {
            get => _currentNotification;
            set => SetProperty(ref _currentNotification, value);
        }

        public ICommand CloseCommand { get; }
        public ICommand DeleteCommand { get; }

        private async Task LoadNotificationAsync(string id)
        {
            if (IsBusy) return;
            IsBusy = true;

            try
            {
                var notification = await _notificationService.GetNotificationByIdAsync(id);
                if (notification != null)
                {
                    CurrentNotification = notification;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading notification detail: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task ExecuteCloseCommandAsync()
        {
            await Shell.Current.GoToAsync("..");
        }

        private async Task ExecuteDeleteCommandAsync()
        {
            if (CurrentNotification == null || IsBusy) return;

            IsBusy = true;
            try
            {
                var success = await _notificationService.DeleteNotificationAsync(CurrentNotification.Id);
                if (success)
                {
                    await Shell.Current.GoToAsync("..");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error deleting notification in detail: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
