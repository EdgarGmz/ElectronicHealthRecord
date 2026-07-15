---
name: maui-xaml-standards
description: Estándares de diseño y mejores prácticas de XAML en .NET MAUI (AppEHR), incluyendo conversión de colores, elementos Path y controles nativos.
---

# Estándares y Mejores Prácticas de XAML en .NET MAUI (maui-xaml-standards) 🎨

Este documento define las reglas y estándares de codificación XAML para el cliente móvil **AppEHR**, asegurando un desarrollo de interfaces fluido, libre de excepciones en tiempo de ejecución y visualmente consistente con las pautas de diseño del sistema.

---

## 🎨 1. Manejo de Colores y Pinceles (Fill, Stroke y Background)

### ⚠️ Regla de Oro: Evitar "None"
A diferencia de la especificación web o SVG tradicional, **`.NET MAUI` no reconoce "None" como un color o pincel válido**. El intento de usar `Fill="None"` o `Stroke="None"` arrojará una excepción en tiempo de ejecución:
`System.InvalidOperationException: Cannot convert "None" into Microsoft.Maui.Graphics.Color`

*   **Solución Correcta:** Utiliza siempre **`Transparent`** para indicar la ausencia de color o relleno:
    ```xml
    <!-- CORRECTO -->
    <Path Data="M12 21.35l-1.45..."
          Fill="Transparent"
          Stroke="#3B82F6"
          StrokeThickness="2" />
    ```

### Adaptabilidad con AppThemeBinding
Todos los controles visuales deben responder al cambio de tema del sistema (Claro/Oscuro) mediante la extensión de marcado `AppThemeBinding`:
```xml
<Label Text="Título"
       TextColor="{AppThemeBinding Light={StaticResource Gray900}, Dark={StaticResource White}}" />
```

---

## 📐 2. Renderizado de Gráficos Vectoriales y Geometrías (Path)

### Iconografía SVG mediante Path en XAML
Para evitar cargar excesivas imágenes estáticas y mejorar la velocidad de renderizado, prefiere el uso del elemento `<Path>` con coordenadas SVG:
*   Define el tamaño explícitamente (`WidthRequest` y `HeightRequest`).
*   Configura `Aspect="Uniform"` para garantizar que el vector se escale correctamente dentro de sus límites.

### Toggle de Contraseñas y Geometrías Dinámicas en C#
Al alternar la visibilidad de contraseñas u otros cambios dinámicos de iconos vectoriales en el code-behind (`.xaml.cs`), se debe utilizar el convertidor específico de MAUI para geometrías SVG (`PathGeometryConverter`), instanciándolo directamente para evitar fallos de resolución de tipo reflectivo en dispositivos móviles (como Android):

```csharp
// Instanciar el convertidor específico de MAUI para geometrías
var converter = new Microsoft.Maui.Controls.Shapes.PathGeometryConverter();

// Convertir la cadena SVG a una geometría asignable
EyeIconPath.Data = (Microsoft.Maui.Controls.Shapes.Geometry)converter.ConvertFromInvariantString(
    PasswordEntry.IsPassword ? EyeOpenPath : EyeClosedPath);
```

---

## 📱 3. Estructura y Usabilidad de Formularios

### Rediseño de Controles de Entrada (Entry y Editor)
Para crear campos estéticos (como los bordes redondeados y fondos oscuros de UT-Care), encierra el elemento `Entry` dentro de un control `<Border>` y limpia los márgenes predeterminados del input:
```xml
<Border StrokeThickness="1" 
        Stroke="#1E293B"
        Background="#0F172A"
        HeightRequest="48"
        Padding="12,0">
    <Border.StrokeShape>
        <RoundRectangle CornerRadius="12" />
    </Border.StrokeShape>
    <Grid ColumnDefinitions="28, *">
        <!-- Icono Vectorial -->
        <Path Grid.Column="0" Data="..." Fill="#94A3B8" Aspect="Uniform" HeightRequest="18" WidthRequest="18" />
        <!-- Campo de texto nativo -->
        <Entry Grid.Column="1" Text="{Binding Username}" Placeholder="Usuario" Margin="0" TextColor="White" />
    </Grid>
</Border>
```

---

## 🚨 4. Compilación y Multi-Plataforma Segura

### Evitar Ejecuciones de Shell Exclusivas en Windows
Si se añaden Targets personalizados en el archivo `.csproj` (por ejemplo, para interactuar con certificados o atributos de bundle de Apple `xattr` en iOS), añade siempre la restricción de sistema operativo:
```xml
Condition="!$([MSBuild]::IsOSPlatform('Windows'))"
```
Esto evitará que los entornos de desarrollo locales bajo sistemas operativos Windows fallen durante la compilación por comandos incompatibles con PowerShell o CMD.
