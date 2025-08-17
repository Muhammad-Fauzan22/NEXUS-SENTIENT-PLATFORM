import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Rating, Stack, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { NeuromorphicPattern } from '../../types/advanced';

interface NeuralProcessorProps {
	activePatterns: NeuromorphicPattern[];
	learningRate: number;
	neuralActivity: number;
	onPatternChange: (patterns: NeuromorphicPattern[]) => void;
}

const NeuralContainer = styled(Card)(({ theme }) => ({
	background: 'linear-gradient(135deg, rgba(80, 200, 120, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%)',
	border: `1px solid ${theme.palette.success.main}30`,
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
		background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 70%)',
		animation: 'neuralPulse 2s ease-in-out infinite',
		pointerEvents: 'none'
	},
	'@keyframes neuralPulse': {
		'0%, 100%': {
			opacity: 0.3,
			transform: 'scale(1)'
		},
		'50%': {
			opacity: 0.7,
			transform: 'scale(1.05)'
		}
	}
}));

const SynapticProgress = styled(LinearProgress)<{ activity: number }>(({ theme, activity }) => ({
	height: '8px',
	borderRadius: '4px',
	backgroundColor: theme.palette.grey[800],
	'& .MuiLinearProgress-bar': {
		background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
		animation: `synapticFire ${2 / activity}s ease-in-out infinite`,
		borderRadius: '4px'
	},
	'@keyframes synapticFire': {
		'0%, 100%': {
			opacity: 0.6
		},
		'50%': {
			opacity: 1,
			boxShadow: `0 0 10px ${theme.palette.success.main}`
		}
	}
}));

const PatternChip = styled(Box)<{ active: boolean }>(({ theme, active }) => ({
	padding: theme.spacing(1, 2),
	borderRadius: theme.spacing(1),
	border: `1px solid ${active ? theme.palette.success.main : theme.palette.grey[600]}`,
	backgroundColor: active ? `${theme.palette.success.main}20` : 'transparent',
	color: active ? theme.palette.success.main : theme.palette.text.secondary,
	cursor: 'pointer',
	transition: 'all 0.3s ease',
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(1),
	'&:hover': {
		backgroundColor: `${theme.palette.success.main}30`,
		transform: 'translateY(-2px)',
		boxShadow: `0 4px 12px ${theme.palette.success.main}30`
	}
}));

const NeuralNetwork = styled(Box)(({ theme }) => ({
	display: 'grid',
	gridTemplateColumns: 'repeat(8, 1fr)',
	gap: theme.spacing(1),
	padding: theme.spacing(2),
	'& .neuron': {
		width: '12px',
		height: '12px',
		borderRadius: '50%',
		backgroundColor: theme.palette.success.main,
		opacity: 0.3,
		transition: 'all 0.3s ease',
		'&.active': {
			opacity: 1,
			boxShadow: `0 0 8px ${theme.palette.success.main}`,
			animation: 'neuronFire 1s ease-in-out infinite'
		}
	},
	'@keyframes neuronFire': {
		'0%, 100%': {
			transform: 'scale(1)'
		},
		'50%': {
			transform: 'scale(1.3)'
		}
	}
}));

export const NeuralProcessor: React.FC<NeuralProcessorProps> = ({
	activePatterns,
	learningRate,
	neuralActivity,
	onPatternChange
}) => {
	const [neurons, setNeurons] = useState<boolean[]>(new Array(64).fill(false));

	useEffect(() => {
		const interval = setInterval(() => {
			setNeurons((prev) => prev.map(() => Math.random() < neuralActivity));
		}, 500);

		return () => clearInterval(interval);
	}, [neuralActivity]);

	const patterns = [
		{ id: NeuromorphicPattern.SPIKE_TIMING, label: 'Spike Timing', icon: '⚡' },
		{ id: NeuromorphicPattern.PLASTICITY, label: 'Plasticity', icon: '🧠' },
		{ id: NeuromorphicPattern.HOMEOSTASIS, label: 'Homeostasis', icon: '⚖️' },
		{ id: NeuromorphicPattern.ADAPTATION, label: 'Adaptation', icon: '🔄' }
	];

	const togglePattern = (pattern: NeuromorphicPattern) => {
		const newPatterns = activePatterns.includes(pattern)
			? activePatterns.filter((p) => p !== pattern)
			: [...activePatterns, pattern];
		onPatternChange(newPatterns);
	};

	return (
		<NeuralContainer>
			<CardContent>
				<Stack spacing={3}>
					<Stack direction="row" alignItems="center" spacing={2}>
						<HubOutlinedIcon sx={{ color: 'success.main', fontSize: '2rem' }} />
						<Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
							Neuromorphic Processor
						</Typography>
					</Stack>

					<Stack spacing={2}>
						<Box>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Neural Activity: {(neuralActivity * 100).toFixed(1)}%
							</Typography>
							<SynapticProgress
								variant="determinate"
								value={neuralActivity * 100}
								activity={neuralActivity}
							/>
						</Box>

						<Box>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Learning Rate
							</Typography>
							<Rating
								value={learningRate * 5}
								readOnly
								precision={0.1}
								sx={{
									'& .MuiRating-iconFilled': {
										color: 'success.main'
									}
								}}
							/>
						</Box>
					</Stack>

					<Box>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							Active Neural Patterns:
						</Typography>
						<Stack direction="row" flexWrap="wrap" spacing={1}>
							{patterns.map((pattern) => (
								<PatternChip
									key={pattern.id}
									active={activePatterns.includes(pattern.id)}
									onClick={() => togglePattern(pattern.id)}
								>
									<span>{pattern.icon}</span>
									<Typography variant="caption">{pattern.label}</Typography>
								</PatternChip>
							))}
						</Stack>
					</Box>

					<Box>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							Neural Network Activity:
						</Typography>
						<NeuralNetwork>
							{neurons.map((active, index) => (
								<Box key={index} className={`neuron ${active ? 'active' : ''}`} />
							))}
						</NeuralNetwork>
					</Box>
				</Stack>
			</CardContent>
		</NeuralContainer>
	);
};
