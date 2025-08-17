import React from 'react';
import { Box, Typography, Button, Stack, Switch, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import { NexusApp } from './NexusApp';
import { AdvancedNexusApp } from './AdvancedNexusApp';
import { CompanyLogo } from './components/CompanyLogo';
import { AICapability, InteractionMode } from './types/advanced';

const PreviewContainer = styled(Box)(({ theme }) => ({
	width: '100vw',
	height: '100vh',
	backgroundColor: '#000000',
	position: 'relative'
}));

const PreviewControls = styled(Box)(({ theme }) => ({
	position: 'fixed',
	top: theme.spacing(2),
	right: theme.spacing(2),
	zIndex: 9999,
	backgroundColor: `${theme.palette.background.paper}90`,
	backdropFilter: 'blur(10px)',
	padding: theme.spacing(2),
	borderRadius: theme.spacing(1),
	border: `1px solid ${theme.palette.primary.main}30`
}));

export const App: React.FC = () => {
	const [currentDemo, setCurrentDemo] = React.useState<
		'full' | 'advanced' | 'oracle' | 'assessment' | 'constellation' | 'dashboard'
	>('advanced');
	const [quantumMode, setQuantumMode] = React.useState(true);
	const [neuromorphicMode, setNeuromorphicMode] = React.useState(true);
	const [xrMode, setXrMode] = React.useState(true);

	const handleAssessmentComplete = (results: any) => {
		console.log('Assessment completed:', results);
	};

	const handleConstellationInteraction = (elementId: string, action: string) => {
		console.log('Constellation interaction:', elementId, action);
	};

	const handleEmotionalStateChange = (state: string) => {
		console.log('Emotional state changed:', state);
	};

	const handleProgressUpdate = (pillar: string, progress: number) => {
		console.log('Progress updated:', pillar, progress);
	};

	const renderDemo = () => {
		switch (currentDemo) {
			case 'advanced':
				return (
					<AdvancedNexusApp
						initialView="oracle-gate"
						debugMode={true}
						quantumMode={quantumMode}
						neuromorphicProcessing={neuromorphicMode}
						xrEnabled={xrMode}
						aiCapabilities={[
							AICapability.EMOTION_DETECTION,
							AICapability.PREDICTIVE_ANALYTICS,
							AICapability.NATURAL_LANGUAGE
						]}
						interactionModes={[
							InteractionMode.GESTURE,
							InteractionMode.VOICE,
							InteractionMode.EYE_TRACKING
						]}
						onAssessmentComplete={handleAssessmentComplete}
						onConstellationInteraction={handleConstellationInteraction}
						onEmotionalStateChange={handleEmotionalStateChange}
						onProgressUpdate={handleProgressUpdate}
					/>
				);
			case 'oracle':
				return (
					<NexusApp
						initialView="oracle-gate"
						debugMode={true}
						onAssessmentComplete={handleAssessmentComplete}
						onConstellationInteraction={handleConstellationInteraction}
						onEmotionalStateChange={handleEmotionalStateChange}
						onProgressUpdate={handleProgressUpdate}
					/>
				);
			case 'assessment':
				return (
					<NexusApp
						initialView="assessment"
						debugMode={true}
						onAssessmentComplete={handleAssessmentComplete}
						onConstellationInteraction={handleConstellationInteraction}
						onEmotionalStateChange={handleEmotionalStateChange}
						onProgressUpdate={handleProgressUpdate}
					/>
				);
			case 'constellation':
				return (
					<NexusApp
						initialView="constellation"
						debugMode={true}
						onAssessmentComplete={handleAssessmentComplete}
						onConstellationInteraction={handleConstellationInteraction}
						onEmotionalStateChange={handleEmotionalStateChange}
						onProgressUpdate={handleProgressUpdate}
					/>
				);
			case 'dashboard':
				return (
					<NexusApp
						initialView="dashboard"
						debugMode={true}
						onAssessmentComplete={handleAssessmentComplete}
						onConstellationInteraction={handleConstellationInteraction}
						onEmotionalStateChange={handleEmotionalStateChange}
						onProgressUpdate={handleProgressUpdate}
					/>
				);
			default:
				return (
					<AdvancedNexusApp
						initialView="oracle-gate"
						debugMode={true}
						quantumMode={quantumMode}
						neuromorphicProcessing={neuromorphicMode}
						xrEnabled={xrMode}
						aiCapabilities={[AICapability.EMOTION_DETECTION, AICapability.PREDICTIVE_ANALYTICS]}
						interactionModes={[InteractionMode.GESTURE, InteractionMode.VOICE]}
						onAssessmentComplete={handleAssessmentComplete}
						onConstellationInteraction={handleConstellationInteraction}
						onEmotionalStateChange={handleEmotionalStateChange}
						onProgressUpdate={handleProgressUpdate}
					/>
				);
		}
	};

	return (
		<PreviewContainer className="nexus-interface nexus-scrollbar">
			<PreviewControls>
				<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
					<CompanyLogo size="small" variant="glow" />
					<Box>
						<Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
							NEXUS Living Interface
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Demo Platform
						</Typography>
					</Box>
				</Stack>

				<Stack direction="column" spacing={1}>
					<Button
						size="small"
						variant={currentDemo === 'advanced' ? 'contained' : 'outlined'}
						onClick={() => setCurrentDemo('advanced')}
						sx={{ backgroundColor: currentDemo === 'advanced' ? 'error.main' : 'transparent' }}
					>
						⚛️ Quantum NEXUS
					</Button>
					<Button
						size="small"
						variant={currentDemo === 'full' ? 'contained' : 'outlined'}
						onClick={() => setCurrentDemo('full')}
					>
						Classic Experience
					</Button>
					<Button
						size="small"
						variant={currentDemo === 'oracle' ? 'contained' : 'outlined'}
						onClick={() => setCurrentDemo('oracle')}
					>
						Oracle Gate
					</Button>
					<Button
						size="small"
						variant={currentDemo === 'assessment' ? 'contained' : 'outlined'}
						onClick={() => setCurrentDemo('assessment')}
					>
						Assessment
					</Button>
					<Button
						size="small"
						variant={currentDemo === 'constellation' ? 'contained' : 'outlined'}
						onClick={() => setCurrentDemo('constellation')}
					>
						Constellation
					</Button>
					<Button
						size="small"
						variant={currentDemo === 'dashboard' ? 'contained' : 'outlined'}
						onClick={() => setCurrentDemo('dashboard')}
					>
						Dashboard
					</Button>
				</Stack>

				{currentDemo === 'advanced' && (
					<Stack
						direction="column"
						spacing={1}
						sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.800' }}
					>
						<Typography variant="caption" color="text.secondary">
							Advanced Features:
						</Typography>
						<FormControlLabel
							control={
								<Switch
									checked={quantumMode}
									onChange={(e) => setQuantumMode(e.target.checked)}
									size="small"
								/>
							}
							label="Quantum Mode"
							sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
						/>
						<FormControlLabel
							control={
								<Switch
									checked={neuromorphicMode}
									onChange={(e) => setNeuromorphicMode(e.target.checked)}
									size="small"
								/>
							}
							label="Neural Processing"
							sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
						/>
						<FormControlLabel
							control={
								<Switch
									checked={xrMode}
									onChange={(e) => setXrMode(e.target.checked)}
									size="small"
								/>
							}
							label="XR Interface"
							sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
						/>
					</Stack>
				)}
			</PreviewControls>

			{renderDemo()}
		</PreviewContainer>
	);
};

export default App;
