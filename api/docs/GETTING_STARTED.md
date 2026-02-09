# EHR API - Quick Start Guide

This guide will help you get the API up and running quickly.

## Prerequisites

- Node.js v18+ or v20+
- PostgreSQL v14+
- npm v9+

## Installation

1. **Install dependencies**
```bash
cd api
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ehr_db?schema=public"
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
```

3. **Set up the database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

4. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

## Available Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout (client-side)

### Users (requires authentication)
- `GET /api/users` - List all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (admin only)

### Patients (requires authentication)
- `GET /api/patients` - List all patients (with pagination and filters)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient (nurse/psychologist/admin)
- `PUT /api/patients/:id` - Update patient (nurse/psychologist/admin)
- `DELETE /api/patients/:id` - Deactivate patient (admin only)

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:5000/api-docs`

## Example Requests

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

### Get All Patients (with authentication)
```bash
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Development Commands

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# View Prisma Studio (database GUI)
npm run prisma:studio
```

## Project Structure

```
api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `JWT_REFRESH_SECRET` | JWT refresh secret key | - |
| `JWT_REFRESH_EXPIRES_IN` | JWT refresh expiration | 30d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists and user has permissions

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

### Prisma Client Issues
- Regenerate Prisma Client: `npm run prisma:generate`
- Check schema.prisma for errors

## Next Steps

1. Implement additional endpoints (appointments, medical records, etc.)
2. Add unit tests for services and controllers
3. Set up CI/CD pipeline
4. Configure production environment

## Support

For issues or questions, please create an issue in the GitHub repository.
