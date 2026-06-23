---
name: maui-architecture
description: Directrices del cliente móvil .NET MAUI (AppEHR), patrón MVVM, inyección de dependencias y pruebas unitarias aisladas en xUnit.
---

# Desarrollo y Arquitectura .NET MAUI (maui-architecture) 📱

Esta habilidad le enseña al agente cómo estructurar y modificar el cliente móvil **AppEHR**, asegurando el cumplimiento del patrón de diseño MVVM, navegación centralizada y testabilidad en entornos de CI.

## 🏗️ Patrón de Diseño MVVM (Model-View-ViewModel)
El desacoplamiento de la vista respecto a la lógica de negocio es obligatorio en el módulo `/AppEHR`:
- **Views (Vistas):** Definidas en XAML. No deben contener lógica compleja ni interactuar directamente con servicios o APIs en el code-behind (`.xaml.cs`).
- **ViewModels:** Heredan de clases base de notificaciones (por ejemplo, implementando `INotifyPropertyChanged` o usando CommunityToolkit.Mvvm). Vinculan datos a la vista mediante databinding.
- **Models (Modelos):** Estructuras planas de datos representando payloads o entidades.

---

## 💉 Registro de Dependencias (Dependency Injection)
Todos los servicios, clientes de API y ViewModels deben registrarse adecuadamente en el contenedor IOC.
- **Registro centralizado:** Se realiza en `AppEHR/MauiProgram.cs`.
- **Estrategia de ciclo de vida:**
  - Registrar ViewModels y páginas que se destruyen al navegar con `AddTransient<TView, TViewModel>()`.
  - Registrar servicios compartidos de backend y estado global con `AddSingleton<TService>()`.

---

## 🧭 Navegación con Shell (Shell Navigation)
El proyecto utiliza Shell para la estructura de pestañas y rutas superiores.
- **Rutas de primer nivel:** Declaradas directamente en `App.xaml` o `AppShell.xaml`.
- **Registro dinámico de sub-rutas:** Rutas secundarias (como páginas de detalle o formularios específicos) se registran dinámicamente en el constructor de `AppShell.xaml.cs` mediante:
  `Routing.RegisterRoute(nameof(DetailDetailPage), typeof(DetailDetailPage));`

---

## 🧪 Pruebas Unitarias y Aislamiento en CI/CD (`xUnit`)
La carpeta `/AppEHR.Tests` aloja pruebas automatizadas independientes.
- **Regla de oro de tolerancia:** Los ViewModels y Servicios deben diseñarse a prueba de fallos de plataforma.
- **Aislamiento en SecureStorage / DeviceInfo:** Al correr pruebas desde terminales UNIX en Jenkins/GitHub Actions, las APIs nativas como `SecureStorage` lanzan excepciones. Se debe estructurar try-catch o inyectar abstracciones mockeables (`ISecureStorage`) para evitar fallos de compilación y ejecución fuera de emuladores reales.
