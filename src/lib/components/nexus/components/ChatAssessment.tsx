import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Rating, Chip, Fade, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import WifiTetheringOutlinedIcon from '@mui/icons-material/WifiTetheringOutlined';
import PixOutlinedIcon from '@mui/icons-material/PixOutlined';
import { ChatAssessmentProps, EmotionalState, AssessmentInputType } from '../types';
import { BrandingHeader } from './BrandingHeader';

const ChatContainer = styled(Box)(({ theme }) => ({
	width: '100vw',
	height: '100vh',
	background: 'linear-gradient(135deg, #000000 0%, #0A0A0A 50%, #1A1A1A 100%)',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	padding: theme.spacing(4),
	position: 'relative'
}));

const MessageContainer = styled(Box)(({ theme }) => ({
	maxWidth: '800px',
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing(3)
}));

const AIMessage = styled(Paper)<{ emotionalState: EmotionalState }>(({ theme, emotionalState }) => {
	const getAnimationSpeed = () => {
		switch (emotionalState) {
			case EmotionalState.STRESSED:
				return '3s';
			case EmotionalState.ENTHUSIASTIC:
				return '1s';
			default:
				return '2s';
		}
	};

	const getFontWeight = () => {
		switch (emotionalState) {
			case EmotionalState.STRESSED:
				return 300;
			case EmotionalState.ENTHUSIASTIC:
				return 500;
			default:
				return 400;
		}
	};

	return {
		padding: theme.spacing(3),
		backgroundColor: 'transparent',
		border: 'none',
		boxShadow: 'none',
		'& .message-text': {
			color: theme.palette.text.primary,
			fontFamily: '"Inter", sans-serif',
			fontSize: '1.1rem',
			fontWeight: getFontWeight(),
			lineHeight: 1.6,
			letterSpacing: '0.01em',
			animation: `textFlow ${getAnimationSpeed()} ease-out`,
			'@keyframes textFlow': {
				'0%': {
					opacity: 0,
					transform: 'translateY(10px)'
				},
				'100%': {
					opacity: 1,
					transform: 'translateY(0)'
				}
			}
		}
	};
});

const ThinkingOrb = styled(Box)<{ emotionalState: EmotionalState }>(({ theme, emotionalState }) => {
	const getColor = () => {
		switch (emotionalState) {
			case EmotionalState.STRESSED:
				return theme.palette.info.main;
			case EmotionalState.ENTHUSIASTIC:
				return theme.palette.warning.main;
			case EmotionalState.ANXIOUS:
				return theme.palette.error.main;
			case EmotionalState.CONFIDENT:
				return theme.palette.success.main;
			default:
				return theme.palette.primary.main;
		}
	};

	return {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing(2),
		marginBottom: theme.spacing(2),
		'& .orb-icon': {
			color: getColor(),
			fontSize: '2rem',
			animation: 'orbPulse 2s ease-in-out infinite',
			'@keyframes orbPulse': {
				'0%, 100%': {
					opacity: 0.6,
					transform: 'scale(1)'
				},
				'50%': {
					opacity: 1,
					transform: 'scale(1.2)'
				}
			}
		}
	};
});

const CrystalSelector = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexWrap: 'wrap',
	gap: theme.spacing(2),
	marginTop: theme.spacing(3)
}));

const CrystalChip = styled(Chip)(({ theme }) => ({
	padding: theme.spacing(1, 2),
	fontSize: '1rem',
	fontWeight: 500,
	backgroundColor: 'transparent',
	border: `2px solid ${theme.palette.primary.main}40`,
	color: theme.palette.text.primary,
	cursor: 'pointer',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		backgroundColor: `${theme.palette.primary.main}20`,
		borderColor: theme.palette.primary.main,
		transform: 'translateY(-2px)',
		boxShadow: `0 8px 25px ${theme.palette.primary.main}30`
	},
	'&.selected': {
		backgroundColor: `${theme.palette.primary.main}30`,
		borderColor: theme.palette.primary.main,
		boxShadow: `0 0 20px ${theme.palette.primary.main}50`
	},
	'& .MuiChip-icon': {
		color: theme.palette.primary.main,
		fontSize: '1.2rem'
	}
}));

