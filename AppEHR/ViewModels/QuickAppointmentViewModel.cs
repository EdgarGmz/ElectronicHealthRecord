using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Models;
using AppEHR.Services;
using Microsoft.Maui.Controls;

namespace AppEHR.ViewModels
{
    public class QuickAppointmentViewModel : BaseViewModel
    {
        private readonly PatientService _patientService;
        private readonly AppointmentService _appointmentService;

        // Búsqueda
        private string _enrollmentQuery = string.Empty;
        private Patient? _foundPatient;
        private bool _patientFound;
        private bool _searchPerformed;

        // Cita
        private DateTime _scheduledDate = DateTime.Today;
        private TimeSpan _scheduledTime = DateTime.Now.TimeOfDay;
        private int _durationMinutes = 40; // Mínimo 40 minutos por requerimiento
        private string _selectedAppointmentType = "follow_up"; // initial_consultation, follow_up, emergency, routine
        private string _notes = string.Empty;

        // Nuevo Paciente Form
        private bool _showNewPatientForm;
        private string _newEmail = string.Empty;
        private string _newFirstName = string.Empty;
        private string _newLastName = string.Empty;
        private DateTime _newDateOfBirth = DateTime.Today.AddYears(-20);
        private string _newPhone = string.Empty;
        private string _newPatientType = "student"; // student, faculty, administrative
        private Career? _selectedNewPatientCareer;
        private string _newEnrollmentNumber = string.Empty;
        private string _newGroup = string.Empty;
        private string _newOccupation = string.Empty;
        private int? _newTrimester;

        // Mensajes
        private string _statusMessage = string.Empty;
        private bool _isError;

        public QuickAppointmentViewModel(PatientService patientService, AppointmentService appointmentService)
        {
            _patientService = patientService;
            _appointmentService = appointmentService;

            Title = "Agendado Rápido";
            AssignedCareers = new ObservableCollection<Career>();

            SearchPatientCommand = new Command(async () => await ExecuteSearchPatientCommandAsync(), () => !IsBusy);
            BookAppointmentCommand = new Command(async () => await ExecuteBookAppointmentCommandAsync(), () => !IsBusy && PatientFound);
            RegisterPatientCommand = new Command(async () => await ExecuteRegisterPatientCommandAsync(), () => !IsBusy && ShowNewPatientForm);
            ToggleNewPatientFormCommand = new Command(() => ExecuteToggleNewPatientForm());

            // Cargar carreras asignadas en segundo plano
            Task.Run(async () => await LoadAssignedCareersAsync());
        }

        public ObservableCollection<Career> AssignedCareers { get; }

        #region Propiedades de Búsqueda
        public string EnrollmentQuery
        {
            get => _enrollmentQuery;
            set => SetProperty(ref _enrollmentQuery, value);
        }

        public Patient? FoundPatient
        {
            get => _foundPatient;
            set => SetProperty(ref _foundPatient, value);
        }

        public bool PatientFound
        {
            get => _patientFound;
            set 
            {
                SetProperty(ref _patientFound, value);
                ((Command)BookAppointmentCommand).ChangeCanExecute();
            }
        }

        public bool SearchPerformed
        {
            get => _searchPerformed;
            set => SetProperty(ref _searchPerformed, value);
        }
        #endregion

        #region Propiedades de Cita
        public DateTime ScheduledDate
        {
            get => _scheduledDate;
            set => SetProperty(ref _scheduledDate, value);
        }

        public TimeSpan ScheduledTime
        {
            get => _scheduledTime;
            set => SetProperty(ref _scheduledTime, value);
        }

        public int DurationMinutes
        {
            get => _durationMinutes;
            set => SetProperty(ref _durationMinutes, value);
        }

        public string SelectedAppointmentType
        {
            get => _selectedAppointmentType;
            set => SetProperty(ref _selectedAppointmentType, value);
        }

        public string Notes
        {
            get => _notes;
            set => SetProperty(ref _notes, value);
        }
        #endregion

