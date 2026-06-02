using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.Devices;

namespace AppEHR.Services
{
    public class ApiService
    {
        private readonly HttpClient _client;
        private readonly string _baseUrl;

        public ApiService()
        {
            _client = new HttpClient();
            // Adaptar la dirección local según el dispositivo y entorno
            try
            {
                if (DeviceInfo.Platform == DevicePlatform.Android)
                {
                    // Si es un emulador usa 10.0.2.2. Si es un dispositivo físico usa localhost (requiere adb reverse)
                    _baseUrl = DeviceInfo.DeviceType == DeviceType.Virtual
                        ? "http://10.0.2.2:5000/api"
                        : "http://localhost:5000/api";
                }
                else
                {
                    _baseUrl = "http://localhost:5000/api";
                }
            }
            catch
            {
                _baseUrl = "http://localhost:5000/api";
            }
        }

        private async Task ApplyAuthHeaderAsync()
        {
            try
            {
                var token = await SecureStorage.GetAsync("access_token");
                if (!string.IsNullOrEmpty(token))
                {
                    _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }
                else
                {
                    _client.DefaultRequestHeaders.Authorization = null;
                }
            }
            catch
            {
                // Fallback para pruebas unitarias sin SecureStorage
                _client.DefaultRequestHeaders.Authorization = null;
            }
        }

        public virtual async Task<HttpResponseMessage> GetAsync(string endpoint)
        {
            await ApplyAuthHeaderAsync();
            var response = await _client.GetAsync($"{_baseUrl}/{endpoint}");
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                if (await RefreshTokenAsync())
                {
                    await ApplyAuthHeaderAsync();
                    response = await _client.GetAsync($"{_baseUrl}/{endpoint}");
                }
            }
            return response;
        }

        public virtual async Task<HttpResponseMessage> PostAsync<T>(string endpoint, T data)
        {
            await ApplyAuthHeaderAsync();
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _client.PostAsync($"{_baseUrl}/{endpoint}", content);
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                if (await RefreshTokenAsync())
                {
                    await ApplyAuthHeaderAsync();
                    response = await _client.PostAsync($"{_baseUrl}/{endpoint}", content);
                }
            }
            return response;
        }

        public virtual async Task<HttpResponseMessage> PutAsync<T>(string endpoint, T data)
        {
            await ApplyAuthHeaderAsync();
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _client.PutAsync($"{_baseUrl}/{endpoint}", content);
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                if (await RefreshTokenAsync())
                {
                    await ApplyAuthHeaderAsync();
                    response = await _client.PutAsync($"{_baseUrl}/{endpoint}", content);
                }
            }
            return response;
        }


        private async Task<bool> RefreshTokenAsync()
        {
            var refreshToken = await SecureStorage.GetAsync("refresh_token");
            if (string.IsNullOrEmpty(refreshToken)) return false;

            try
            {
                var payload = new { refreshToken };
                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _client.PostAsync($"{_baseUrl}/auth/refresh-token", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(responseBody);
                    var dataProp = doc.RootElement.GetProperty("data");
                    
                    string? newAccessToken = null;
                    if (dataProp.TryGetProperty("accessToken", out var accessTokenProp))
                    {
                        newAccessToken = accessTokenProp.GetString();
                    }

                    string? newRefreshToken = null;
                    if (dataProp.TryGetProperty("refreshToken", out var refreshTokenProp))
                    {
                        newRefreshToken = refreshTokenProp.GetString();
                    }
                    else
                    {
                        newRefreshToken = refreshToken; // Mantener el actual
                    }

                    if (!string.IsNullOrEmpty(newAccessToken))
                    {
                        await SecureStorage.SetAsync("access_token", newAccessToken);
                        if (!string.IsNullOrEmpty(newRefreshToken))
                        {
                            await SecureStorage.SetAsync("refresh_token", newRefreshToken);
                        }
                        return true;
                    }

                }
            }
            catch
            {
                // Ignorar fallas, devolver false
            }

            // Si el refresco falla, limpiar almacenamiento seguro
            SecureStorage.RemoveAll();
            return false;
        }
    }
}
