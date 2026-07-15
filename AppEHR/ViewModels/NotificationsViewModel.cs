using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Models;
using AppEHR.Services;
using AppEHR.Views;
using Microsoft.Maui.Controls;

namespace AppEHR.ViewModels
{
    public class NotificationsViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private int _unreadCount;

        public NotificationsViewModel(NotificationService notificationService)
        {
            _notificationService = notificationService;
            Title = "Notificaciones";
            Notifications = new ObservableCollection<Notification>();

            LoadNotificationsCommand = new Command(async () => await LoadNotificationsAsync());
            MarkAllAsReadCommand = new Command(async () => await MarkAllAsReadAsync());
            MarkAsReadCommand = new Command<Notification>(async (n) => await MarkAsReadAsync(n));
            DeleteNotificationCommand = new Command<Notification>(async (n) => await DeleteNotificationAsync(n));
            NavigateToQuickAppointmentCommand = new Command(async () => await NavigateToQuickAppointmentAsync());
            NavigateToDetailCommand = new Command<Notification>(async (n) => await NavigateToDetailAsync(n));
        }

        public ObservableCollection<Notification> Notifications { get; }

        public int UnreadCount
        {
            get => _unreadCount;
            set => SetProperty(ref _unreadCount, value);
        }

        public ICommand LoadNotificationsCommand { get; }
        public ICommand MarkAllAsReadCommand { get; }
        public ICommand MarkAsReadCommand { get; }
        public ICommand DeleteNotificationCommand { get; }
        public ICommand NavigateToQuickAppointmentCommand { get; }
        public ICommand NavigateToDetailCommand { get; }

        public async Task LoadNotificationsAsync()
        {
            if (IsBusy) return;
            IsBusy = true;

            try
            {
                Notifications.Clear();
                var list = await _notificationService.GetNotificationsAsync();
                
                // Sort by date descending
                list = list.OrderByDescending(n => n.CreatedAt).ToList();

                foreach (var item in list)
                {
                    Notifications.Add(item);
                }

                await RefreshUnreadCountAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading notifications: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task RefreshUnreadCountAsync()
        {
            UnreadCount = await _notificationService.GetUnreadCountAsync();
        }

        private async Task MarkAllAsReadAsync()
        {
            if (IsBusy) return;
            
            try
            {
                var success = await _notificationService.MarkAllAsReadAsync();
                if (success)
                {
                    foreach (var n in Notifications)
                    {
                        n.IsRead = true;
                    }
                    // Forzar refresh de la UI notificando cambios en la colección
                    var list = Notifications.ToList();
                    Notifications.Clear();
                    foreach (var item in list)
                    {
                        Notifications.Add(item);
                    }
                    await RefreshUnreadCountAsync();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error marking all as read: {ex.Message}");
            }
        }

        private async Task MarkAsReadAsync(Notification notification)
        {
            if (notification == null || notification.IsRead) return;

            try
            {
                var success = await _notificationService.MarkAsReadAsync(notification.Id);
                if (success)
                {
                    notification.IsRead = true;
                    
                    // Refrescar item en la UI
                    int idx = Notifications.IndexOf(notification);
                    if (idx >= 0)
                    {
                        Notifications[idx] = notification;
                    }
                    
                    await RefreshUnreadCountAsync();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error marking notification as read: {ex.Message}");
            }
        }

        private async Task DeleteNotificationAsync(Notification notification)
        {
            if (notification == null) return;

            try
            {
                var success = await _notificationService.DeleteNotificationAsync(notification.Id);
                if (success)
                {
                    Notifications.Remove(notification);
                    await RefreshUnreadCountAsync();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error deleting notification: {ex.Message}");
            }
        }

        private async Task NavigateToQuickAppointmentAsync()
        {
            await Shell.Current.GoToAsync("QuickAppointmentPage");
        }

        private async Task NavigateToDetailAsync(Notification notification)
        {
            if (notification == null) return;

            // Mark as read in background if unread
            if (!notification.IsRead)
            {
                await MarkAsReadAsync(notification);
            }

            // Navigate to detail page
            await Shell.Current.GoToAsync($"{nameof(NotificationDetailPage)}?notificationId={notification.Id}");
        }
    }
}
