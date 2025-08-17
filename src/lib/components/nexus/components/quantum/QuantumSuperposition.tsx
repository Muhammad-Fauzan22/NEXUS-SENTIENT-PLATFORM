import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Fade, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import { QuantumUIState } from '../../types/advanced';

interface QuantumSuperpositionProps {
	states: Array<{ component: string; probability: number }>;
	coherenceLevel: number;
	onStateCollapse: (component: string) => void;
}

const SuperpositionContainer = styled(Box)(({ theme }) => ({
	position: 'relative',
	padding: theme.spacing(3),
	background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
	border: `1px solid ${theme.palette.info.main}30`,
	borderRadius: theme.spacing(2),
	backdropFilter: 'blur(10px)',
	overflow: 'hidden',
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background:
			'linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.1) 50%, transparent 70%)',
		animation: 'quantumWave 3s ease-in-out infinite',
		pointerEvents: 'none'
	},
	'@keyframes quantumWave': {
		'0%, 100%': {
			transform: 'translateX(-100%)'
		},
		'50%': {
			transform: 'translateX(100%)'
		}
	}
}));

const StateChip = styled(Chip)<{ probability: number }>(({ theme, probability }) => ({
	margin: theme.spacing(0.5),
	backgroundColor: `rgba(0, 212, 255, ${probability * 0.5})`,
	color: theme.palette.info.contrastText,
	border: `1px solid rgba(0, 212, 255, ${probability})`,
	cursor: 'pointer',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		backgroundColor: `rgba(0, 212, 255, ${Math.min(probability + 0.2, 1)})`,
		transform: 'scale(1.05)',
		boxShadow: `0 0 20px rgba(0, 212, 255, ${probability})`
	},
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
		animation: `quantumFlicker ${2 / probability}s ease-in-out infinite`,
		borderRadius: 'inherit'
	},
	'@keyframes quantumFlicker': {
		'0%, 100%': {
			opacity: 0
		},
		'50%': {
			opacity: 1
		}
	}
}));

const CoherenceIndicator = styled(Box)<{ level: number }>(({ theme, level }) => ({
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(1),
	marginBottom: theme.spacing(2),
	'& .coherence-bar': {
		width: '100px',
		height: '4px',
		background: theme.palette.grey[800],
		borderRadius: '2px',
		overflow: 'hidden',
		'&::after': {
			content: '""',
			display: 'block',
			width: `${level * 100}%`,
			height: '100%',
			background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
			transition: 'width 0.5s ease'
		}
	}
}));

export const QuantumSuperposition: React.FC<QuantumSuperpositionProps> = ({
	states,
	coherenceLevel,
	onStateCollapse
}) => {
	const [isCollapsing, setIsCollapsing] = useState(false);

	const handleStateClick = (component: string) => {
		setIsCollapsing(true);
		setTimeout(() => {
			onStateCollapse(component);
			setIsCollapsing(false);
		}, 500);
	};

	const formatProbability = (probability: number): string => {
		return `${(probability * 100).toFixed(1)}%`;
	};

	return (
		<SuperpositionContainer>
			<Stack spacing={2}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<GraphicEqOutlinedIcon sx={{ color: 'info.main', fontSize: '2rem' }} />
					<Typography variant="h6" sx={{ color: 'info.main', fontWeight: 600 }}>
						Quantum Superposition
					</Typography>
				</Stack>

				<CoherenceIndicator level={coherenceLevel}>
					<Typography variant="caption" color="text.secondary">
						Coherence:
					</Typography>
					<Box className="coherence-bar" />
					<Typography variant="caption" color="info.main">
						{(coherenceLevel * 100).toFixed(1)}%
					</Typography>
				</CoherenceIndicator>

				<Typography variant="body2" color="text.secondary">
					Multiple UI states existing simultaneously. Click to collapse wave function:
				</Typography>

				<Fade in={!isCollapsing} timeout={500}>
					<Stack direction="row" flexWrap="wrap" spacing={1}>
						{states.map((state, index) => (
							<StateChip
								key={index}
								label={`${state.component} (${formatProbability(state.probability)})`}
								probability={state.probability}
								onClick={() => handleStateClick(state.component)}
								icon={<GraphicEqOutlinedIcon />}
							/>
						))}
					</Stack>
				</Fade>

				{isCollapsing && (
					<Typography variant="body2" sx={{ color: 'warning.main', fontStyle: 'italic' }}>
						⚛️ Wave function collapsing...
					</Typography>
				)}
			</Stack>
		</SuperpositionContainer>
	);
};
