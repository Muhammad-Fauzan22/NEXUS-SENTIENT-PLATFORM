import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
	Stack,
	Card,
	CardContent,
	Switch,
	FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import { XRMode } from '../../types/advanced';

interface XRInterfaceProps {
	mode: XRMode;
	headsetConnected: boolean;
	spatialTracking: boolean;
	handTracking: boolean;
	eyeTracking: boolean;
	environmentMapping: number;
	onModeChange: (mode: XRMode) => void;
	onFeatureToggle: (feature: string, enabled: boolean) => void;
}

const XRContainer = styled(Card)(({ theme }) => ({
	background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 153, 68, 0.1) 100%)',
	border: `1px solid ${theme.palette.warning.main}30`,
	borderRadius: theme.spacing(2),
	backdropFilter: 'blur(10px)',
	position: 'relative',
	overflow: 'hidden',
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'conic-gradient(from 0deg, transparent, rgba(255, 107, 0, 0.1), transparent)',
		animation: 'xrScan 4s linear infinite',
		pointerEvents: 'none'
	},
	'@keyframes xrScan': {
		'0%': {
			transform: 'rotate(0deg)'
		},
		'100%': {
			transform: 'rotate(360deg)'
		}
	}
}));

const XRViewport = styled(Box)<{ mode: XRMode }>(({ theme, mode }) => {
	const getModeColor = () => {
		switch (mode) {
			case XRMode.AR_OVERLAY:
				return theme.palette.info.main;
			case XRMode.VR_IMMERSIVE:
				return theme.palette.error.main;
			case XRMode.MR_COLLABORATIVE:
				return theme.palette.success.main;
			default:
				return theme.palette.grey[600];
		}
	};

	return {
		width: '100%',
		height: '200px',
		border: `2px solid ${getModeColor()}`,
		borderRadius: theme.spacing(1),
		background: `radial-gradient(circle at center, ${getModeColor()}10 0%, transparent 70%)`,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		overflow: 'hidden',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: '50%',
			left: '50%',
			width: '100px',
			height: '100px',
			border: `1px solid ${getModeColor()}`,
			borderRadius: '50%',
			transform: 'translate(-50%, -50%)',
			animation: mode !== XRMode.DISABLED ? 'xrPulse 2s ease-in-out infinite' : 'none'
		},
		'@keyframes xrPulse': {
			'0%, 100%': {
				transform: 'translate(-50%, -50%) scale(1)',
				opacity: 0.5
			},
			'50%': {
				transform: 'translate(-50%, -50%) scale(1.2)',
				opacity: 1
			}
		}
	};
});

const FeatureIndicator = styled(Box)<{ enabled: boolean }>(({ theme, enabled }) => ({
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(1),
	padding: theme.spacing(1),
	borderRadius: theme.spacing(0.5),
	backgroundColor: enabled ? `${theme.palette.warning.main}20` : 'transparent',
	border: `1px solid ${enabled ? theme.palette.warning.main : theme.palette.grey[600]}`,
	transition: 'all 0.3s ease'
}));

export const XRInterface: React.FC<XRInterfaceProps> = ({
	mode,
	headsetConnected,
	spatialTracking,
	handTracking,
	eyeTracking,
	environmentMapping,
	onModeChange,
	onFeatureToggle
}) => {
	const [isScanning, setIsScanning] = useState(false);

	useEffect(() => {
		if (mode !== XRMode.DISABLED) {
			setIsScanning(true);
			const timer = setTimeout(() => setIsScanning(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [mode]);

	const getModeLabel = (xrMode: XRMode): string => {
		switch (xrMode) {
			case XRMode.AR_OVERLAY:
				return '🔍 AR Overlay';
			case XRMode.VR_IMMERSIVE:
				return '🥽 VR Immersive';
			case XRMode.MR_COLLABORATIVE:
				return '🤝 MR Collaborative';
			default:
				return '📱 Disabled';
		}
	};

	const features = [
		{ key: 'spatialTracking', label: 'Spatial Tracking', enabled: spatialTracking, icon: '📍' },
		{ key: 'handTracking', label: 'Hand Tracking', enabled: handTracking, icon: '👋' },
		{ key: 'eyeTracking', label: 'Eye Tracking', enabled: eyeTracking, icon: '👁️' }
	];

	return (
		<XRContainer>
			<CardContent>
				<Stack spacing={3}>
					<Stack direction="row" alignItems="center" spacing={2}>
						<ViewInArOutlinedIcon sx={{ color: 'warning.main', fontSize: '2rem' }} />
						<Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 600 }}>
							Extended Reality Interface
						</Typography>
						{headsetConnected && (
							<Typography variant="caption" sx={{ color: 'success.main' }}>
								🟢 Headset Connected
							</Typography>
						)}
					</Stack>

					<XRViewport mode={mode}>
						<Typography variant="h6" color="text.secondary">
							{getModeLabel(mode)}
						</Typography>
						{isScanning && (
							<Typography
								variant="caption"
								sx={{ position: 'absolute', bottom: 16, color: 'warning.main' }}
							>
								Scanning environment...
							</Typography>
						)}
					</XRViewport>

					<Box>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							XR Mode:
						</Typography>
						<ToggleButtonGroup
							value={mode}
							exclusive
							onChange={(_, newMode) => newMode && onModeChange(newMode)}
							size="small"
							sx={{
								'& .MuiToggleButton-root': {
									border: '1px solid',
									borderColor: 'warning.main',
									color: 'text.secondary',
									'&.Mui-selected': {
										backgroundColor: 'warning.main',
										color: 'warning.contrastText'
									}
								}
							}}
						>
							<ToggleButton value={XRMode.DISABLED}>Disabled</ToggleButton>
							<ToggleButton value={XRMode.AR_OVERLAY}>AR</ToggleButton>
							<ToggleButton value={XRMode.VR_IMMERSIVE}>VR</ToggleButton>
							<ToggleButton value={XRMode.MR_COLLABORATIVE}>MR</ToggleButton>
						</ToggleButtonGroup>
					</Box>

					<Box>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							Tracking Features:
						</Typography>
						<Stack spacing={1}>
							{features.map((feature) => (
								<FeatureIndicator key={feature.key} enabled={feature.enabled}>
									<span>{feature.icon}</span>
									<FormControlLabel
										control={
											<Switch
												checked={feature.enabled}
												onChange={(e) => onFeatureToggle(feature.key, e.target.checked)}
												size="small"
												sx={{
													'& .MuiSwitch-switchBase.Mui-checked': {
														color: 'warning.main'
													},
													'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
														backgroundColor: 'warning.main'
													}
												}}
											/>
										}
										label={feature.label}
										sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
									/>
								</FeatureIndicator>
							))}
						</Stack>
					</Box>

					<Box>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							Environment Mapping: {(environmentMapping * 100).toFixed(1)}%
						</Typography>
						<Box
							sx={{
								width: '100%',
								height: '8px',
								backgroundColor: 'grey.800',
								borderRadius: '4px',
								overflow: 'hidden',
								'&::after': {
									content: '""',
									display: 'block',
									width: `${environmentMapping * 100}%`,
									height: '100%',
									background: 'linear-gradient(90deg, warning.main, warning.light)',
									transition: 'width 0.5s ease'
								}
							}}
						/>
					</Box>
				</Stack>
			</CardContent>
		</XRContainer>
	);
};