const StyledRating = styled(Rating)(({ theme }) => ({
	fontSize: '2.5rem',
	marginTop: theme.spacing(3),
	'& .MuiRating-iconFilled': {
		color: theme.palette.warning.main
	},
	'& .MuiRating-iconHover': {
		color: theme.palette.warning.light
	},
	'& .MuiRating-iconEmpty': {
		color: theme.palette.grey[600]
	}
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
	position: 'absolute',
	top: theme.spacing(4),
	right: theme.spacing(4),
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(1),
	color: theme.palette.text.secondary,
	fontSize: '0.9rem'
}));

export const ChatAssessment: React.FC<ChatAssessmentProps> = ({
	questions,
	onResponse,
	emotionalState,
	currentQuestion
}) => {
	const [isThinking, setIsThinking] = useState(true);
	const [selectedValue, setSelectedValue] = useState<any>(null);
	const [showQuestion, setShowQuestion] = useState(false);

	const currentQ = questions[currentQuestion - 1];

	useEffect(() => {
		setIsThinking(true);
		setSelectedValue(null);
		setShowQuestion(false);

		const timer = setTimeout(() => {
			setIsThinking(false);
			setShowQuestion(true);
		}, 2000);

		return () => clearTimeout(timer);
	}, [currentQuestion]);

	const handleResponse = (value: any) => {
		setSelectedValue(value);
		setTimeout(() => {
			onResponse(currentQ.id, value);
		}, 500);
	};

	const formatEmotionalResponse = (state: EmotionalState): string => {
		switch (state) {
			case EmotionalState.STRESSED:
				return 'Mari kita lanjutkan dengan tenang...';
			case EmotionalState.ENTHUSIASTIC:
				return 'Semangat yang luar biasa! Mari kita lanjutkan...';
			case EmotionalState.CALM:
				return 'Terima kasih atas respons yang thoughtful...';
			default:
				return 'Mari kita lanjutkan...';
		}
	};

	const renderInput = () => {
		if (!currentQ) return null;

		switch (currentQ.type) {
			case AssessmentInputType.SCALE:
				return (
					<StyledRating
						value={selectedValue}
						onChange={(_, newValue) => handleResponse(newValue)}
						max={5}
						size="large"
					/>
				);

			case AssessmentInputType.CRYSTAL_SELECT:
				return (
					<CrystalSelector>
						{currentQ.options?.map((option, index) => (
							<CrystalChip
								key={index}
								icon={<PixOutlinedIcon />}
								label={option}
								className={selectedValue === option ? 'selected' : ''}
								onClick={() => handleResponse(option)}
							/>
						))}
					</CrystalSelector>
				);

			case AssessmentInputType.MULTIPLE_CHOICE:
				return (
					<Stack spacing={2} sx={{ mt: 3 }}>
						{currentQ.options?.map((option, index) => (
							<CrystalChip
								key={index}
								label={option}
								className={selectedValue === option ? 'selected' : ''}
								onClick={() => handleResponse(option)}
							/>
						))}
					</Stack>
				);

			default:
				return null;
		}
	};

	return (
		<ChatContainer>
			<BrandingHeader position="top-left" variant="logo-only" />

			<ProgressIndicator>
				{currentQuestion} / {questions.length}
			</ProgressIndicator>

			<MessageContainer>
				{isThinking && (
					<ThinkingOrb emotionalState={emotionalState}>
						<WifiTetheringOutlinedIcon className="orb-icon" />
						<Typography variant="body2" color="text.secondary">
							NEXUS sedang memproses...
						</Typography>
					</ThinkingOrb>
				)}

				<Fade in={showQuestion} timeout={1000}>
					<Box>
						<AIMessage emotionalState={emotionalState}>
							<Typography className="message-text">{currentQ?.text}</Typography>
							{renderInput()}
						</AIMessage>

						{selectedValue && (
							<Fade in timeout={500}>
								<AIMessage emotionalState={emotionalState}>
									<Typography className="message-text" variant="body2">
										{formatEmotionalResponse(emotionalState)}
									</Typography>
								</AIMessage>
							</Fade>
						)}
					</Box>
				</Fade>
			</MessageContainer>
		</ChatContainer>
	);
};
