using System.Threading.Tasks;
using System.Windows.Input;
using AppEHR.Services;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Storage;

namespace AppEHR.ViewModels
{
    public class LoginViewModel : BaseViewModel
    {
        private readonly AuthService _authService;
        private string _username = string.Empty;
        private string _password = string.Empty;
        private string _errorMessage = string.Empty;
        private bool _rememberMe;

        public LoginViewModel(AuthService authService)
        {
            _authService = authService;
            Title = "Iniciar Sesión";
            LoginCommand = new Command(async () => await ExecuteLoginCommandAsync(), () => !IsBusy);
            ForgotPasswordCommand = new Command(async () => await ExecuteForgotPasswordCommandAsync());
        }

        public string Username
        {
            get => _username;
            set => SetProperty(ref _username, value);
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

        public bool RememberMe
        {
            get => _rememberMe;
            set => SetProperty(ref _rememberMe, value);
        }

        public new bool IsBusy
        {
            get => base.IsBusy;
            set
            {
                if (base.IsBusy != value)
                {
                    base.IsBusy = value;
                    ((Command)LoginCommand).ChangeCanExecute();
                }
            }
        }

        public ICommand LoginCommand { get; }
        public ICommand ForgotPasswordCommand { get; }

        private async Task ExecuteLoginCommandAsync()
        {
            if (IsBusy) return;

            if (string.IsNullOrWhiteSpace(Username) || string.IsNullOrWhiteSpace(Password))
            {
                ErrorMessage = "Ingresa usuario y contraseña";
                return;
            }

            IsBusy = true;
            ErrorMessage = string.Empty;

            try
            {
                var result = await _authService.LoginAsync(Username.Trim(), Password);
                if (result.Success)
                {
                    try
                    {
                        Preferences.Default.Set("remember_me", RememberMe);
                    }
                    catch
                    {
                        // Ignorar en entornos de pruebas
                    }

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
                ErrorMessage = $"Error de conexión: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task ExecuteForgotPasswordCommandAsync()
        {
            if (IsBusy) return;

            string email = await Shell.Current.DisplayPromptAsync(
                "Restablecer Contraseña",
                "Ingresa tu correo electrónico registrado:",
                "Enviar",
                "Cancelar",
                "correo@ejemplo.com",
                -1,
                Keyboard.Email
            );

            if (string.IsNullOrWhiteSpace(email)) return;

            IsBusy = true;
            ErrorMessage = string.Empty;

            try
            {
                var result = await _authService.ForgotPasswordAsync(email.Trim());
                if (result.Success)
                {
                    await Shell.Current.DisplayAlert(
                        "Correo Enviado",
                        result.Message ?? "Se ha enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.",
                        "Aceptar"
                    );
                }
                else
                {
                    await Shell.Current.DisplayAlert(
                        "Error",
                        result.Message ?? "No se pudo enviar el correo de restablecimiento.",
                        "Aceptar"
                    );
                }
            }
            catch (System.Exception ex)
            {
                await Shell.Current.DisplayAlert("Error", $"Error de conexión: {ex.Message}", "Aceptar");
            }
            finally
            {
                IsBusy = false;
            }
        }

        public async Task CheckAutoLoginAsync()
        {
            if (IsBusy) return;

            bool rememberMe = false;
            try
            {
                rememberMe = Preferences.Default.Get("remember_me", false);
            }
            catch
            {
                // Ignorar en entornos de pruebas
            }

            if (!rememberMe) return;

            IsBusy = true;
            try
            {
                bool loggedIn = await _authService.IsLoggedInAsync();
                if (loggedIn)
                {
                    await Shell.Current.GoToAsync("///DashboardPage");
                }
            }
            catch
            {
                // Ignorar
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
