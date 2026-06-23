# 📱 AppEHR - Asistente Móvil de Psicología 🏥🧠

> **Navegación Rápida:**
> *   **[🏥 Regresar al README Principal](../README.md)**
> *   **[⚙️ Backend (API REST)](../api/README.md)**
> *   **[💻 Cliente Web (ut-care)](../ut-care/README.md)**

---

## 📋 Descripción

**AppEHR** es una aplicación multiplataforma construida sobre el framework **.NET MAUI (.NET 10) con C# y XAML**. Funciona como un asistente de alta velocidad diseñado de forma exclusiva para los **psicólogos** operativos. 

Su funcionalidad se centra en:
1.  Consultar el itinerario diario de citas asignadas.
2.  Visualizar métricas semanales y mensuales de rendimiento.
3.  Registrar pacientes de tipo estudiante (restringido a las carreras asignadas del psicólogo) y de tipo docente/administrativo.
4.  Agendar citas rápidas presenciales sobre la marcha cuando los alumnos los abordan en pasillos o áreas comunes del campus.

---

## 🗺️ Diagrama de Flujo de Pantallas

El siguiente diagrama detalla la lógica de pantallas y las validaciones de negocio en tiempo de ejecución:

```mermaid
graph TD
    A[Inicio: App Móvil] --> B[🔑 Pantalla de Login]
    B -->|Ingresar Credenciales| C{¿El rol es 'psicologo'?}
    C -->|No| D[❌ Mostrar Alerta: Acceso Denegado]
    C -->|Sí| E[📅 Dashboard: Mi Agenda]
    
    E -->|Filtrar Citas| F[Pestañas: Hoy / Semana / Mes]
    E -->|Contacto Rápido| G[💬 WhatsApp / ✉️ Correo]
    E -->|Cerrar Sesión| B
    E -->|Botón Flotante +| H[🔍 Buscador de Pacientes]
    
    H -->|Ingresar Matrícula/ID| I{¿El Paciente Existe?}
    I -->|Sí| J[📝 Formulario de Cita Rápida]
    I -->|No| K[➕ Registrar Paciente Nuevo]
    
    K -->|Tipo: estudiante| L[Selector: Solo sus carreras asignadas]
    K -->|Guardar Paciente| J
    K -->|Cancelar| H
    
    J -->|Cita Min 40m - Max 90m| M{Validar y Registrar Cita}
    M -->|Éxito: Sincroniza API| E
```

---

## 📋 Requisitos del Entorno

Para compilar y ejecutar el proyecto móvil localmente, necesitas contar con:

*   **SDK de .NET 10.0** o superior.
*   **Workload de MAUI** instalado (`dotnet workload install maui`).
*   **Android Studio** (Para herramientas de SDK y emuladores Android).
*   **Windows 10/11** con el Modo Desarrollador activado (si compilas para Windows Desktop).

---

## 🚀 Pasos para Compilar y Ejecutar

Asegúrate de que la API backend esté ejecutándose en tu PC en el puerto `5000`.

1.  **Navegar al directorio móvil:**
    ```bash
    cd AppEHR
    ```
2.  **Restaurar dependencias NuGet:**
    ```bash
    dotnet restore
    ```
3.  **Ejecutar según la plataforma:**
    *   **En Windows (Desktop):**
        ```bash
        dotnet build -t:Run -f net10.0-windows10.0.19041.0
        ```
    *   **En macOS con Simulador iOS (iPhone virtual):**
        1. Abre el simulador desde Xcode:
           ```bash
           open -a Simulator
           ```
        2. (Opcional) Lista simuladores disponibles para elegir un modelo:
           ```bash
           xcrun simctl list devices
           ```
        3. Ejecuta la app en el simulador activo:
           ```bash
           dotnet build -t:Run -f net10.0-ios
           ```
        *También puedes seleccionar un simulador específico por nombre:*
        ```bash
        dotnet build -t:Run -f net10.0-ios -p:_DeviceName=":v2:udid=UDID_DEL_SIMULADOR"
        ```
    *   **En Emulador Android (con emulador encendido):**
        ```bash
        dotnet build -t:Run -f net10.0-android
        ```
        *(En emulador la app detecta automáticamente la red local y usa `http://10.0.2.2:5000/api` para el backend).*

---

## 📱 Depuración en Dispositivo Android Físico

Al depurar en un celular físico real por cable USB, realiza las siguientes configuraciones de seguridad y ruteo de red:

### 1. Activar permisos de desarrollador en el celular
*   Ve a **Ajustes > Opciones de desarrollador**.
*   Activa **Depuración USB** e **Instalar vía USB (Install via USB)**.
    *   *Dispositivos Xiaomi (MIUI/HyperOS):* Activar "Instalar vía USB" requiere conexión de datos móviles activa en el teléfono e iniciar sesión en tu cuenta Mi Account.