        #region Propiedades de Nuevo Paciente Form
        public bool ShowNewPatientForm
        {
            get => _showNewPatientForm;
            set
            {
                SetProperty(ref _showNewPatientForm, value);
                ((Command)RegisterPatientCommand).ChangeCanExecute();
            }
        }

        public string NewEmail
        {
            get => _newEmail;
            set => SetProperty(ref _newEmail, value);
        }

        public string NewFirstName
        {
            get => _newFirstName;
            set => SetProperty(ref _newFirstName, value);
        }

        public string NewLastName
        {
            get => _newLastName;
            set => SetProperty(ref _newLastName, value);
        }

        public DateTime NewDateOfBirth
        {
            get => _newDateOfBirth;
            set => SetProperty(ref _newDateOfBirth, value);
        }

        public string NewPhone
        {
            get => _newPhone;
            set => SetProperty(ref _newPhone, value);
        }

        public string NewPatientType
        {
            get => _newPatientType;
            set
            {
                SetProperty(ref _newPatientType, value);
                OnPropertyChanged(nameof(IsStudentSelected));
            }
        }

        public bool IsStudentSelected => NewPatientType == "student";

        public Career? SelectedNewPatientCareer
        {
            get => _selectedNewPatientCareer;
            set => SetProperty(ref _selectedNewPatientCareer, value);
        }

        public string NewEnrollmentNumber
        {
            get => _newEnrollmentNumber;
            set => SetProperty(ref _newEnrollmentNumber, value);
        }

        public string NewGroup
        {
            get => _newGroup;
            set => SetProperty(ref _newGroup, value);
        }

        public string NewOccupation
        {
            get => _newOccupation;
            set => SetProperty(ref _newOccupation, value);
        }

        public int? NewTrimester
        {
            get => _newTrimester;
            set => SetProperty(ref _newTrimester, value);
        }
        #endregion

        #region Propiedades de Mensajes
        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public bool IsError
        {
            get => _isError;
            set => SetProperty(ref _isError, value);
        }
        #endregion

        public new bool IsBusy
        {
            get => base.IsBusy;
            set
            {
                if (base.IsBusy != value)
                {
                    base.IsBusy = value;
                    ((Command)SearchPatientCommand).ChangeCanExecute();
                    ((Command)BookAppointmentCommand).ChangeCanExecute();
                    ((Command)RegisterPatientCommand).ChangeCanExecute();
                }
            }
        }

        public ICommand SearchPatientCommand { get; }
        public ICommand BookAppointmentCommand { get; }
        public ICommand RegisterPatientCommand { get; }
        public ICommand ToggleNewPatientFormCommand { get; }

        private async Task LoadAssignedCareersAsync()
        {
            var list = await _patientService.GetAssignedCareersAsync();
            MainThread.BeginInvokeOnMainThread(() =>
            {
                AssignedCareers.Clear();
                foreach (var career in list)
                {
                    AssignedCareers.Add(career);
                }
            });
        }

