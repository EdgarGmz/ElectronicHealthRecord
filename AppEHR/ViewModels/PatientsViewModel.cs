using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Models;
using AppEHR.Services;
using Microsoft.Maui.Controls;
using Microsoft.Maui.ApplicationModel;

namespace AppEHR.ViewModels
{
    public class PatientsViewModel : BaseViewModel
    {
        private readonly PatientService _patientService;
        private readonly ExpedientService _expedientService;

        private string _searchQuery = string.Empty;
        private bool _isInitialState = true;
        private bool _isNotFound = false;
        private bool _isExpedientLoaded = false;
        private int _activeTab = 0; // 0 = Psicológico, 1 = Clínico

        private Patient? _currentPatient;
        private MedicalRecord? _currentMedicalRecord;
        private PsychologyRecord? _currentPsychologyRecord;

        public PatientsViewModel(PatientService patientService, ExpedientService expedientService)
        {
            _patientService = patientService;
            _expedientService = expedientService;
            Title = "Expedientes";

            SearchCommand = new Command(async () => await SearchPatientAndExpedientAsync());
            SelectTabCommand = new Command<string>((tabIndexStr) =>
            {
                if (int.TryParse(tabIndexStr, out int index))
                {
                    ActiveTab = index;
                }
            });
            ToggleSessionExpansionCommand = new Command<TherapySession>(ExecuteToggleSessionExpansion);
            ClearSearchCommand = new Command(ExecuteClearSearch);

            WhatsAppCommand = new Command<string>(async (phone) => await OpenWhatsAppAsync(phone));
            EmailCommand = new Command<string>(async (email) => await OpenEmailAsync(email));

            InitializeWeatherAndDateTime();
        }

        public string SearchQuery
        {
            get => _searchQuery;
            set
            {
                if (SetProperty(ref _searchQuery, value))
                {
                    OnPropertyChanged(nameof(IsSearchQueryNotEmpty));
                }
            }
        }

        public bool IsSearchQueryNotEmpty => !string.IsNullOrWhiteSpace(SearchQuery);

        public bool IsInitialState
        {
            get => _isInitialState;
            set => SetProperty(ref _isInitialState, value);
        }

        public bool IsNotFound
        {
            get => _isNotFound;
            set => SetProperty(ref _isNotFound, value);
        }

        public bool IsExpedientLoaded
        {
            get => _isExpedientLoaded;
            set => SetProperty(ref _isExpedientLoaded, value);
        }

        public int ActiveTab
        {
            get => _activeTab;
            set
            {
                if (SetProperty(ref _activeTab, value))
                {
                    OnPropertyChanged(nameof(IsPsychologyTabActive));
                    OnPropertyChanged(nameof(IsClinicalTabActive));
                }
            }
        }

        public bool IsPsychologyTabActive => ActiveTab == 0;
        public bool IsClinicalTabActive => ActiveTab == 1;

        public Patient? CurrentPatient
        {
            get => _currentPatient;
            set
            {
                if (SetProperty(ref _currentPatient, value))
                {
                    OnPropertyChanged(nameof(PatientTypeFormatted));
                    OnPropertyChanged(nameof(IsStudentSelected));
                }
            }
        }

        public string PatientTypeFormatted
        {
            get
            {
                if (CurrentPatient == null) return string.Empty;
                var type = CurrentPatient.PatientType?.Trim().ToLower();
                return type switch
                {
                    "student" => "Estudiante",
                    "faculty" => "Docente",
                    "administrative" => "Administrativo",
                    _ => CurrentPatient.PatientType ?? string.Empty
                };
            }
        }

        public bool IsStudentSelected => CurrentPatient?.PatientType?.Trim().ToLower() == "student";

        public MedicalRecord? CurrentMedicalRecord
        {
            get => _currentMedicalRecord;
            set
            {
                if (SetProperty(ref _currentMedicalRecord, value))
                {
                    OnPropertyChanged(nameof(HasNoEmergencyContacts));
                    OnPropertyChanged(nameof(HasNoNursingConsultations));
                }
            }
        }

        public PsychologyRecord? CurrentPsychologyRecord
        {
            get => _currentPsychologyRecord;
            set
            {
                if (SetProperty(ref _currentPsychologyRecord, value))
                {
                    OnPropertyChanged(nameof(HasPsychologyRecord));
                }
            }
        }

        public bool HasPsychologyRecord => CurrentPsychologyRecord != null;

