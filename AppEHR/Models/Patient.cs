using System;
using System.Text.Json.Serialization;

namespace AppEHR.Models
{
    public class Career
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }

    public class Patient
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;

        [JsonPropertyName("patientType")]
        public string PatientType { get; set; } = string.Empty; // student, faculty, administrative

        [JsonPropertyName("maritalStatus")]
        public string? MaritalStatus { get; set; }

        [JsonPropertyName("guardianName")]
        public string? GuardianName { get; set; }

        [JsonPropertyName("guardianPhone")]
        public string? GuardianPhone { get; set; }

        [JsonPropertyName("careerId")]
        public string? CareerId { get; set; }

        [JsonPropertyName("group")]
        public string? Group { get; set; }

        [JsonPropertyName("occupation")]
        public string? Occupation { get; set; }

        [JsonPropertyName("trimester")]
        public int? Trimester { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("user")]
        public User User { get; set; } = new User();

        [JsonPropertyName("career")]
        public Career? Career { get; set; }
    }
}
