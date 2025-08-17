import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Stack, Fade } from '@mui/material';
import { HeroSection } from './components/HeroSection';
import { NavigationHeader } from './components/NavigationHeader';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Footer } from './components/Footer';
import { mockStore } from './data/nexusSentientMockData';
import theme from './theme/nexusTheme';

interface NexusSentientAppProps {
	initialTheme?: 'light' | 'dark';
	showWelcomeModal?: boolean;
	debugMode?: boolean;
	onThemeChange?: (theme: 'light' | 'dark') => void;
	onUserAction?: (action: string, data?: any) => void;
}

export const NexusSentientApp: React.FC<NexusSentientAppProps> = ({
	initialTheme = 'light',
	showWelcomeModal = false,
	debugMode = false,
	onThemeChange,
	onUserAction
}) => {
	const [currentTheme, setCurrentTheme] = useState(initialTheme);
	const [currentSection, setCurrentSection] = useState('hero');
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	const handleThemeToggle = () => {
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		setCurrentTheme(newTheme);
		onThemeChange?.(newTheme);
	};

	const handleNavigation = (section: string) => {
		setCurrentSection(section);
		onUserAction?.('navigate', { section });

		// Smooth scroll to section
		const element = document.getElementById(section);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const handleGetStarted = () => {
		handleNavigation('dashboard');
		onUserAction?.('get_started');
	};

	const handleLearnMore = () => {
		handleNavigation('analytics');
		onUserAction?.('learn_more');
	};

	const handleMetricClick = (metric: string) => {
		onUserAction?.('metric_click', { metric });
	};

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
					notificationCount={mockStore.notifications.length}
					user={mockStore.user}
					onNavigate={handleNavigation}
				/>

				{/* Main Content */}
				<Fade in={isLoaded} timeout={1000}>
					<Stack spacing={0}>
						{/* Hero Section */}
						<Box id="hero" sx={{ pt: '64px' }}>
							<HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
						</Box>

						{/* Dashboard Section */}
						<Box
							id="dashboard"
							sx={{
								minHeight: '100vh',
								display: 'flex',
								alignItems: 'center',
								px: { xs: 2, md: 4 },
								py: 8
							}}
						>
							<AnalyticsDashboard onMetricClick={handleMetricClick} />
						</Box>

						{/* Analytics Section */}
						<Box
							id="analytics"
							sx={{
								minHeight: '50vh',
								display: 'flex',
								alignItems: 'center',
								px: { xs: 2, md: 4 },
								py: 4
							}}
						>
							{/* Additional analytics content can be added here */}
						</Box>

						{/* Footer */}
						<Box sx={{ px: { xs: 2, md: 4 } }}>
							<Footer />
						</Box>
					</Stack>
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
							minWidth: 200
						}}
					>
						<div>Theme: {currentTheme}</div>
						<div>Section: {currentSection}</div>
						<div>User: {mockStore.user.name}</div>
						<div>Notifications: {mockStore.notifications.length}</div>
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
