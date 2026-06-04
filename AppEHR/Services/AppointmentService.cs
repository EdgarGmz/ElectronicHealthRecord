using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using AppEHR.Models;

namespace AppEHR.Services
{
    public class AppointmentService
    {
        private readonly ApiService _apiService;
        private readonly AuthService _authService;

        public AppointmentService(ApiService apiService, AuthService authService)
        {
            _apiService = apiService;
            _authService = authService;
        }

        public async Task<List<Appointment>> GetAppointmentsAsync(DateTime startDate, DateTime endDate)
        {
            var result = new List<Appointment>();
            try
            {
                var startStr = startDate.ToString("yyyy-MM-ddTHH:mm:ssZ");
                var endStr = endDate.ToString("yyyy-MM-ddTHH:mm:ssZ");
                
                // Limitar la carga de citas a un volumen moderado para optimizar rendimiento móvil (ej. limit=100)
                var endpoint = $"appointments?startDate={startStr}&endDate={endStr}&limit=100";
                var response = await _apiService.GetAsync(endpoint);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var success = doc.RootElement.GetProperty("success").GetBoolean();
                    if (success)
                    {
                        var dataNode = doc.RootElement.GetProperty("data").GetProperty("appointments");
                        if (dataNode.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in dataNode.EnumerateArray())
                            {
                                var appt = JsonSerializer.Deserialize<Appointment>(item.GetRawText());
                                if (appt != null)
                                {
                                    result.Add(appt);
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

        public async Task<(bool Success, string Message, Appointment? Appointment)> CreateAppointmentAsync(
            string patientId,
            DateTime scheduledDate,
            int durationMinutes,
            string appointmentType,
            string? notes)
        {
            try
            {
                var currentPsy = _authService.CurrentUser;
                if (currentPsy == null) return (false, "Sesión no válida. Inicia sesión de nuevo.", null);

                var payload = new
                {
                    patientId,
                    professionalId = currentPsy.Id,
                    appointmentType,
                    department = "psychology",
                    scheduledDate = scheduledDate.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    durationMinutes,
                    notes = notes ?? string.Empty
                };

                var response = await _apiService.PostAsync("appointments", payload);
                var content = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(content);
                var success = doc.RootElement.GetProperty("success").GetBoolean();

                if (success)
                {
                    var dataJson = doc.RootElement.GetProperty("data").GetRawText();
                    var appt = JsonSerializer.Deserialize<Appointment>(dataJson);
                    return (true, "Cita agendada con éxito", appt);
                }
                else
                {
                    var msg = doc.RootElement.GetProperty("message").GetString() ?? "Conflicto en la agenda del psicólogo";
                    return (false, msg, null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error al conectar con el servidor: {ex.Message}", null);
            }
        }

        public async Task<DashboardStats> GetDashboardStatsAsync()
        {
            var stats = new DashboardStats();
            var currentPsy = _authService.CurrentUser;
            if (currentPsy == null) return stats;

            try
            {
                // 1. Obtener estadísticas agregadas desde el backend (mensuales)
                var now = DateTime.Today;
                var monthStart = new DateTime(now.Year, now.Month, 1);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                var startStr = monthStart.ToString("yyyy-MM-dd");
                var endStr = monthEnd.ToString("yyyy-MM-dd");
                
                var response = await _apiService.GetAsync($"reports/statistics?periodStart={startStr}&periodEnd={endStr}&department=psychology");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var success = doc.RootElement.GetProperty("success").GetBoolean();
                    if (success)
                    {
                        var dataNode = doc.RootElement.GetProperty("data").GetProperty("data");
                        
                        var appointmentsNode = dataNode.GetProperty("appointments");
                        stats.TotalAppointments = appointmentsNode.GetProperty("total").GetInt32();
                        stats.CompletedAppointments = appointmentsNode.GetProperty("completed").GetInt32();
                        stats.CancelledAppointments = appointmentsNode.GetProperty("cancelled").GetInt32();

                        var patientsNode = dataNode.GetProperty("patients");
                        stats.TotalPatients = patientsNode.GetProperty("total").GetInt32();
                    }
                }

                // 2. Calcular horas de terapia acumuladas en la semana actual
                // Lunes a Domingo de la semana actual
                var diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
                var weekStart = now.AddDays(-1 * diff);
                var weekEnd = weekStart.AddDays(7).AddTicks(-1);

                var weeklyAppointments = await GetAppointmentsAsync(weekStart, weekEnd);
                int totalMinutes = 0;
                foreach (var appt in weeklyAppointments)
                {
                    if (appt.Status == "completed" || appt.Status == "confirmed" || appt.Status == "scheduled")
                    {
                        totalMinutes += appt.DurationMinutes;
                    }
                }
                stats.HoursThisWeek = Math.Round(totalMinutes / 60.0, 1);

                // 3. Obtener frase motivadora de manera aleatoria
                var phrases = new[]
                {
                    "Respira. Este momento es solo un momento.",
                    "No tienes que hacer todo hoy. Solo el siguiente paso.",
                    "Cuidar de ti no es egoísmo; es requisito.",
                    "Entre paciente y paciente: tres respiraciones profundas.",
                    "Tu bienestar permite el de otros. Pausa cuando lo necesites.",
                    "Un paso a la vez. La carga se lleva mejor así.",
                    "Estar presente es el mejor regalo que puedes dar.",
                    "Permítete una pausa de 60 segundos."
                };
                var random = new Random();
                stats.GroundingPhrase = phrases[random.Next(phrases.Length)];
            }
            catch
            {
                // Devolver estadísticas parciales en caso de fallo de conexión
            }

            return stats;
        }
    }
}
