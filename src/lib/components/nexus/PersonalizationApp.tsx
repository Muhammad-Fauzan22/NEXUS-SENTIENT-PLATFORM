import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Stack, Fade, Tab, Tabs } from '@mui/material';
import { PersonalizedDashboard } from './components/PersonalizedDashboard';
import { PersonalizationEngine } from './components/PersonalizationEngine';
import { UserProfileManager } from './components/UserProfileManager';
import { NavigationHeader } from './components/NavigationHeader';
import { mockStore } from './data/personalizationMockData';
import theme from './theme/nexusTheme';

interface PersonalizationAppProps {
	initialTheme?: 'light' | 'dark';
	enablePersonalization?: boolean;
	autoAdaptation?: boolean;
	analyticsEnabled?: boolean;
	debugMode?: boolean;
	onThemeChange?: (theme: 'light' | 'dark') => void;
	onUserAction?: (action: string, data?: any) => void;
}

export const PersonalizationApp: React.FC<PersonalizationAppProps> = ({
	initialTheme = 'light',
	enablePersonalization = true,
	autoAdaptation = true,
	analyticsEnabled = true,
	debugMode = false,
	onThemeChange,
	onUserAction
}) => {
	const [currentTheme, setCurrentTheme] = useState(initialTheme);
	const [currentTab, setCurrentTab] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	const handleThemeToggle = () => {
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		setCurrentTheme(newTheme);
		onThemeChange?.(newTheme);
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setCurrentTab(newValue);
		onUserAction?.('tab_change', { tab: newValue });
	};

	const handleRecommendationClick = (recommendationId: string) => {
		onUserAction?.('recommendation_click', { recommendationId });
	};

	const handleMetricClick = (metric: string) => {
		onUserAction?.('metric_click', { metric });
	};

	const handleSettingsChange = (settings: any) => {
		onUserAction?.('settings_change', settings);
	};

	const handleProfileUpdate = () => {
		onUserAction?.('profile_update');
	};

	const handleReassessment = () => {
		onUserAction?.('reassessment_start');
	};

	const tabLabels = ['Dashboard', 'Engine', 'Profile'];

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />

			<Box
				sx={{
					minHeight: '100vh',
					background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${theme.palette.grey[50]} 100%)`,
					position: 'relative',
					overflow: 'hidden'
				}}
			>
				{/* Background Effects */}
				<Box
					sx={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: `
            radial-gradient(circle at 20% 50%, ${theme.palette.primary.main}15 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main}15 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, ${theme.palette.primary.light}10 0%, transparent 50%)
          `,
						animation: 'backgroundShift 20s ease-in-out infinite',
						zIndex: -1
					}}
				/>

				{/* Navigation */}
				<NavigationHeader
					onThemeToggle={handleThemeToggle}
					isDarkMode={currentTheme === 'dark'}
					notificationCount={mockStore.personalizationSettings.learningAnalytics ? 3 : 0}
					user={{
						name: 'John Doe',
						avatar: 'https://i.pravatar.cc/150?img=1'
					}}
					onNavigate={(section) => onUserAction?.('navigate', { section })}
				/>

				{/* Main Content */}
				<Fade in={isLoaded} timeout={1000}>
					<Box sx={{ pt: '80px', px: { xs: 2, md: 4 }, pb: 4 }}>
						{/* Tabs */}
						<Box sx={{ mb: 3 }}>
							<Tabs
								value={currentTab}
								onChange={handleTabChange}
								sx={{
									'& .MuiTab-root': {
										textTransform: 'none',
										fontWeight: 600,
										fontSize: '1rem',
										color: theme.palette.text.secondary,
										'&.Mui-selected': {
											color: theme.palette.primary.main
										}
									},
									'& .MuiTabs-indicator': {
										background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
										height: 3,
										borderRadius: '3px 3px 0 0'
									}
								}}
							>
								{tabLabels.map((label, index) => (
									<Tab key={index} label={label} />
								))}
							</Tabs>
						</Box>

						{/* Tab Content */}
						<Box sx={{ minHeight: '70vh' }}>
							{currentTab === 0 && (
								<PersonalizedDashboard
									onRecommendationClick={handleRecommendationClick}
									onMetricClick={handleMetricClick}
								/>
							)}

							{currentTab === 1 && (
								<PersonalizationEngine onSettingsChange={handleSettingsChange} />
							)}

							{currentTab === 2 && (
								<UserProfileManager
									onProfileUpdate={handleProfileUpdate}
									onReassessment={handleReassessment}
								/>
							)}
						</Box>
					</Box>
				</Fade>

				{/* Debug Panel */}
				{debugMode && (
					<Box
						sx={{
							position: 'fixed',
							bottom: 16,
							right: 16,
							background: 'rgba(0,0,0,0.9)',
							color: 'white',
							padding: 2,
							borderRadius: 2,
							fontSize: '0.75rem',
							zIndex: 9999,
							fontFamily: 'monospace',
							minWidth: 250
						}}
					>
						<div>Theme: {currentTheme}</div>
						<div>Tab: {tabLabels[currentTab]}</div>
						<div>Personalization: {enablePersonalization ? 'Enabled' : 'Disabled'}</div>
						<div>Auto-Adaptation: {autoAdaptation ? 'On' : 'Off'}</div>
						<div>Analytics: {analyticsEnabled ? 'Active' : 'Inactive'}</div>
						<div>Loaded: {isLoaded ? 'Yes' : 'No'}</div>
					</Box>
				)}
			</Box>

			<style>
				{`
          @keyframes backgroundShift {
            0%, 100% {
              transform: scale(1) rotate(0deg);
              opacity: 0.8;
            }
            33% {
              transform: scale(1.1) rotate(2deg);
              opacity: 1;
            }
            66% {
              transform: scale(0.9) rotate(-2deg);
              opacity: 0.9;
            }
          }
        `}
			</style>
		</ThemeProvider>
	);
};
