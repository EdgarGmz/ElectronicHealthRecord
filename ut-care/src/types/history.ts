export interface HistoryEvent {
  id: string;
  date: string; // ISO string for easy sorting
  type: 'Appointment' | 'Therapy Session' | 'Medication Prescription' | 'Psychometric Evaluation' | 'Diagnosis Update';
  title: string; // A short descriptive title
  description?: string; // A brief summary
  link?: string; // Optional link to the specific detail page (e.g., /appointments/:id)
  details?: any; // Full details of the event
}
