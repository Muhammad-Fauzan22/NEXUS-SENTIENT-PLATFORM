import React from 'react';
import { Card, CardContent, Typography, Box, Stack, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlassCard = styled(Card)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.1)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: '20px',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	cursor: 'pointer',
	'&:hover': {
		transform: 'translateY(-8px)',
		boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
		background: 'rgba(255, 255, 255, 0.15)'
	}
}));

const MetricValue = styled(Typography)(({ theme }) => ({
	fontSize: '2.5rem',
	fontWeight: 800,
	background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
	lineHeight: 1.2
}));

const TrendIndicator = styled(Box)<{ trend: 'up' | 'down' | 'neutral' }>(({ theme, trend }) => ({
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(0.5),
	padding: theme.spacing(0.5, 1),
	borderRadius: '20px',
	fontSize: '0.75rem',
	fontWeight: 600,
	background:
		trend === 'up'
			? 'rgba(34, 197, 94, 0.1)'
			: trend === 'down'
				? 'rgba(239, 68, 68, 0.1)'
				: 'rgba(156, 163, 175, 0.1)',
	color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#9ca3af'
}));

interface MetricCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	trend?: {
		direction: 'up' | 'down' | 'neutral';
		value: string;
	};
	icon?: React.ReactNode;
	onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	subtitle,
	trend,
	icon,
	onClick
}) => {
	const theme = useTheme();

	const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
		switch (direction) {
			case 'up':
				return '↗';
			case 'down':
				return '↘';
			default:
				return '→';
		}
	};

	return (
		<GlassCard onClick={onClick}>
			<CardContent sx={{ p: 3 }}>
				<Stack spacing={2}>
					{/* Header */}
					<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
						<Typography
							variant="body2"
							sx={{
								color: theme.palette.text.secondary,
								fontWeight: 500,
								textTransform: 'uppercase',
								letterSpacing: '0.5px'
							}}
						>
							{title}
						</Typography>
						{icon && (
							<Box
								sx={{
									color: theme.palette.primary.main,
									opacity: 0.7
								}}
							>
								{icon}
							</Box>
						)}
					</Stack>

					{/* Value */}
					<MetricValue>{typeof value === 'number' ? value.toLocaleString() : value}</MetricValue>

					{/* Footer */}
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						{subtitle && (
							<Typography
								variant="body2"
								sx={{
									color: theme.palette.text.secondary,
									fontSize: '0.8rem'
								}}
							>
								{subtitle}
							</Typography>
						)}

						{trend && (
							<TrendIndicator trend={trend.direction}>
								<span>{getTrendIcon(trend.direction)}</span>
								{trend.value}
							</TrendIndicator>
						)}
					</Stack>
				</Stack>
			</CardContent>
		</GlassCard>
	);
};
