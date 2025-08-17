import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Tooltip, Fade, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ModeStandbyOutlinedIcon from '@mui/icons-material/ModeStandbyOutlined';
import AlbumOutlinedIcon from '@mui/icons-material/AlbumOutlined';
import Brightness2OutlinedIcon from '@mui/icons-material/Brightness2Outlined';
import { ConstellationProps, DevelopmentPillar } from '../types';
import { BrandingHeader } from './BrandingHeader';

const ConstellationContainer = styled(Box)(({ theme }) => ({
	width: '100vw',
	height: '100vh',
	background: 'radial-gradient(ellipse at center, #0A0A0A 0%, #000000 70%)',
	position: 'relative',
	overflow: 'hidden',
	cursor: 'grab',
	'&:active': {
		cursor: 'grabbing'
	}
}));

const ConstellationCanvas = styled(Box)(({ theme }) => ({
	width: '100%',
	height: '100%',
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center'
}));

const CentralStar = styled(Box)<{ brightness: number }>(({ theme, brightness }) => ({
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	cursor: 'pointer',
	transition: 'all 0.3s ease',
	'&:hover': {
		transform: 'translate(-50%, -50%) scale(1.2)'
	},
	'& .star-icon': {
		fontSize: '4rem',
		color: theme.palette.primary.main,
		filter: `brightness(${brightness}) drop-shadow(0 0 20px ${theme.palette.primary.main})`,
		animation: 'starPulse 3s ease-in-out infinite',
		'@keyframes starPulse': {
			'0%, 100%': {
				opacity: 0.8,
				transform: 'scale(1)'
			},
			'50%': {
				opacity: 1,
				transform: 'scale(1.1)'
			}
		}
	}
}));

