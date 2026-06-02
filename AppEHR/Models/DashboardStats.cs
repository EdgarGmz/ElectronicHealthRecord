using System;

namespace AppEHR.Models
{
    public class DashboardStats
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public int TotalPatients { get; set; }
        public double HoursThisWeek { get; set; }
        public double RecommendedHours { get; set; } = 25.0;
        public string GroundingPhrase { get; set; } = "Pausa cuando lo necesites. Tu bienestar permite el de otros.";

        public double WorkloadPercentage => Math.Min(100.0, (HoursThisWeek / RecommendedHours) * 100.0);
        public bool IsOverworked => HoursThisWeek > RecommendedHours;
    }
}