*   Mantén la pantalla del celular desbloqueada. Durante el despliegue de Visual Studio, aparecerá una alerta de seguridad preguntando si aceptas la instalación. Presiona **Aceptar** en menos de 10 segundos para evitar el error `INSTALL_FAILED_USER_RESTRICTED`.

### 2. Establecer redirección de puertos USB (ADB Reverse)
Dado que un celular físico no puede resolver el alias `10.0.2.2`, el constructor de `ApiService.cs` conmuta automáticamente a `localhost` en dispositivos físicos. Para crear el túnel de comunicación a través del cable USB:
*   Con el celular conectado por USB, abre PowerShell en tu PC y ejecuta:
    ```powershell
    & "C:\Program Files (x86)\Android\android-sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
    ```
    *(Si tienes `adb` configurado en tu PATH, puedes escribir simplemente: `adb reverse tcp:5000 tcp:5000`)*
*   El comando confirmará imprimiendo `5000`. Listo, ahora las solicitudes HTTP de la app se redirigirán a la API de tu computadora.

---

## 🍎 Depuración en Dispositivo iPhone Físico

Para ejecutar la app en un iPhone real (no simulador), necesitas preparar firma, confianza del equipo y modo desarrollador del dispositivo.

### 1. Requisitos previos en Mac
*   macOS con **Xcode** instalado y abierto al menos una vez.
*   Herramientas de línea de comandos de Xcode configuradas:
     ```bash
     xcode-select --install
     ```
*   Cuenta de Apple iniciada en Xcode (**Settings > Accounts**).

### 2. Preparar el iPhone
*   Conecta el iPhone por cable USB al Mac.
*   En el iPhone, acepta **Trust This Computer**.
*   Activa **Developer Mode** en iOS (Ajustes > Privacidad y seguridad > Developer Mode).
*   Mantén el dispositivo desbloqueado durante el primer despliegue.

### 3. Configurar firma (Code Signing)
*   Usa firma automática con tu Team de Apple en el proyecto.
*   Verifica que el identificador de paquete sea único en tu cuenta Apple (actualmente: `com.companyname.appehr`).
*   Si aparece error de provisioning, abre Xcode y deja que cree los perfiles automáticamente para el dispositivo.

### 4. Ejecutar en iPhone físico desde CLI
1. Lista dispositivos conectados y copia el UDID del iPhone:
    ```bash
    xcrun xctrace list devices
    ```
2. Ejecuta la app en iPhone físico con ese UDID:
    ```bash
    dotnet build -t:Run -f net10.0-ios -p:RuntimeIdentifier=ios-arm64 -p:_DeviceName=:v2:udid=TU_UDID
    ```

### 5. Backend local durante pruebas en iPhone
*   El iPhone **no** usa `10.0.2.2` (ese alias es solo para emulador Android).
*   Para pruebas reales, usa la IP LAN de tu computadora (ejemplo: `http://192.168.1.20:5000/api`) y asegúrate de que iPhone y Mac estén en la misma red.
*   Si usas HTTP sin TLS en desarrollo, confirma que tu configuración de iOS permita tráfico inseguro temporalmente para esa IP/host.

---

## 🧪 Casos de Prueba UAT (User Acceptance Testing)

Utiliza la cuenta del psicólogo de desarrollo para validar las reglas de negocio en la app:
*   **Usuario:** `carlos.rodriguez@ehr-system.com`
*   **Contraseña:** `Password123!`

### Casos prácticos a validar:
1.  **Restricción de Rol:** Intenta iniciar sesión con `daniela.guevara@ehr-system.com` (enfermero) u `orlando.casas@ehr-system.com` (coordinador). Confirma que se muestre la alerta: *"Acceso exclusivo para personal de psicología"*.
2.  **Validación de Citas:** Intenta agendar una cita con una duración menor a 40 minutos (ej. 30 min). Comprueba que el sistema lo rechace. Ajusta a 50 minutos y confirma que se agende con éxito.
3.  **Restricción de Carreras:** Presiona registrar paciente nuevo, selecciona tipo `student`. Comprueba que en la lista de carreras únicamente figuren las asignadas a Carlos Rodriguez (*TSU en Desarrollo y Gestión de Software* e *Ingeniería en Desarrollo y Gestión de Software*).

---

## 🤖 Pruebas Automatizadas (Unit Tests)

La solución incluye un proyecto de pruebas en xUnit para verificar la lógica de los ViewModels y convertidores de forma aislada:
```bash
cd AppEHR.Tests
dotnet test
```
*Los tests mockean las llamadas HTTP a la API y validan de manera local las duraciones de las citas y validación de rol.*
