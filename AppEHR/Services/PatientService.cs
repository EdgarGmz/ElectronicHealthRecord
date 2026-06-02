using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using AppEHR.Models;

namespace AppEHR.Services
{
    public class PatientService
    {
        private readonly ApiService _apiService;

        public PatientService(ApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<Patient?> FindByEnrollmentAsync(string enrollmentNumber)
        {
            if (string.IsNullOrWhiteSpace(enrollmentNumber)) return null;

            var response = await _apiService.GetAsync($"patients/by-enrollment/{Uri.EscapeDataString(enrollmentNumber.Trim())}");
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(content);
                var success = doc.RootElement.GetProperty("success").GetBoolean();
                if (success)
                {
                    var dataJson = doc.RootElement.GetProperty("data").GetRawText();
                    return JsonSerializer.Deserialize<Patient>(dataJson);
                }
            }
            return null;
        }

        public async Task<List<Career>> GetAssignedCareersAsync()
        {
            var result = new List<Career>();
            try
            {
                // 1. Obtener los IDs de las carreras asignadas al psicólogo
                var meCareersResponse = await _apiService.GetAsync("users/me/careers");
                if (!meCareersResponse.IsSuccessStatusCode) return result;

                var meCareersContent = await meCareersResponse.Content.ReadAsStringAsync();
                using var meDoc = JsonDocument.Parse(meCareersContent);
                var assignedIds = new List<string>();
                var meData = meDoc.RootElement.GetProperty("data").GetProperty("careerIds");
                if (meData.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in meData.EnumerateArray())
                    {
                        var id = item.GetString();
                        if (id != null) assignedIds.Add(id);
                    }
                }


                if (assignedIds.Count == 0) return result;

                // 2. Obtener todas las carreras disponibles para cruzar nombres
                var allCareersResponse = await _apiService.GetAsync("careers");
                if (!allCareersResponse.IsSuccessStatusCode) return result;

                var allCareersContent = await allCareersResponse.Content.ReadAsStringAsync();
                using var allDoc = JsonDocument.Parse(allCareersContent);
                var allData = allDoc.RootElement.GetProperty("data");
                
                if (allData.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in allData.EnumerateArray())
                    {

                        var career = JsonSerializer.Deserialize<Career>(item.GetRawText());
                        if (career != null && assignedIds.Contains(career.Id))
                        {
                            result.Add(career);
                        }
                    }
                }
            }
            catch
            {
                // Retornar lista vacía en caso de falla
            }
            return result;
        }

        public async Task<(bool Success, string Message, Patient? Patient)> CreatePatientAsync(
            string email,
            string firstName,
            string lastName,
            DateTime dateOfBirth,
            string patientType,
            string? careerId,
            string? enrollmentNumber,
            string? phone,
            string? group,
            string? occupation,
            int? trimester)
        {
            try
            {
                var payload = new Dictionary<string, object>
                {
                    { "email", email },
                    { "firstName", firstName },
                    { "lastName", lastName },
                    { "dateOfBirth", dateOfBirth.ToString("yyyy-MM-dd") },
                    { "patientType", patientType }
                };

                if (patientType == "student")
                {
                    if (string.IsNullOrEmpty(careerId))
                    {
                        return (false, "La carrera es obligatoria para estudiantes", null);
                    }
                    payload.Add("careerId", careerId);
                    if (!string.IsNullOrEmpty(group)) payload.Add("group", group);
                    if (trimester.HasValue) payload.Add("trimester", trimester.Value);
                }
                else
                {
                    if (!string.IsNullOrEmpty(occupation)) payload.Add("occupation", occupation);
                }

                if (!string.IsNullOrEmpty(enrollmentNumber)) payload.Add("enrollmentNumber", enrollmentNumber);
                if (!string.IsNullOrEmpty(phone)) payload.Add("phone", phone);

                var response = await _apiService.PostAsync("patients", payload);
                var content = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(content);
                var success = doc.RootElement.GetProperty("success").GetBoolean();

                if (success)
                {
                    var dataJson = doc.RootElement.GetProperty("data").GetRawText();
                    var patient = JsonSerializer.Deserialize<Patient>(dataJson);
                    return (true, "Paciente registrado con éxito", patient);
                }
                else
                {
                    var msg = doc.RootElement.GetProperty("message").GetString() ?? "Error al registrar paciente";
                    return (false, msg, null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error al conectar con el servidor: {ex.Message}", null);
            }
        }
    }
}
