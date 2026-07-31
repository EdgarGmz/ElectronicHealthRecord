using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using AppEHR.Models;

namespace AppEHR.Services
{
    public class ExpedientService
    {
        private readonly ApiService _apiService;

        public ExpedientService(ApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<MedicalRecord?> EnsureExpedientForPatientAsync(string patientId)
        {
            if (string.IsNullOrWhiteSpace(patientId)) return null;

            try
            {
                var payload = new { patientId };
                var response = await _apiService.PostAsync("medical-records/ensure-for-patient", payload);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var success = doc.RootElement.GetProperty("success").GetBoolean();
                    if (success)
                    {
                        var dataNode = doc.RootElement.GetProperty("data");
                        return JsonSerializer.Deserialize<MedicalRecord>(dataNode.GetRawText());
                    }
                }
            }
            catch
            {
                // Devolver nulo en caso de falla
            }
            return null;
        }

        public async Task<List<TherapySession>> GetTherapySessionsAsync(string patientId)
        {
            var result = new List<TherapySession>();
            if (string.IsNullOrWhiteSpace(patientId)) return result;

            try
            {
                // Solicitar un límite alto para tener el historial completo de evolución
                var response = await _apiService.GetAsync($"therapy-sessions?patientId={Uri.EscapeDataString(patientId)}&limit=100");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var success = doc.RootElement.GetProperty("success").GetBoolean();
                    if (success)
                    {
                        var dataNode = doc.RootElement.GetProperty("data");
                        if (dataNode.TryGetProperty("sessions", out var sessionsNode) && sessionsNode.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in sessionsNode.EnumerateArray())
                            {
                                var session = JsonSerializer.Deserialize<TherapySession>(item.GetRawText());
                                if (session != null)
                                {
                                    result.Add(session);
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
    }
}
