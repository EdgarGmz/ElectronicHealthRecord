# Student Profile Page - Implementation Documentation

## Overview
This document describes the implementation of the Student Profile (Perfil de Estudiante) feature for the Electronic Health Record system.

## Features Implemented

### 1. Frontend Infrastructure
- **React + TypeScript + Vite**: Modern frontend stack with fast build times
- **TailwindCSS v3**: Utility-first CSS framework for styling
- **React Router v6**: Client-side routing with dynamic routes
- **Atomic Design**: Component architecture following Atomic Design principles

### 2. Student Profile Page (`/students/:id`)

#### Components Structure

**Atoms** (Basic UI components):
- `LoadingSpinner`: Loading indicator with configurable sizes
- `Badge`: Status badges with color variants
- `Card`: Reusable card container

**Molecules** (Composite components):
- `PersonalInfoCard`: Displays student personal information
- `AcademicInfoCard`: Shows academic details (career, group, trimester)
- `EmergencyContactsCard`: Lists emergency contacts
- `Tabs`: Tab navigation component

**Organisms** (Complex components):
- `AppointmentsTab`: Appointments history placeholder
- `MedicalRecordsTab`: Medical records placeholder
- `PsychologyTab`: Psychology evaluations placeholder

**Pages**:
- `StudentProfilePage`: Main profile page with API integration
- `StudentProfileDemoPage`: Demo version with mock data
- `StudentsListPage`: Students list placeholder

### 3. Data Layer

#### Types (`types/student.types.ts`)
- `Student`: Complete student model
- `User`: User account information
- `Career`: Academic program information
- `EmergencyContact`: Emergency contact details
- `ApiResponse<T>`: Generic API response wrapper

#### Services (`services/`)
- `api.ts`: Axios client configuration with interceptors
- `student.service.ts`: Student data fetching service

#### Custom Hooks (`hooks/`)
- `useStudent`: Hook for fetching and managing student state

### 4. Features

#### Information Display
- ✅ Personal information (name, email, phone, date of birth)
- ✅ Academic information (career, group, trimester, enrollment number)
- ✅ Emergency contacts with relationship details
- ✅ Active/inactive status badge

#### Navigation & UI
- ✅ Dynamic route `/students/:id`
- ✅ Tab navigation for different sections
- ✅ Back navigation to students list
- ✅ Action buttons (Edit Profile, Schedule Appointment)

#### State Management
- ✅ Loading state with spinner
- ✅ Error handling with retry functionality
- ✅ 404 Not Found state
- ✅ Network error handling

#### Responsive Design
- ✅ Desktop layout with 3-column grid
- ✅ Tablet layout with 2-column grid
- ✅ Mobile layout with single column stack
- ✅ Responsive typography and spacing

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── molecules/
│   │   │   ├── AcademicInfoCard.tsx
│   │   │   ├── EmergencyContactsCard.tsx
│   │   │   ├── PersonalInfoCard.tsx
│   │   │   └── Tabs.tsx
│   │   ├── organisms/
│   │   │   ├── AppointmentsTab.tsx
│   │   │   ├── MedicalRecordsTab.tsx
│   │   │   └── PsychologyTab.tsx
│   │   └── pages/
│   │       ├── StudentProfilePage.tsx
│   │       ├── StudentProfileDemoPage.tsx
│   │       └── StudentsListPage.tsx
│   ├── hooks/
│   │   └── useStudent.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── student.service.ts
│   ├── types/
│   │   └── student.types.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Routes

- `/` - Redirects to `/students`
- `/students` - Students list (placeholder)
- `/students/demo` - Demo profile with mock data
- `/students/:id` - Student profile page (API integration)

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`.

### Endpoint Used
- `GET /api/patients/:id` - Fetch student details

**Note**: In the backend, students are stored as "patients" in the database.

### Authentication
The API client includes an authorization interceptor that adds JWT tokens from localStorage to all requests.

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
VITE_ENV=development
VITE_APP_NAME=EHR System - UT Care
VITE_APP_VERSION=1.0.0
```

## Running the Application

### Development
```bash
cd client
npm install
npm run dev
```
Access at: http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## Design Decisions

### Why Atomic Design?
- **Reusability**: Components can be easily reused across the application
- **Maintainability**: Clear hierarchy makes it easy to locate and update components
- **Scalability**: Easy to extend with new features
- **Testing**: Smaller components are easier to test in isolation

### Why TailwindCSS?
- **Utility-first**: Rapid UI development
- **Consistent design**: Predefined design tokens
- **Small bundle size**: PurgeCSS removes unused styles
- **Responsive**: Mobile-first responsive utilities

### Why React Router?
- **Dynamic routing**: Support for URL parameters (`:id`)
- **Declarative**: Easy to understand route configuration
- **Navigation**: Programmatic navigation with `useNavigate`

## Future Enhancements

### Short-term
- [ ] Implement real appointments data fetching
- [ ] Implement medical records display
- [ ] Implement psychology evaluations display
- [ ] Add edit profile functionality
- [ ] Add schedule appointment modal

### Medium-term
- [ ] Add search and filtering on students list
- [ ] Implement pagination for students list
- [ ] Add loading states for tab content
- [ ] Implement real-time updates with WebSockets

### Long-term
- [ ] Add offline support with service workers
- [ ] Implement print/export functionality
- [ ] Add accessibility improvements (ARIA labels)
- [ ] Implement internationalization (i18n)

## Testing Strategy

### Unit Tests (To be implemented)
- Component rendering tests
- Hook behavior tests
- Service layer tests

### Integration Tests (To be implemented)
- API integration tests
- User flow tests (navigation, form submission)

### E2E Tests (To be implemented)
- Complete user journeys
- Cross-browser testing

## Accessibility

Current implementation includes:
- Semantic HTML structure
- Keyboard navigation support for tabs
- SVG icons with appropriate attributes
- Color contrast compliance

## Performance Considerations

- **Code splitting**: React Router handles route-based code splitting
- **Optimized images**: SVG icons for scalability
- **Lazy loading**: Tabs content is rendered on demand
- **Minimal dependencies**: Only essential packages included

## Security

- **Authentication**: JWT token-based authentication
- **Authorization**: Role-based access control (via backend)
- **Input validation**: Type-safe TypeScript interfaces
- **XSS prevention**: React's built-in XSS protection

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

1. **Demo Mode**: The demo page uses static mock data
2. **Tab Content**: Medical records, appointments, and psychology tabs show placeholders
3. **No Backend**: Full functionality requires the backend API to be running
4. **No Authentication UI**: Login/logout functionality not yet implemented

## Troubleshooting

### Build Errors
If you encounter build errors, ensure you're using:
- Node.js v18+ or v20+
- npm v9+

### API Connection Issues
- Verify the backend API is running on port 5000
- Check the `VITE_API_URL` environment variable
- Ensure CORS is configured in the backend

### Styling Issues
- Run `npm run build` to regenerate Tailwind classes
- Check that `tailwind.config.js` includes all source paths
