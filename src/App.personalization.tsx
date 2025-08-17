import React from 'react';
import { PersonalizationApp } from './lib/components/nexus/PersonalizationApp';

const App: React.FC = () => {
  const handleThemeChange = (theme: 'light' | 'dark') => {
    console.log('Theme changed to:', theme);
  };

  const handleUserAction = (action: string, data?: any) => {
    console.log('User action:', action, data);
  };

  return (
    <PersonalizationApp
      initialTheme="light"
      enablePersonalization={true}
      autoAdaptation={true}
      analyticsEnabled={true}
      debugMode={true}
      onThemeChange={handleThemeChange}
      onUserAction={handleUserAction}
    />
  );
};

export default App;