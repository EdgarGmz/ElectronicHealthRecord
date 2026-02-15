import { Button } from "@/components/ui/button";
import { useCounterStore } from "@/store/counterStore";

export default function HomePage() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">
          UT-Care Frontend Demo
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          React + Vite + TypeScript + TailwindCSS + shadcn/ui + Zustand
        </p>

        <div className="mb-8 rounded-md bg-gray-100 p-6 dark:bg-gray-700">
          <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            Counter (Zustand State)
          </p>
          <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{count}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={increment}>Increment</Button>
          <Button onClick={decrement} variant="secondary">
            Decrement
          </Button>
          <Button onClick={reset} variant="outline">
            Reset
          </Button>
          <Button variant="destructive" disabled>
            Disabled
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-600">
          <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🚀</Button>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ <strong>All configurations working:</strong> TailwindCSS, shadcn/ui Button, Zustand
            store, TypeScript, and path aliases!
          </p>
        </div>
      </div>
    </div>
  );
}
