using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using AppEHR.Models;

namespace AppEHR.Services
{
    public class NotificationService
    {
        private readonly ApiService _apiService;

        public NotificationService(ApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<List<Notification>> GetNotificationsAsync()
        {
            var result = new List<Notification>();
            try
            {
                var response = await _apiService.GetAsync("notifications?limit=100");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var success = doc.RootElement.GetProperty("success").GetBoolean();
                    if (success)
                    {
                        var dataNode = doc.RootElement.GetProperty("data");
                        if (dataNode.TryGetProperty("notifications", out var notificationsNode) && 
                            notificationsNode.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in notificationsNode.EnumerateArray())
                            {
                                var notification = JsonSerializer.Deserialize<Notification>(item.GetRawText());
                                if (notification != null)
                                {
                                    result.Add(notification);
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                // Devolver lista vacía en caso de falla
            }
            return result;
        }

        public async Task<int> GetUnreadCountAsync()
        {
            try
            {
                var response = await _apiService.GetAsync("notifications/unread-count");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var success = doc.RootElement.GetProperty("success").GetBoolean();
                    if (success)
                    {
                        return doc.RootElement.GetProperty("data").GetProperty("count").GetInt32();
                    }
                }
            }
            catch
            {
                // Devolver 0 en caso de falla
            }
            return 0;
        }

        public async Task<bool> MarkAllAsReadAsync()
        {
            try
            {
                var response = await _apiService.PutAsync("notifications/mark-all-read");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    return doc.RootElement.GetProperty("success").GetBoolean();
                }
            }
            catch
            {
                // Ignorar
            }
            return false;
        }

        public async Task<bool> MarkAsReadAsync(string id)
        {
            try
            {
                var response = await _apiService.PutAsync($"notifications/{id}/read");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    return doc.RootElement.GetProperty("success").GetBoolean();
                }
            }
            catch
            {
                // Ignorar
            }
            return false;
        }

        public async Task<bool> DeleteNotificationAsync(string id)
        {
            try
            {
                var response = await _apiService.DeleteAsync($"notifications/{id}");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    return doc.RootElement.GetProperty("success").GetBoolean();
                }
            }
            catch
            {
                // Ignorar
            }
            return false;
        }

        public async Task<Notification?> GetNotificationByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return null;

            try
            {
                var response = await _apiService.GetAsync($"notifications/{Uri.EscapeDataString(id)}");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var success = doc.RootElement.GetProperty("success").GetBoolean();
                    if (success)
                    {
                        var dataJson = doc.RootElement.GetProperty("data").GetRawText();
                        return JsonSerializer.Deserialize<Notification>(dataJson);
                    }
                }
            }
            catch
            {
                // Ignorar en caso de error
            }
            return null;
        }
    }
}