const Planet = styled(Box)<{
	color: string;
	progress: number;
	x: number;
	y: number;
	isHovered: boolean;
}>(({ theme, color, progress, x, y, isHovered }) => ({
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${isHovered ? 1.3 : 1})`,
	cursor: 'pointer',
	transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
	'& .planet-icon': {
		fontSize: '3rem',
		color: color,
		filter: `brightness(${0.5 + progress * 0.5}) drop-shadow(0 0 15px ${color})`,
		animation: 'planetOrbit 20s linear infinite',
		'@keyframes planetOrbit': {
			'0%': {
				transform: 'rotate(0deg)'
			},
			'100%': {
				transform: 'rotate(360deg)'
			}
		}
	}
}));

const Moon = styled(Box)<{
	x: number;
	y: number;
	brightness: number;
	isVisible: boolean;
}>(({ theme, x, y, brightness, isVisible }) => ({
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${isVisible ? 1 : 0})`,
	cursor: 'pointer',
	transition: 'all 0.3s ease',
	opacity: isVisible ? 1 : 0,
	'&:hover': {
		transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${isVisible ? 1.2 : 0})`
	},
	'& .moon-icon': {
		fontSize: '1.5rem',
		color: theme.palette.secondary.main,
		filter: `brightness(${brightness}) drop-shadow(0 0 10px ${theme.palette.secondary.main})`
	}
}));

const ConnectionLine = styled('svg')<{ isVisible: boolean }>(({ theme, isVisible }) => ({
	position: 'absolute',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	pointerEvents: 'none',
	opacity: isVisible ? 0.6 : 0,
	transition: 'opacity 0.5s ease',
	'& line': {
		stroke: theme.palette.warning.main,
		strokeWidth: 2,
		strokeDasharray: '5,5',
		animation: 'connectionFlow 3s ease-in-out infinite',
		filter: `drop-shadow(0 0 5px ${theme.palette.warning.main})`
	},
	'@keyframes connectionFlow': {
		'0%, 100%': {
			strokeDashoffset: 0
		},
		'50%': {
			strokeDashoffset: 10
		}
	}
}));

const InfoPanel = styled(Paper)(({ theme }) => ({
	position: 'absolute',
	top: theme.spacing(4),
	left: theme.spacing(4),
	padding: theme.spacing(3),
	backgroundColor: `${theme.palette.background.paper}90`,
	backdropFilter: 'blur(10px)',
	border: `1px solid ${theme.palette.primary.main}30`,
	borderRadius: theme.spacing(2),
	maxWidth: '300px'
}));

const PillarColors = {
	[DevelopmentPillar.ACADEMIC]: '#4A90E2',
	[DevelopmentPillar.MANAGERIAL]: '#50C878',
	[DevelopmentPillar.LEADERSHIP]: '#FFD93D',
	[DevelopmentPillar.TECHNICAL]: '#FF6B6B',
	[DevelopmentPillar.SOCIAL]: '#6BCFFF'
};

export const ConstellationDashboard: React.FC<ConstellationProps> = ({
	userProgress,
	developmentPillars,
	activities,
	hiddenOpportunities,
	onElementClick
}) => {
	const [hoveredElement, setHoveredElement] = useState<string | null>(null);
	const [selectedElement, setSelectedElement] = useState<string | null>(null);
	const [showConnections, setShowConnections] = useState(false);
	const [rotation, setRotation] = useState({ x: 0, y: 0 });
	const containerRef = useRef<HTMLDivElement>(null);

	// Mock constellation data based on props
	const planets = developmentPillars.map((pillar, index) => {
		const angle = (index * 2 * Math.PI) / developmentPillars.length;
		const radius = 150;
		return {
			id: pillar,
			pillar,
			progress: userProgress.pillarProgress[pillar] || 0,
			color: PillarColors[pillar],
			position: {
				x: Math.cos(angle) * radius,
				y: Math.sin(angle) * radius,
				z: 0
			}
		};
	});

	const moons = activities
		.map((activity, index) => {
			const parentPlanet = planets.find((p) => p.pillar === activity.pillar);
			if (!parentPlanet) return null;

			const moonAngle = (index * Math.PI) / 2;
			const moonRadius = 40;

			return {
				id: activity.id,
				parentPlanet: parentPlanet.id,
				activity,
				brightness: 0.6 + (userProgress.completedActivities.includes(activity.id) ? 0.4 : 0),
				position: {
					x: parentPlanet.position.x + Math.cos(moonAngle) * moonRadius,
					y: parentPlanet.position.y + Math.sin(moonAngle) * moonRadius,
					z: 0
				}
			};
		})
		.filter(Boolean);

	const connections = hiddenOpportunities.map((opportunity) => ({
		id: opportunity.id,
		from: opportunity.connection[0],
		to: opportunity.connection[1],
		strength: 0.7,
		opportunity
	}));

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowConnections(true);
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	const handleElementClick = (elementId: string) => {
		setSelectedElement(elementId);
		onElementClick(elementId);
	};

	const getPlanetPosition = (pillar: DevelopmentPillar) => {
		const planet = planets.find((p) => p.pillar === pillar);
		return planet?.position || { x: 0, y: 0 };
	};

	const renderConnections = () => {
		return connections.map((connection) => {
			const fromPos = getPlanetPosition(connection.from as DevelopmentPillar);
			const toPos = getPlanetPosition(connection.to as DevelopmentPillar);

			return (
				<ConnectionLine key={connection.id} isVisible={showConnections}>
					<line
						x1={`${50 + fromPos.x / 10}%`}
						y1={`${50 + fromPos.y / 10}%`}
						x2={`${50 + toPos.x / 10}%`}
						y2={`${50 + toPos.y / 10}%`}
					/>
				</ConnectionLine>
			);
		});
	};

	return (
		<ConstellationContainer ref={containerRef}>
			<BrandingHeader
				position="top-right"
				variant="minimal"
				showCompanyName={true}
				companyName="NEXUS"
			/>

			<InfoPanel>
				<Typography variant="h6" gutterBottom>
					Konstelasi Pengembangan
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Progress Keseluruhan: {Math.round(userProgress.overallProgress * 100)}%
				</Typography>
				{selectedElement && (
					<Fade in timeout={300}>
						<Box sx={{ mt: 2 }}>
							<Typography variant="body2" color="primary">
								Elemen terpilih: {selectedElement}
							</Typography>
						</Box>
					</Fade>
				)}
			</InfoPanel>

			<ConstellationCanvas>
				{renderConnections()}

				<Tooltip title="Analisis Potensi Inti" arrow>
					<CentralStar brightness={1.2} onClick={() => handleElementClick('central-star')}>
						<ModeStandbyOutlinedIcon className="star-icon" />
					</CentralStar>
				</Tooltip>

				{planets.map((planet) => (
					<Tooltip
						key={planet.id}
						title={`${planet.pillar} - ${Math.round(planet.progress * 100)}%`}
						arrow
					>
						<Planet
							color={planet.color}
							progress={planet.progress}
							x={planet.position.x}
							y={planet.position.y}
							isHovered={hoveredElement === planet.id}
							onMouseEnter={() => setHoveredElement(planet.id)}
							onMouseLeave={() => setHoveredElement(null)}
							onClick={() => handleElementClick(planet.id)}
						>
							<AlbumOutlinedIcon className="planet-icon" />
						</Planet>
					</Tooltip>
				))}

				{moons.map((moon) => (
					<Tooltip key={moon.id} title={moon.activity.title} arrow>
						<Moon
							x={moon.position.x}
							y={moon.position.y}
							brightness={moon.brightness}
							isVisible={
								hoveredElement === moon.parentPlanet || selectedElement === moon.parentPlanet
							}
							onClick={() => handleElementClick(moon.id)}
						>
							<Brightness2OutlinedIcon className="moon-icon" />
						</Moon>
					</Tooltip>
				))}
			</ConstellationCanvas>
		</ConstellationContainer>
	);
};