        public bool HasNoSessions => TherapySessions.Count == 0;

        public bool HasNoEmergencyContacts
        {
            get
            {
                var contacts = CurrentMedicalRecord?.Patient?.EmergencyContacts;
                return contacts == null || contacts.Count == 0;
            }
        }

        public bool HasNoNursingConsultations
        {
            get
            {
                var consults = CurrentMedicalRecord?.NursingConsultations;
                return consults == null || consults.Count == 0;
            }
        }

        public ObservableCollection<TherapySession> TherapySessions { get; } = new ObservableCollection<TherapySession>();

        public ICommand SearchCommand { get; }
        public ICommand SelectTabCommand { get; }
        public ICommand ToggleSessionExpansionCommand { get; }
        public ICommand ClearSearchCommand { get; }
        public ICommand WhatsAppCommand { get; }
        public ICommand EmailCommand { get; }

        private async Task SearchPatientAndExpedientAsync()
        {
            if (IsBusy) return;

            var query = SearchQuery?.Trim();
            if (string.IsNullOrEmpty(query))
            {
                ExecuteClearSearch();
                return;
            }

            IsBusy = true;
            IsInitialState = false;
            IsNotFound = false;
            IsExpedientLoaded = false;
            CurrentPatient = null;
            CurrentMedicalRecord = null;
            CurrentPsychologyRecord = null;
            TherapySessions.Clear();

            try
            {
                // 1. Buscar paciente por matrícula / número de empleado
                var patient = await _patientService.FindByEnrollmentAsync(query);
                if (patient == null)
                {
                    IsNotFound = true;
                    return;
                }

                CurrentPatient = patient;

                // 2. Obtener / Asegurar que exista el expediente del paciente
                var record = await _expedientService.EnsureExpedientForPatientAsync(patient.Id);
                if (record == null)
                {
                    IsNotFound = true;
                    return;
                }

                CurrentMedicalRecord = record;
                CurrentPsychologyRecord = record.PsychologyRecord;
                OnPropertyChanged(nameof(HasNoEmergencyContacts));

                // 3. Cargar las sesiones de terapia
                var sessions = await _expedientService.GetTherapySessionsAsync(patient.Id);
                
                // Ordenar por número de sesión descendente (más recientes primero)
                var sortedSessions = sessions.OrderByDescending(s => s.SessionNumber).ToList();
                foreach (var session in sortedSessions)
                {
                    TherapySessions.Add(session);
                }

                OnPropertyChanged(nameof(HasNoSessions));

                IsExpedientLoaded = true;
                ActiveTab = 0; // Pestaña de psicología por defecto al cargar
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error al consultar expediente: {ex.Message}");
                IsNotFound = true;
            }
            finally
            {
                IsBusy = false;
            }
        }

        private void ExecuteToggleSessionExpansion(TherapySession? session)
        {
            if (session == null) return;

            session.IsExpanded = !session.IsExpanded;
            int index = TherapySessions.IndexOf(session);
            if (index >= 0)
            {
                // Re-insertamos para gatillar la actualización de la interfaz en MAUI
                TherapySessions[index] = session;
            }
        }

        private void ExecuteClearSearch()
        {
            SearchQuery = string.Empty;
            IsInitialState = true;
            IsNotFound = false;
            IsExpedientLoaded = false;
            CurrentPatient = null;
            CurrentMedicalRecord = null;
            CurrentPsychologyRecord = null;
            TherapySessions.Clear();
            OnPropertyChanged(nameof(HasNoSessions));
            OnPropertyChanged(nameof(HasNoEmergencyContacts));
            OnPropertyChanged(nameof(HasNoNursingConsultations));
        }

        private async Task OpenWhatsAppAsync(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return;
            try
            {
                var cleanPhone = new string(phone.Where(char.IsDigit).ToArray());
                if (cleanPhone.Length == 10)
                {
                    cleanPhone = "52" + cleanPhone;
                }

                var uri = new Uri($"https://wa.me/{cleanPhone}");
                await Launcher.Default.OpenAsync(uri);
            }
            catch
            {
                // Tolerancia
            }
        }

        private async Task OpenEmailAsync(string? email)
        {
            if (string.IsNullOrWhiteSpace(email)) return;
            try
            {
                var uri = new Uri($"mailto:{email.Trim()}");
                await Launcher.Default.OpenAsync(uri);
            }
            catch
            {
                // Tolerancia
            }
        }
    }
}
