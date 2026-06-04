using System;
using System.Text.Json;
using System.Threading.Tasks;
using AppEHR.Models;
using Microsoft.Maui.Storage;

namespace AppEHR.Services
{
    public class AuthService
    {
        private readonly ApiService _apiService;
        private User? _currentUser;

        public AuthService(ApiService apiService)
        {
            _apiService = apiService;
        }

        public User? CurrentUser
        {
            get
            {
                if (_currentUser == null)
                {
                    try
                    {
                        var userJson = SecureStorage.GetAsync("current_user").Result;
                        if (!string.IsNullOrEmpty(userJson))
                        {
                            _currentUser = JsonSerializer.Deserialize<User>(userJson);
                        }
                    }
                    catch
                    {
                        // Ignorar en entornos de pruebas unitarias
                    }
                }
                return _currentUser;
            }
        }

        public void SetCurrentUserForTesting(User user)
        {
            _currentUser = user;
        }

        public async Task<bool> IsLoggedInAsync()
        {
            try
            {
                var token = await SecureStorage.GetAsync("access_token");
                return !string.IsNullOrEmpty(token) && CurrentUser != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<(bool Success, string Message)> LoginAsync(string email, string password)
        {
            try
            {
                var credentials = new { email, password };
                var response = await _apiService.PostAsync("auth/login", credentials);
                var content = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(content);
                var success = doc.RootElement.GetProperty("success").GetBoolean();

                if (!success)
                {
                    var message = doc.RootElement.GetProperty("message").GetString() ?? "Credenciales incorrectas";
                    return (false, message);
                }

                var data = doc.RootElement.GetProperty("data");
                var token = data.GetProperty("accessToken").GetString();
                var refreshToken = data.GetProperty("refreshToken").GetString();
                var userJson = data.GetProperty("user").GetRawText();
                var user = JsonSerializer.Deserialize<User>(userJson);

                if (user == null || token == null || refreshToken == null)
                {
                    return (false, "Error al procesar la respuesta del servidor");
                }

                // VALIDACIÓN DE ROL: Solo psicólogos pueden iniciar sesión en esta app
                if (user.Role != "psicologo")
                {
                    return (false, "Acceso exclusivo para personal de psicología");
                }

                _currentUser = user;

                try
                {
                    await SecureStorage.SetAsync("access_token", token);
                    await SecureStorage.SetAsync("refresh_token", refreshToken);
                    await SecureStorage.SetAsync("current_user", userJson);
                }

                catch
                {
                    // Ignorar errores de almacenamiento en pruebas unitarias
                }

                return (true, "Inicio de sesión exitoso");
            }
            catch (Exception ex)
            {
                return (false, $"Error de conexión: {ex.Message}");
            }
        }

        public async Task LogoutAsync()
        {
            try
            {
                await _apiService.PostAsync("auth/logout", new { });
            }
            catch
            {
                // Ignorar fallas al desautenticar en servidor
            }
            
            _currentUser = null;
            try
            {
                SecureStorage.RemoveAll();
                Preferences.Default.Remove("remember_me");
            }
            catch
            {
                // Ignorar en entornos de pruebas
            }
        }

    }
}
