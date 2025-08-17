import React, { useState } from 'react';
import {
	Box,
	Paper,
	Typography,
	Stack,
	IconButton,
	Menu,
	MenuItem,
	useTheme,
	Collapse,
	Button,
	Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, LineChart, RadarChart } from '@mui/x-charts';
import { PersonalizationCard } from './PersonalizationCard';
import { MetricCard } from './MetricCard';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import { mockQuery } from '../data/personalizationMockData';

const GlassDashboard = styled(Paper)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.1)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: '24px',
	padding: theme.spacing(3),
	position: 'relative',
	overflow: 'hidden'
}));

const ChartContainer = styled(Box)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.05)',
	backdropFilter: 'blur(10px)',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	borderRadius: '16px',
	padding: theme.spacing(2),
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		background: 'rgba(255, 255, 255, 0.1)',
		transform: 'translateY(-4px)'
	}
}));

interface PersonalizedDashboardProps {
	onRecommendationClick?: (recommendationId: string) => void;
	onMetricClick?: (metric: string) => void;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
	onRecommendationClick,
	onMetricClick
}) => {
	const theme = useTheme();
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set(['metrics', 'recommendations', 'analytics'])
	);

	const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setMenuAnchor(event.currentTarget);
	};

	const handleSectionToggle = (section: string) => {
		const newExpanded = new Set(expandedSections);
		if (newExpanded.has(section)) {
			newExpanded.delete(section);
		} else {
			newExpanded.add(section);
		}
		setExpandedSections(newExpanded);
	};

	const adaptationMetrics = [
		{
			title: 'Engagement Increase',
			value: `+${mockQuery.adaptationMetrics.engagementIncrease}%`,
			subtitle: 'Since personalization enabled',
			trend: { direction: 'up' as const, value: '+12.3%' },
			icon: <ManageAccountsOutlinedIcon />
		},
		{
			title: 'Task Completion',
			value: `${mockQuery.adaptationMetrics.taskCompletionRate}%`,
			subtitle: 'Average completion rate',
			trend: { direction: 'up' as const, value: '+8.7%' },
			icon: <PaletteOutlinedIcon />
		},
		{
			title: 'User Satisfaction',
			value: mockQuery.adaptationMetrics.userSatisfaction.toFixed(1),
			subtitle: 'Out of 5.0 rating',
			trend: { direction: 'up' as const, value: '+0.4' },
			icon: <EmojiObjectsOutlinedIcon />
		},
		{
			title: 'Adaptation Accuracy',
			value: `${mockQuery.adaptationMetrics.adaptationAccuracy}%`,
			subtitle: 'AI prediction accuracy',
			trend: { direction: 'up' as const, value: '+5.2%' },
			icon: <ManageAccountsOutlinedIcon />
		}
	];

	return (
		<GlassDashboard elevation={0}>
			{/* Header */}
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 700,
							background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
							backgroundClip: 'text',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent'
						}}
					>
						Personalized Dashboard
					</Typography>
					<Chip
						label="AI-Powered"
						size="small"
						sx={{
							backgroundColor: `${theme.palette.secondary.main}20`,
							color: theme.palette.secondary.main,
							fontWeight: 600
						}}
					/>
				</Stack>

				<IconButton onClick={handleMenuClick}>
					<MoreVertOutlinedIcon />
				</IconButton>
			</Stack>

			{/* Adaptation Metrics */}
			<Box sx={{ mb: 4 }}>
				<Button
					onClick={() => handleSectionToggle('metrics')}
					startIcon={
						expandedSections.has('metrics') ? (
							<ExpandLessOutlinedIcon />
						) : (
							<ExpandMoreOutlinedIcon />
						)
					}
					sx={{
						mb: 2,
						textTransform: 'none',
						color: theme.palette.text.primary,
						fontWeight: 600
					}}
				>
					Adaptation Metrics
				</Button>

				<Collapse in={expandedSections.has('metrics')}>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
							gap: 2,
							mb: 3
						}}
					>
						{adaptationMetrics.map((metric, index) => (
							<MetricCard
								key={index}
								title={metric.title}
								value={metric.value}
								subtitle={metric.subtitle}
								trend={metric.trend}
								icon={metric.icon}
								onClick={() => onMetricClick?.(metric.title)}
							/>
						))}
					</Box>
				</Collapse>
			</Box>

			{/* Personalization Recommendations */}
			<Box sx={{ mb: 4 }}>
				<Button
					onClick={() => handleSectionToggle('recommendations')}
					startIcon={
						expandedSections.has('recommendations') ? (
							<ExpandLessOutlinedIcon />
						) : (
							<ExpandMoreOutlinedIcon />
						)
					}
					sx={{
						mb: 2,
						textTransform: 'none',
						color: theme.palette.text.primary,
						fontWeight: 600
					}}
				>
					AI Recommendations
				</Button>

				<Collapse in={expandedSections.has('recommendations')}>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
							gap: 2,
							mb: 3
						}}
					>
						{mockQuery.personalizationRecommendations.map((recommendation) => (
							<PersonalizationCard
								key={recommendation.id}
								id={recommendation.id}
								type={recommendation.type}
								title={recommendation.title}
								description={recommendation.description}
								confidence={recommendation.confidence}
								implemented={recommendation.implemented}
								onClick={() => onRecommendationClick?.(recommendation.id)}
							/>
						))}
					</Box>
				</Collapse>
			</Box>

			{/* Analytics Charts */}
			<Box>
				<Button
					onClick={() => handleSectionToggle('analytics')}
					startIcon={
						expandedSections.has('analytics') ? (
							<ExpandLessOutlinedIcon />
						) : (
							<ExpandMoreOutlinedIcon />
						)
					}
					sx={{
						mb: 2,
						textTransform: 'none',
						color: theme.palette.text.primary,
						fontWeight: 600
					}}
				>
					Learning Analytics
				</Button>

				<Collapse in={expandedSections.has('analytics')}>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
							gap: 3
						}}
					>
						{/* Personality Profile Chart */}
						<ChartContainer>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								RIASEC Personality Profile
							</Typography>
							<BarChart
								width={400}
								height={300}
								series={[
									{
										data: mockQuery.personalityAnalytics.map((d) => d.score),
										label: 'Personality Scores',
										color: theme.palette.primary.main
									}
								]}
								xAxis={[
									{
										scaleType: 'band',
										data: mockQuery.personalityAnalytics.map((d) => d.trait)
									}
								]}
								margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
							/>
						</ChartContainer>

						{/* Learning Styles Chart */}
						<ChartContainer>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								Learning Style Preferences
							</Typography>
							<BarChart
								width={400}
								height={300}
								series={[
									{
										data: mockQuery.learningStyleData.map((d) => d.score),
										label: 'Learning Style Scores',
										color: theme.palette.secondary.main
									}
								]}
								xAxis={[
									{
										scaleType: 'band',
										data: mockQuery.learningStyleData.map((d) => d.style)
									}
								]}
								margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
							/>
						</ChartContainer>

						{/* Adaptation Progress */}
						<ChartContainer sx={{ gridColumn: 'span 2' }}>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								Adaptation Progress Over Time
							</Typography>
							<LineChart
								width={800}
								height={300}
								series={[
									{
										data: mockQuery.adaptationHistory.map((d) => d.engagement),
										label: 'Engagement Score',
										color: theme.palette.primary.main,
										curve: 'smooth'
									},
									{
										data: mockQuery.adaptationHistory.map((d) => d.satisfaction * 20),
										label: 'Satisfaction Score (x20)',
										color: theme.palette.secondary.main,
										curve: 'smooth'
									}
								]}
								xAxis={[
									{
										scaleType: 'point',
										data: mockQuery.adaptationHistory.map((d) => d.date)
									}
								]}
								margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
								grid={{ vertical: true, horizontal: true }}
							/>
						</ChartContainer>
					</Box>
				</Collapse>
			</Box>

			{/* Menu */}
			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={() => setMenuAnchor(null)}
				PaperProps={{
					sx: {
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(20px)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
						borderRadius: '12px'
					}
				}}
			>
				<MenuItem onClick={() => setMenuAnchor(null)}>Export Analytics</MenuItem>
				<MenuItem onClick={() => setMenuAnchor(null)}>Personalization Settings</MenuItem>
				<MenuItem onClick={() => setMenuAnchor(null)}>Reset Preferences</MenuItem>
			</Menu>
		</GlassDashboard>
	);
};
