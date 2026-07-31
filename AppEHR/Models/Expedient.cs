using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AppEHR.Models
{
    public class MedicalRecord
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [JsonPropertyName("bloodType")]
        public string? BloodType { get; set; }

        [JsonPropertyName("allergies")]
        public string? Allergies { get; set; }

        [JsonPropertyName("chronicConditions")]
        public string? ChronicConditions { get; set; }

        [JsonPropertyName("currentMedications")]
        public string? CurrentMedications { get; set; }

        [JsonPropertyName("familyHistory")]
        public string? FamilyHistory { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("patient")]
        public Patient? Patient { get; set; }

        [JsonPropertyName("psychologyRecord")]
        public PsychologyRecord? PsychologyRecord { get; set; }

        [JsonPropertyName("nursingConsultations")]
        public List<NursingConsultation>? NursingConsultations { get; set; }
    }

    public class PsychologyRecord
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("medicalRecordId")]
        public string MedicalRecordId { get; set; } = string.Empty;

        [JsonPropertyName("initialEvaluationDate")]
        public DateTime? InitialEvaluationDate { get; set; }

        [JsonPropertyName("chiefComplaint")]
        public string? ChiefComplaint { get; set; }

        [JsonPropertyName("psychologicalHistory")]
        public string? PsychologicalHistory { get; set; }

        [JsonPropertyName("psychiatricHistory")]
        public string? PsychiatricHistory { get; set; }

        [JsonPropertyName("substanceUse")]
        public string? SubstanceUse { get; set; }

        [JsonPropertyName("suicideRiskLevel")]
        public string SuicideRiskLevel { get; set; } = "none";

        [JsonPropertyName("violenceRiskLevel")]
        public string ViolenceRiskLevel { get; set; } = "none";

        [JsonPropertyName("currentDiagnosisDsm5")]
        public string? CurrentDiagnosisDsm5 { get; set; }

        [JsonPropertyName("currentDiagnosisCie10")]
        public string? CurrentDiagnosisCie10 { get; set; }

        [JsonPropertyName("supportNetwork")]
        public string? SupportNetwork { get; set; }

        [JsonPropertyName("assignedPsychologistId")]
        public string? AssignedPsychologistId { get; set; }

        [JsonPropertyName("assignedPsychologist")]
        public User? AssignedPsychologist { get; set; }
    }

    public class NursingConsultation
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("medicalRecordId")]
        public string MedicalRecordId { get; set; } = string.Empty;

        [JsonPropertyName("consultationDate")]
        public DateTime ConsultationDate { get; set; }

        [JsonPropertyName("chiefComplaint")]
        public string? ChiefComplaint { get; set; }

        [JsonPropertyName("vitalSignsTemperature")]
        public decimal? VitalSignsTemperature { get; set; }

        [JsonPropertyName("vitalSignsBloodPressureSys")]
        public int? VitalSignsBloodPressureSys { get; set; }

        [JsonPropertyName("vitalSignsBloodPressureDia")]
        public int? VitalSignsBloodPressureDia { get; set; }

        [JsonPropertyName("vitalSignsHeartRate")]
        public int? VitalSignsHeartRate { get; set; }

        [JsonPropertyName("vitalSignsRespiratoryRate")]
        public int? VitalSignsRespiratoryRate { get; set; }

        [JsonPropertyName("vitalSignsOxygenSaturation")]
        public int? VitalSignsOxygenSaturation { get; set; }

        [JsonPropertyName("vitalSignsWeight")]
        public decimal? VitalSignsWeight { get; set; }

        [JsonPropertyName("vitalSignsHeight")]
        public decimal? VitalSignsHeight { get; set; }

        [JsonPropertyName("physicalExamination")]
        public string? PhysicalExamination { get; set; }

        [JsonPropertyName("diagnosis")]
        public string? Diagnosis { get; set; }

        [JsonPropertyName("treatmentPlan")]
        public string? TreatmentPlan { get; set; }

        [JsonPropertyName("observations")]
        public string? Observations { get; set; }

        [JsonPropertyName("nurseId")]
        public string NurseId { get; set; } = string.Empty;

        [JsonPropertyName("nurse")]
        public User? Nurse { get; set; }
    }

    public class TherapySession
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("psychologyRecordId")]
        public string PsychologyRecordId { get; set; } = string.Empty;

        [JsonPropertyName("sessionNumber")]
        public int SessionNumber { get; set; }

        [JsonPropertyName("sessionDate")]
        public DateTime SessionDate { get; set; }

        [JsonPropertyName("sessionDuration")]
        public int SessionDuration { get; set; }

        [JsonPropertyName("mood")]
        public string Mood { get; set; } = string.Empty;

        [JsonPropertyName("evolutionNotes")]
        public string? EvolutionNotes { get; set; }

        [JsonPropertyName("patientProgress")]
        public string? PatientProgress { get; set; }

        [JsonPropertyName("assignedTasks")]
        public string? AssignedTasks { get; set; }

        [JsonPropertyName("observations")]
        public string? Observations { get; set; }

        [JsonPropertyName("nextSessionPlan")]
        public string? NextSessionPlan { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("cancellationReason")]
        public string? CancellationReason { get; set; }

        [JsonPropertyName("rescheduleReason")]
        public string? RescheduleReason { get; set; }

        [JsonPropertyName("therapistId")]
        public string TherapistId { get; set; } = string.Empty;

        [JsonPropertyName("therapist")]
        public User? Therapist { get; set; }

        // UI helper properties (not serialized)
        [JsonIgnore]
        public bool IsExpanded { get; set; } = false;

        [JsonIgnore]
        public string SessionTitle => $"Sesión #{SessionNumber}";

        [JsonIgnore]
        public string FormattedDate => SessionDate.ToString("dd MMMM yyyy, hh:mm tt");

        [JsonIgnore]
        public string MoodEmoji
        {
            get
            {
                if (string.IsNullOrWhiteSpace(Mood)) return "📝";
                var cleanMood = Mood.Trim().ToLower();
                if (cleanMood.Contains("happy") || cleanMood.Contains("feliz") || cleanMood.Contains("alegre"))
                    return "😊";
                if (cleanMood.Contains("sad") || cleanMood.Contains("triste") || cleanMood.Contains("decaido"))
                    return "😢";
                if (cleanMood.Contains("angry") || cleanMood.Contains("enojado") || cleanMood.Contains("molesto") || cleanMood.Contains("ira"))
                    return "😠";
                if (cleanMood.Contains("anxious") || cleanMood.Contains("ansioso") || cleanMood.Contains("preocupado"))
                    return "😰";
                if (cleanMood.Contains("neutral") || cleanMood.Contains("tranquilo") || cleanMood.Contains("normal"))
                    return "😐";
                return "📝";
            }
        }

        [JsonIgnore]
        public string ExpansionArrow => IsExpanded ? "▲" : "▼";
    }

    public class EmergencyContact
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("patientId")]
        public string PatientId { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("relationship")]
        public string Relationship { get; set; } = string.Empty;

        [JsonPropertyName("phone")]
        public string Phone { get; set; } = string.Empty;

        [JsonPropertyName("phoneSecondary")]
        public string? PhoneSecondary { get; set; }

        [JsonPropertyName("priority")]
        public int Priority { get; set; }
    }
}
