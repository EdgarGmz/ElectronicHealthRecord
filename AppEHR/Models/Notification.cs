using System;
using System.Text.Json.Serialization;

namespace AppEHR.Models
{
    public class Notification
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;

        [JsonPropertyName("fromUserId")]
        public string? FromUserId { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("relatedEntityType")]
        public string? RelatedEntityType { get; set; }

        [JsonPropertyName("relatedEntityId")]
        public string? RelatedEntityId { get; set; }

        [JsonPropertyName("priority")]
        public string Priority { get; set; } = "normal";

        [JsonPropertyName("isRead")]
        public bool IsRead { get; set; }

        [JsonPropertyName("readAt")]
        public DateTime? ReadAt { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("fromUser")]
        public User? FromUser { get; set; }

        [JsonIgnore]
        public string FormattedDate => CreatedAt.ToLocalTime().ToString("dd/MM/yyyy hh:mm tt");

        [JsonIgnore]
        public string PriorityColor => Priority?.ToLower() switch
        {
            "high" => "#EF4444", // Red
            "low" => "#94A3B8", // Slate
            _ => "#D35400" // Brand Orange (default/normal)
        };
    }
}
