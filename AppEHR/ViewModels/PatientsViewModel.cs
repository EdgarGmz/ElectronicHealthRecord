using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Models;
using AppEHR.Services;
using AppEHR.Views;
using Microsoft.Maui.Controls;

namespace AppEHR.ViewModels
{
    public class PatientsViewModel : BaseViewModel
    {
        private readonly PatientService _patientService;
        private List<Patient> _allPatients = new List<Patient>();
        private string _searchQuery = string.Empty;

        public PatientsViewModel(PatientService patientService)
        {
            _patientService = patientService;
            Title = "Consultantes";
            Patients = new ObservableCollection<Patient>();

            LoadPatientsCommand = new Command(async () => await LoadPatientsAsync());
            SearchCommand = new Command(ExecuteSearch);
            NavigateToQuickAppointmentCommand = new Command<Patient>(async (patient) => await NavigateToQuickAppointmentAsync(patient));
            NavigateToQuickAppointmentNewCommand = new Command(async () => await Shell.Current.GoToAsync("QuickAppointmentPage"));

            InitializeWeatherAndDateTime();
        }

        public ObservableCollection<Patient> Patients { get; }

        public string SearchQuery
        {
            get => _searchQuery;
            set
            {
                if (SetProperty(ref _searchQuery, value))
                {
                    ExecuteSearch();
                }
            }
        }

        public ICommand LoadPatientsCommand { get; }
        public ICommand SearchCommand { get; }
        public ICommand NavigateToQuickAppointmentCommand { get; }
        public ICommand NavigateToQuickAppointmentNewCommand { get; }

        public async Task LoadPatientsAsync()
        {
            if (IsBusy) return;
            IsBusy = true;

            try
            {
                Patients.Clear();
                
                // Cargar pacientes y clima en paralelo
                var patientsTask = _patientService.GetPatientsAsync();
                var weatherTask = FetchWeatherAsync();

                await Task.WhenAll(patientsTask, weatherTask);
                _allPatients = patientsTask.Result;
                
                // Sort by FullName alphabetically
                _allPatients = _allPatients.OrderBy(p => p.User.FullName).ToList();

                ExecuteSearch();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading patients: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }

        private void ExecuteSearch()
        {
            Patients.Clear();
            var query = SearchQuery?.Trim().ToLower();

            if (string.IsNullOrEmpty(query))
            {
                foreach (var p in _allPatients)
                {
                    Patients.Add(p);
                }
            }
            else
            {
                var filtered = _allPatients.Where(p => 
                    p.User.FullName.ToLower().Contains(query) || 
                    (p.User.EnrollmentNumber != null && p.User.EnrollmentNumber.ToLower().Contains(query))
                );

                foreach (var p in filtered)
                {
                    Patients.Add(p);
                }
            }
        }

        private async Task NavigateToQuickAppointmentAsync(Patient patient)
        {
            if (patient == null) return;

            // Navigate to QuickAppointmentPage passing the patient Id as a parameter
            await Shell.Current.GoToAsync($"{nameof(QuickAppointmentPage)}?patientId={patient.Id}");
        }
    }
}
