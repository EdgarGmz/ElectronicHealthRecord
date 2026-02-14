# ut-care - Electronic Health Record Frontend

Sistema de Expedientes Médicos Electrónicos - Interfaz de Usuario

## 🚀 Características Implementadas

### Expediente Médico (Ver/Editar)
- ✅ Vista de solo lectura con toda la información del expediente médico
- ✅ Modo de edición con botón de activación
- ✅ Formularios editables para todos los campos del expediente
- ✅ Control de acceso basado en roles
- ✅ Estados de carga, éxito y error
- ✅ Notificaciones toast para feedback al usuario
- ✅ Interfaz responsiva
- ✅ Integración con backend API

## 🛠️ Stack Tecnológico

- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Zustand (gestión de estado)
- Axios
- React Hot Toast

## 🚀 Inicio Rápido

```bash
cd ut-care
npm install
npm run dev
```

## 📡 Modo Demo

Visita `http://localhost:5173/demo-login` para probar la interfaz sin backend.

## 🔐 Control de Acceso

| Rol | Ver | Editar |
|-----|-----|--------|
| Admin/Psicólogo/Enfermero | ✅ | ✅ |
| Estudiante | ✅ | ❌ |