        private async Task ExecuteSearchPatientCommandAsync()
        {
            if (IsBusy) return;
            if (string.IsNullOrWhiteSpace(EnrollmentQuery))
            {
                ShowMessage("Ingresa una matrícula o número de empleado", true);
                return;
            }

            IsBusy = true;
            ShowMessage(string.Empty, false);
            SearchPerformed = false;
            PatientFound = false;
            FoundPatient = null;

            try
            {
                var patient = await _patientService.FindByEnrollmentAsync(EnrollmentQuery.Trim());
                if (patient != null)
                {
                    FoundPatient = patient;
                    PatientFound = true;
                    ShowNewPatientForm = false;
                    ShowMessage("Paciente encontrado. Llena los detalles de la cita abajo.", false);
                }
                else
                {
                    ShowMessage("No se encontró ningún expediente con esa matrícula.", true);
                }
                SearchPerformed = true;
            }
            catch (Exception ex)
            {
                ShowMessage($"Error de búsqueda: {ex.Message}", true);
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task ExecuteBookAppointmentCommandAsync()
        {
            if (IsBusy || !PatientFound || FoundPatient == null) return;

            IsBusy = true;
            ShowMessage(string.Empty, false);

            try
            {
                // Combinar fecha y hora seleccionada
                var scheduledDateTime = ScheduledDate.Date + ScheduledTime;
                
                // Convertir a fecha local y luego UTC
                scheduledDateTime = DateTime.SpecifyKind(scheduledDateTime, DateTimeKind.Local).ToUniversalTime();

                // Validar fecha futura
                if (scheduledDateTime <= DateTime.UtcNow)
                {
                    ShowMessage("No se pueden agendar citas en el pasado.", true);
                    IsBusy = false;
                    return;
                }

                // Validar duración mínima
                if (DurationMinutes < 40)
                {
                    ShowMessage("La duración mínima de la cita rápida debe ser de 40 minutos.", true);
                    IsBusy = false;
                    return;
                }

                var result = await _appointmentService.CreateAppointmentAsync(
                    FoundPatient.Id,
                    scheduledDateTime,
                    DurationMinutes,
                    SelectedAppointmentType,
                    Notes
                );

                if (result.Success)
                {
                    ShowMessage("¡Cita agendada con éxito en el sistema!", false);
                    // Esperar 2 segundos y volver al Dashboard
                    await Task.Delay(2000);
                    await Shell.Current.GoToAsync("..");
                }
                else
                {
                    ShowMessage(result.Message, true);
                }
            }
            catch (Exception ex)
            {
                ShowMessage($"Error al agendar: {ex.Message}", true);
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task ExecuteRegisterPatientCommandAsync()
        {
            if (IsBusy || !ShowNewPatientForm) return;

            if (string.IsNullOrWhiteSpace(NewEmail) || string.IsNullOrWhiteSpace(NewFirstName) || string.IsNullOrWhiteSpace(NewLastName))
            {
                ShowMessage("Correo, Nombre y Apellido son campos obligatorios", true);
                return;
            }

            if (NewPatientType == "student" && SelectedNewPatientCareer == null)
            {
                ShowMessage("Debes seleccionar una carrera para los estudiantes", true);
                return;
            }

            IsBusy = true;
            ShowMessage(string.Empty, false);

            try
            {
                var result = await _patientService.CreatePatientAsync(
                    NewEmail.Trim(),
                    NewFirstName.Trim(),
                    NewLastName.Trim(),
                    NewDateOfBirth,
                    NewPatientType,
                    SelectedNewPatientCareer?.Id,
                    NewEnrollmentNumber.Trim(),
                    NewPhone.Trim(),
                    NewGroup.Trim(),
                    NewOccupation.Trim(),
                    NewTrimester
                );

                if (result.Success && result.Patient != null)
                {
                    ShowMessage("Paciente registrado exitosamente. Agendando cita...", false);
                    FoundPatient = result.Patient;
                    PatientFound = true;
                    ShowNewPatientForm = false;
                    
                    // Inicializar el valor del buscador con la matrícula del paciente registrado
                    EnrollmentQuery = result.Patient.User.EnrollmentNumber ?? string.Empty;
                }
                else
                {
                    ShowMessage(result.Message, true);
                }
            }
            catch (Exception ex)
            {
                ShowMessage($"Error de registro: {ex.Message}", true);
            }
            finally
            {
                IsBusy = false;
            }
        }

        private void ExecuteToggleNewPatientForm()
        {
            ShowNewPatientForm = !ShowNewPatientForm;
            if (ShowNewPatientForm)
            {
                PatientFound = false;
                FoundPatient = null;
                // Si la matrícula de búsqueda está escrita, usarla por defecto
                if (!string.IsNullOrEmpty(EnrollmentQuery))
                {
                    NewEnrollmentNumber = EnrollmentQuery;
                }
            }
        }

        private void ShowMessage(string message, bool isError)
        {
            StatusMessage = message;
            IsError = isError;
        }
    }
}
