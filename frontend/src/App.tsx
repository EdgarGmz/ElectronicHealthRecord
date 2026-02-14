import { DashboardLayout } from './components/templates/DashboardLayout';
import { Button } from './components/atoms/Button';
import { Badge } from './components/atoms/Badge';
import { Avatar } from './components/atoms/Avatar';
import { FormField } from './components/molecules/FormField';
import { Card, CardHeader, CardTitle, CardContent } from './components/molecules/Card';

function App() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Diseño Básico</h1>
          <p className="text-gray-600 mt-2">Componentes reutilizables para el EHR System</p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Botones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" isLoading>Loading</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Avatars Section */}
        <Card>
          <CardHeader>
            <CardTitle>Avatares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar fallback="JD" size="sm" />
              <Avatar fallback="AB" size="md" />
              <Avatar fallback="CD" size="lg" />
              <Avatar fallback="EF" size="xl" />
            </div>
          </CardContent>
        </Card>

        {/* Form Fields Section */}
        <Card>
          <CardHeader>
            <CardTitle>Campos de Formulario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <FormField
                label="Nombre del Paciente"
                placeholder="Ingrese el nombre"
                required
              />
              <FormField
                label="Matrícula"
                placeholder="Ej: A01234567"
                helperText="Formato: A seguido de 8 dígitos"
              />
              <FormField
                label="Email"
                type="email"
                placeholder="ejemplo@correo.com"
                error="El formato del email es inválido"
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle>Paleta de Colores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Primary</h4>
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-primary-500 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-primary-600 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-primary-700 rounded-lg shadow"></div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Success</h4>
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-success-500 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-success-600 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-success-700 rounded-lg shadow"></div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Warning</h4>
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-warning-500 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-warning-600 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-warning-700 rounded-lg shadow"></div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Error</h4>
                <div className="flex gap-2">
                  <div className="w-16 h-16 bg-error-500 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-error-600 rounded-lg shadow"></div>
                  <div className="w-16 h-16 bg-error-700 rounded-lg shadow"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default App;
