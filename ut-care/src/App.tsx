import { Sidebar } from './components/organisms/Sidebar';
import { Dashboard } from './components/pages/Dashboard';

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;

