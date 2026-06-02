using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Services;
using Microsoft.Maui.Controls;

namespace AppEHR.ViewModels
{
    public class LoginViewModel : BaseViewModel
    {
        private readonly AuthService _authService;
        private string _email = string.Empty;
        private string _password = string.Empty;
        private string _errorMessage = string.Empty;

        public LoginViewModel(AuthService authService)
        {
            _authService = authService;
            Title = "Iniciar Sesión";
            LoginCommand = new Command(async () => await ExecuteLoginCommandAsync(), () => !IsBusy);
        }

        public string Email
        {
            get => _email;
            set => SetProperty(ref _email, value);
        }

        public string Password
        {
            get => _password;
            set => SetProperty(ref _password, value);
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        public ICommand LoginCommand { get; }

        private async Task ExecuteLoginCommandAsync()
        {
            if (IsBusy) return;

            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
            {
                ErrorMessage = "Ingresa correo y contraseña";
                return;
            }

            IsBusy = true;
            ErrorMessage = string.Empty;

            try
            {
                var result = await _authService.LoginAsync(Email.Trim(), Password);
                if (result.Success)
                {
                    // Navegación al Dashboard principal
                    await Shell.Current.GoToAsync("///DashboardPage");
                }
                else
                {
                    ErrorMessage = result.Message;
                }
            }
            catch (System.Exception ex)
            {
                ErrorMessage = $"Error: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
