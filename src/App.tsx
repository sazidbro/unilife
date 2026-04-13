import React, { ReactNode } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Expenses } from './pages/Expenses';
import { Study } from './pages/Study';
import { Profile } from './pages/Profile';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('home');

  // Register Service Worker for PWA
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'expenses': return <Expenses />;
      case 'study': return <Study />;
      case 'profile': return <Profile />;
      default: return <Home />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
