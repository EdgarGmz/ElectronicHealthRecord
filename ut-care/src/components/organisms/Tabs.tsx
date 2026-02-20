import { useState, ReactNode } from 'react';

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-6" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`px-3 py-2 text-sm font-medium leading-5
                ${activeTab === index
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
