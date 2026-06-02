using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AppEHR.Models;
using AppEHR.Services;
using AppEHR.ViewModels;
using Xunit;

namespace AppEHR.Tests
{
    public class MockApiService : ApiService
    {
        public string? LastGetEndpoint { get; private set; }
        public string? LastPostEndpoint { get; private set; }
        public object? LastPostData { get; private set; }

        public string GetResponseJson { get; set; } = "{\"success\":true, \"data\":[]}";
        public string PostResponseJson { get; set; } = "{\"success\":true, \"data\":[]}";
        public HttpStatusCode NextStatusCode { get; set; } = HttpStatusCode.OK;

        public override Task<HttpResponseMessage> GetAsync(string endpoint)
        {
            LastGetEndpoint = endpoint;
            var response = new HttpResponseMessage(NextStatusCode)
            {
                Content = new StringContent(GetResponseJson)
            };
            return Task.FromResult(response);
        }

        public override Task<HttpResponseMessage> PostAsync<T>(string endpoint, T data)
        {
            LastPostEndpoint = endpoint;
            LastPostData = data;
            var response = new HttpResponseMessage(NextStatusCode)
            {
                Content = new StringContent(PostResponseJson)
            };
            return Task.FromResult(response);
        }
    }

    public class ViewModelTests
    {
        [Fact]
        public async Task LoginViewModel_ShouldFailIfRoleIsNotPsychologist()
        {
            // Arrange
            var mockApi = new MockApiService();
            var authService = new AuthService(mockApi);
            var viewModel = new LoginViewModel(authService);

            // Mock login response returning role 'admin' instead of 'psicologo'
            mockApi.PostResponseJson = @"{
                ""success"": true,
                ""data"": {
                    ""token"": ""mock_token"",
                    ""refreshToken"": ""mock_refresh_token"",
                    ""user"": {
                        ""id"": ""user123"",
                        ""email"": ""admin@test.com"",
                        ""firstName"": ""Admin"",
                        ""lastName"": ""User"",
                        ""role"": ""admin""
                    }
                }
            }";

            viewModel.Email = "admin@test.com";
            viewModel.Password = "password";

            // Act
            viewModel.LoginCommand.Execute(null);

            // Wait briefly for asynchronous commands
            int delay = 0;
            while (viewModel.IsBusy && delay < 1000)
            {
                await Task.Delay(50);
                delay += 50;
            }

            // Assert
            Assert.False(authService.CurrentUser != null && authService.CurrentUser.Role == "psicologo");
            Assert.Contains("Acceso exclusivo para personal de psicología", viewModel.ErrorMessage);
        }

        [Fact]
        public async Task QuickAppointmentViewModel_ShouldEnforceMinimumDurationOf40Minutes()
        {
            // Arrange
            var mockApi = new MockApiService();
            var patientService = new PatientService(mockApi);
            var authService = new AuthService(mockApi);
            var appointmentService = new AppointmentService(mockApi, authService);
            
            // Set current user as psychologist for session validation
            authService.SetCurrentUserForTesting(new User
            {
                Id = "psy123",
                FirstName = "Laura",
                LastName = "Gomez",
                Role = "psicologo"
            });

            var viewModel = new QuickAppointmentViewModel(patientService, appointmentService);

            // Set up found patient
            viewModel.FoundPatient = new Patient
            {
                Id = "patient123",
                User = new User { FirstName = "Juan", LastName = "Perez", Email = "juan@test.com" }
            };
            viewModel.PatientFound = true;

            // Set duration to less than 40 minutes (e.g., 30)
            viewModel.DurationMinutes = 30;
            viewModel.ScheduledDate = DateTime.Today.AddDays(1); // Future date to bypass past-date check

            // Act
            viewModel.BookAppointmentCommand.Execute(null);

            // Wait briefly
            int delay = 0;
            while (viewModel.IsBusy && delay < 1000)
            {
                await Task.Delay(50);
                delay += 50;
            }

            // Assert
            Assert.True(viewModel.IsError);
            Assert.Contains("La duración mínima de la cita rápida debe ser de 40 minutos", viewModel.StatusMessage);
        }

        [Fact]
        public async Task QuickAppointmentViewModel_ShouldAllowBookingWithValidDuration()
        {
            // Arrange
            var mockApi = new MockApiService();
            var patientService = new PatientService(mockApi);
            var authService = new AuthService(mockApi);
            var appointmentService = new AppointmentService(mockApi, authService);

            // Set current user as psychologist for session validation
            authService.SetCurrentUserForTesting(new User
            {
                Id = "psy123",
                FirstName = "Laura",
                LastName = "Gomez",
                Role = "psicologo"
            });

            var viewModel = new QuickAppointmentViewModel(patientService, appointmentService);

            mockApi.PostResponseJson = "{\"success\":true, \"data\": {\"id\":\"appt123\"}, \"message\":\"Cita creada con éxito\"}";

            viewModel.FoundPatient = new Patient
            {
                Id = "patient123",
                User = new User { FirstName = "Juan", LastName = "Perez", Email = "juan@test.com" }
            };
            viewModel.PatientFound = true;


            // Set valid duration
            viewModel.DurationMinutes = 50;
            viewModel.ScheduledDate = DateTime.Today.AddDays(1); // Future date

            // Act
            viewModel.BookAppointmentCommand.Execute(null);

            // Wait briefly
            int delay = 0;
            while (viewModel.IsBusy && delay < 1000)
            {
                await Task.Delay(50);
                delay += 50;
            }

            // Assert
            Assert.False(viewModel.IsError);
        }
    }
}
