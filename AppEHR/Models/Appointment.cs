using System;
using System.Text.Json.Serialization;

namespace AppEHR.Models
{
    public class Appointment
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [JsonPropertyName("professionalId")]
        public string ProfessionalId { get; set; } = string.Empty;

        [JsonPropertyName("appointmentType")]
        public string AppointmentType { get; set; } = string.Empty; // initial_consultation, follow_up, emergency, routine

        [JsonPropertyName("department")]
        public string Department { get; set; } = string.Empty; // psychology

        [JsonPropertyName("scheduledDate")]
        public DateTime ScheduledDate { get; set; }

        [JsonPropertyName("durationMinutes")]
        public int DurationMinutes { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty; // scheduled, confirmed, completed, cancelled, no-show

        [JsonPropertyName("cancellationReason")]
        public string? CancellationReason { get; set; }

        [JsonPropertyName("rescheduleReason")]
        public string? RescheduleReason { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("createdBy")]
        public string CreatedBy { get; set; } = string.Empty;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("patient")]
        public Patient Patient { get; set; } = new Patient();

        [JsonPropertyName("professional")]
        public User Professional { get; set; } = new User();

        [JsonIgnore]
        public string FormattedTime => ScheduledDate.ToString("HH:mm");

        [JsonIgnore]
        public string FormattedDate => ScheduledDate.ToString("dd/MM/yyyy");

        [JsonIgnore]
        public string LocalizedType => AppointmentType switch
        {
            "initial_consultation" => "Consulta Inicial",
            "follow_up" => "Seguimiento",
            "emergency" => "Urgente",
            "routine" => "Rutina",
            _ => AppointmentType
        };

        [JsonIgnore]
        public string LocalizedStatus => Status switch
        {
            "scheduled" => "Programada",
            "confirmed" => "Confirmada",
            "completed" => "Completada",
            "cancelled" => "Cancelada",
            "no-show" => "No Asistió",
            _ => Status
        };

        [JsonIgnore]
        public string StatusColor => Status switch
        {
            "scheduled" => "#3B82F6", // azul
            "confirmed" => "#10B981", // verde
            "completed" => "#10B981", // verde
            "cancelled" => "#EF4444", // rojo
            "no-show" => "#F59E0B",   // naranja
            _ => "#6B7280"
        };
    }
}
