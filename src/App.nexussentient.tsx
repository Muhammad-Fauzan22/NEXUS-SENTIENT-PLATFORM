import React from 'react';
import { NexusSentientApp } from './lib/components/nexus/NexusSentientApp';

const App: React.FC = () => {
	const handleThemeChange = (theme: 'light' | 'dark') => {
		console.log('Theme changed to:', theme);
	};

	const handleUserAction = (action: string, data?: any) => {
		console.log('User action:', action, data);
	};

	return (
		<NexusSentientApp
			initialTheme="light"
			showWelcomeModal={false}
			debugMode={true}
			onThemeChange={handleThemeChange}
			onUserAction={handleUserAction}
		/>
	);
};

export default App;
