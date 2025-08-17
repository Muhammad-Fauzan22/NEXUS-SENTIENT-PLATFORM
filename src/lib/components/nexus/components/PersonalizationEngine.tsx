import React, { useState } from 'react';
import {
	Box,
	Paper,
	Typography,
	Stack,
	Switch,
	Slider,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Chip,
	useTheme,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import { AdaptationLevel, PersonalizationType } from '../types/personalizationEnums';
import {
	formatAdaptationLevel,
	formatPersonalizationType
} from '../utils/personalizationFormatters';

const GlassContainer = styled(Paper)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.1)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: '24px',
	padding: theme.spacing(3),
	position: 'relative',
	overflow: 'hidden'
}));

const GlassAccordion = styled(Accordion)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.05)',
	backdropFilter: 'blur(10px)',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	borderRadius: '16px !important',
	marginBottom: theme.spacing(2),
	'&:before': {
		display: 'none'
	},
	'&.Mui-expanded': {
		margin: `0 0 ${theme.spacing(2)} 0`
	}
}));

interface PersonalizationEngineProps {
	onSettingsChange?: (settings: any) => void;
}

export const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
	onSettingsChange
}) => {
	const theme = useTheme();
	const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
	const [adaptationLevel, setAdaptationLevel] = useState(AdaptationLevel.EXTENSIVE);
	const [autoUpdate, setAutoUpdate] = useState(true);
	const [selectedTypes, setSelectedTypes] = useState<PersonalizationType[]>([
		PersonalizationType.VISUAL,
		PersonalizationType.CONTENT,
		PersonalizationType.LAYOUT
	]);
	const [adaptationSpeed, setAdaptationSpeed] = useState(75);
	const [privacyLevel, setPrivacyLevel] = useState(50);

	const handlePersonalizationToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const enabled = event.target.checked;
		setPersonalizationEnabled(enabled);
		onSettingsChange?.({ personalizationEnabled: enabled });
	};

	const handleAdaptationLevelChange = (event: any) => {
		const level = event.target.value as AdaptationLevel;
		setAdaptationLevel(level);
		onSettingsChange?.({ adaptationLevel: level });
	};

	const handleTypeToggle = (type: PersonalizationType) => {
		const newTypes = selectedTypes.includes(type)
			? selectedTypes.filter((t) => t !== type)
			: [...selectedTypes, type];
		setSelectedTypes(newTypes);
		onSettingsChange?.({ selectedTypes: newTypes });
	};

	const getTypeIcon = (type: PersonalizationType) => {
		const icons = {
			[PersonalizationType.VISUAL]: <PaletteOutlinedIcon />,
			[PersonalizationType.CONTENT]: <LocalLibraryOutlinedIcon />,
			[PersonalizationType.LAYOUT]: <ManageAccountsOutlinedIcon />,
			[PersonalizationType.INTERACTION]: <ManageAccountsOutlinedIcon />,
			[PersonalizationType.NAVIGATION]: <ManageAccountsOutlinedIcon />
		};
		return icons[type];
	};

	return (
		<GlassContainer elevation={0}>
			{/* Header */}
			<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
				<ManageAccountsOutlinedIcon
					sx={{
						fontSize: '2rem',
						color: theme.palette.primary.main
					}}
				/>
				<Typography
					variant="h5"
					sx={{
						fontWeight: 700,
						background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent'
					}}
				>
					Personalization Engine
				</Typography>
				<Chip
					label={personalizationEnabled ? 'Active' : 'Inactive'}
					size="small"
					sx={{
						backgroundColor: personalizationEnabled
							? `${theme.palette.success.main}20`
							: `${theme.palette.grey[500]}20`,
						color: personalizationEnabled ? theme.palette.success.main : theme.palette.grey[500],
						fontWeight: 600
					}}
				/>
			</Stack>

			{/* Main Settings */}
			<GlassAccordion defaultExpanded>
				<AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />}>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						Core Settings
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Stack spacing={3}>
						{/* Enable/Disable Personalization */}
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
									Enable Personalization
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Allow the system to adapt based on your profile
								</Typography>
							</Box>
							<Switch
								checked={personalizationEnabled}
								onChange={handlePersonalizationToggle}
								sx={{
									'& .MuiSwitch-thumb': {
										background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
									}
								}}
							/>
						</Stack>

						{/* Adaptation Level */}
						<FormControl fullWidth>
							<InputLabel>Adaptation Level</InputLabel>
							<Select
								value={adaptationLevel}
								onChange={handleAdaptationLevelChange}
								label="Adaptation Level"
								disabled={!personalizationEnabled}
							>
								{Object.values(AdaptationLevel).map((level) => (
									<MenuItem key={level} value={level}>
										{formatAdaptationLevel(level)}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Auto Update */}
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
									Auto-Update Preferences
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Automatically update based on your behavior
								</Typography>
							</Box>
							<Switch
								checked={autoUpdate}
								onChange={(e) => setAutoUpdate(e.target.checked)}
								disabled={!personalizationEnabled}
							/>
						</Stack>
					</Stack>
				</AccordionDetails>
			</GlassAccordion>

			{/* Personalization Types */}
			<GlassAccordion>
				<AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />}>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						Personalization Types
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Stack spacing={2}>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Select which aspects of the interface should be personalized
						</Typography>

						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
								gap: 2
							}}
						>
							{Object.values(PersonalizationType).map((type) => (
								<Box
									key={type}
									onClick={() => handleTypeToggle(type)}
									sx={{
										p: 2,
										borderRadius: '12px',
										border: `2px solid ${
											selectedTypes.includes(type)
												? theme.palette.primary.main
												: 'rgba(255, 255, 255, 0.1)'
										}`,
										background: selectedTypes.includes(type)
											? `${theme.palette.primary.main}10`
											: 'rgba(255, 255, 255, 0.05)',
										cursor: personalizationEnabled ? 'pointer' : 'not-allowed',
										opacity: personalizationEnabled ? 1 : 0.5,
										transition: 'all 0.3s ease',
										'&:hover': personalizationEnabled
											? {
													transform: 'translateY(-2px)',
													boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
												}
											: {}
									}}
								>
									<Stack direction="row" alignItems="center" spacing={2}>
										<Box sx={{ color: theme.palette.primary.main }}>{getTypeIcon(type)}</Box>
										<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
											{formatPersonalizationType(type)}
										</Typography>
									</Stack>
								</Box>
							))}
						</Box>
					</Stack>
				</AccordionDetails>
			</GlassAccordion>

			{/* Advanced Settings */}
			<GlassAccordion>
				<AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />}>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						Advanced Settings
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Stack spacing={3}>
						{/* Adaptation Speed */}
						<Box>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
								Adaptation Speed: {adaptationSpeed}%
							</Typography>
							<Slider
								value={adaptationSpeed}
								onChange={(_, value) => setAdaptationSpeed(value as number)}
								disabled={!personalizationEnabled}
								min={0}
								max={100}
								step={5}
								marks={[
									{ value: 0, label: 'Slow' },
									{ value: 50, label: 'Medium' },
									{ value: 100, label: 'Fast' }
								]}
								sx={{
									'& .MuiSlider-thumb': {
										background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
									},
									'& .MuiSlider-track': {
										background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
									}
								}}
							/>
						</Box>

						{/* Privacy Level */}
						<Box>
							<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
								Privacy Level: {privacyLevel}%
							</Typography>
							<Slider
								value={privacyLevel}
								onChange={(_, value) => setPrivacyLevel(value as number)}
								disabled={!personalizationEnabled}
								min={0}
								max={100}
								step={10}
								marks={[
									{ value: 0, label: 'Open' },
									{ value: 50, label: 'Balanced' },
									{ value: 100, label: 'Private' }
								]}
								sx={{
									'& .MuiSlider-thumb': {
										background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
									},
									'& .MuiSlider-track': {
										background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
									}
								}}
							/>
						</Box>
					</Stack>
				</AccordionDetails>
			</GlassAccordion>
		</GlassContainer>
	);
};
