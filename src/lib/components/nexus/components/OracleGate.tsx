import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { OracleGateProps } from '../types';
import { BrandingHeader } from './BrandingHeader';

const OracleContainer = styled(Box)(({ theme }) => ({
	width: '100vw',
	height: '100vh',
	backgroundColor: '#000000',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	position: 'relative',
	overflow: 'hidden',
	cursor: 'none'
}));

const PulsingLine = styled(Box)<{ mouseX: number; mouseY: number; isActive: boolean }>(
	({ theme, mouseX, mouseY, isActive }) => ({
		width: isActive ? '300px' : '200px',
		height: '2px',
		background: `linear-gradient(90deg, 
    transparent 0%, 
    ${theme.palette.primary.main} 20%, 
    ${theme.palette.primary.light} 50%, 
    ${theme.palette.primary.main} 80%, 
    transparent 100%)`,
		position: 'relative',
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		transform: `translateX(${(mouseX - window.innerWidth / 2) * 0.1}px) 
             translateY(${(mouseY - window.innerHeight / 2) * 0.05}px)
             scaleX(${1 + Math.abs(mouseX - window.innerWidth / 2) * 0.001})`,
		filter: 'blur(0.5px)',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: '-1px',
			left: '0',
			right: '0',
			height: '4px',
			background: 'inherit',
			filter: 'blur(2px)',
			opacity: 0.6
		},
		'&::after': {
			content: '""',
			position: 'absolute',
			top: '0',
			left: '50%',
			width: '20px',
			height: '2px',
			background: theme.palette.primary.light,
			transform: 'translateX(-50%)',
			animation: 'pulse 2s ease-in-out infinite',
			boxShadow: `0 0 20px ${theme.palette.primary.main}`
		},
		'@keyframes pulse': {
			'0%, 100%': {
				opacity: 0.4,
				transform: 'translateX(-50%) scaleX(1)'
			},
			'50%': {
				opacity: 1,
				transform: 'translateX(-50%) scaleX(1.5)'
			}
		}
	})
);

const InteractiveCircle = styled(IconButton)(({ theme }) => ({
	width: '60px',
	height: '60px',
	border: `1px solid ${theme.palette.primary.main}`,
	borderRadius: '50%',
	backgroundColor: 'transparent',
	marginTop: theme.spacing(4),
	transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
	position: 'relative',
	'&:hover': {
		backgroundColor: `${theme.palette.primary.main}20`,
		transform: 'scale(1.1)',
		boxShadow: `0 0 30px ${theme.palette.primary.main}40`
	},
	'&::before': {
		content: '""',
		position: 'absolute',
		top: '-2px',
		left: '-2px',
		right: '-2px',
		bottom: '-2px',
		border: `1px solid ${theme.palette.primary.main}`,
		borderRadius: '50%',
		animation: 'ripple 3s ease-out infinite'
	},
	'@keyframes ripple': {
		'0%': {
			transform: 'scale(1)',
			opacity: 1
		},
		'100%': {
			transform: 'scale(1.5)',
			opacity: 0
		}
	}
}));

const FloatingText = styled(Typography)(({ theme }) => ({
	color: theme.palette.text.primary,
	textAlign: 'center',
	maxWidth: '600px',
	marginTop: theme.spacing(3),
	fontFamily: '"Syne", sans-serif',
	fontSize: '1.2rem',
	fontWeight: 300,
	letterSpacing: '0.02em',
	lineHeight: 1.6,
	opacity: 0,
	animation: 'textAppear 1s ease-out forwards',
	'@keyframes textAppear': {
		'0%': {
			opacity: 0,
			transform: 'translateY(20px)'
		},
		'100%': {
			opacity: 1,
			transform: 'translateY(0)'
		}
	}
}));

export const OracleGate: React.FC<OracleGateProps> = ({ onEnter, isActive }) => {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [showText, setShowText] = useState(false);
	const [isLineActive, setIsLineActive] = useState(false);
	const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({ x: e.clientX, y: e.clientY });
			setIsLineActive(true);

			// Clear existing timer
			if (inactivityTimer.current) {
				clearTimeout(inactivityTimer.current);
			}

			// Set new timer for 3 seconds of inactivity
			inactivityTimer.current = setTimeout(() => {
				setShowText(true);
				setIsLineActive(false);
			}, 3000);
		};

		const handleMouseLeave = () => {
			setIsLineActive(false);
		};

		if (isActive) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseleave', handleMouseLeave);
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseleave', handleMouseLeave);
			if (inactivityTimer.current) {
				clearTimeout(inactivityTimer.current);
			}
		};
	}, [isActive]);

	const handleCircleClick = () => {
		onEnter();
	};

	return (
		<OracleContainer>
			<BrandingHeader
				position="top-left"
				variant="minimal"
				showCompanyName={true}
				companyName="NEXUS"
			/>

			<PulsingLine mouseX={mousePosition.x} mouseY={mousePosition.y} isActive={isLineActive} />

			<Fade in={showText} timeout={1000}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<FloatingText>
						Kami merasakan potensi Anda. Apakah Anda siap untuk memetakannya?
					</FloatingText>

					<InteractiveCircle onClick={handleCircleClick}>
						<Box
							sx={{
								width: '8px',
								height: '8px',
								backgroundColor: 'primary.main',
								borderRadius: '50%'
							}}
						/>
					</InteractiveCircle>
				</Box>
			</Fade>
		</OracleContainer>
	);
};
