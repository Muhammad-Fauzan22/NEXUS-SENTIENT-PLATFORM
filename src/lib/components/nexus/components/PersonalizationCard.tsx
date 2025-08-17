import React from 'react';
import {
	Card,
	CardContent,
	Typography,
	Box,
	Stack,
	Chip,
	useTheme,
	LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';

const GlassCard = styled(Card)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.1)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: '20px',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	cursor: 'pointer',
	'&:hover': {
		transform: 'translateY(-4px)',
		boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
		background: 'rgba(255, 255, 255, 0.15)'
	}
}));

const ConfidenceBar = styled(LinearProgress)(({ theme }) => ({
	height: 6,
	borderRadius: 3,
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	'& .MuiLinearProgress-bar': {
		background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
		borderRadius: 3
	}
}));

interface PersonalizationCardProps {
	id: string;
	type: string;
	title: string;
	description: string;
	confidence: number;
	implemented: boolean;
	onClick?: () => void;
}

export const PersonalizationCard: React.FC<PersonalizationCardProps> = ({
	id,
	type,
	title,
	description,
	confidence,
	implemented,
	onClick
}) => {
	const theme = useTheme();

	const getTypeColor = (type: string) => {
		const colors = {
			visual: theme.palette.primary.main,
			content: theme.palette.secondary.main,
			layout: theme.palette.success.main,
			interaction: theme.palette.warning.main,
			navigation: theme.palette.info.main
		};
		return colors[type as keyof typeof colors] || theme.palette.grey[500];
	};

	return (
		<GlassCard onClick={onClick}>
			<CardContent sx={{ p: 3 }}>
				<Stack spacing={2}>
					{/* Header */}
					<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
						<Chip
							label={type.toUpperCase()}
							size="small"
							sx={{
								backgroundColor: `${getTypeColor(type)}20`,
								color: getTypeColor(type),
								fontWeight: 600,
								fontSize: '0.7rem'
							}}
						/>
						{implemented ? (
							<CheckCircleOutlinedIcon
								sx={{ color: theme.palette.success.main, fontSize: '1.2rem' }}
							/>
						) : (
							<PendingOutlinedIcon sx={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />
						)}
					</Stack>

					{/* Title */}
					<Typography
						variant="h6"
						sx={{
							fontWeight: 600,
							color: theme.palette.text.primary,
							lineHeight: 1.3
						}}
					>
						{title}
					</Typography>

					{/* Description */}
					<Typography
						variant="body2"
						sx={{
							color: theme.palette.text.secondary,
							lineHeight: 1.5
						}}
					>
						{description}
					</Typography>

					{/* Confidence */}
					<Box>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
							sx={{ mb: 1 }}
						>
							<Typography
								variant="caption"
								sx={{
									color: theme.palette.text.secondary,
									fontWeight: 500
								}}
							>
								Confidence
							</Typography>
							<Typography
								variant="caption"
								sx={{
									color: theme.palette.primary.main,
									fontWeight: 600
								}}
							>
								{Math.round(confidence * 100)}%
							</Typography>
						</Stack>
						<ConfidenceBar variant="determinate" value={confidence * 100} />
					</Box>

					{/* Status */}
					<Chip
						label={implemented ? 'Implemented' : 'Pending'}
						size="small"
						variant={implemented ? 'filled' : 'outlined'}
						sx={{
							alignSelf: 'flex-start',
							backgroundColor: implemented ? `${theme.palette.success.main}20` : 'transparent',
							color: implemented ? theme.palette.success.main : theme.palette.warning.main,
							borderColor: implemented ? theme.palette.success.main : theme.palette.warning.main,
							fontWeight: 500
						}}
					/>
				</Stack>
			</CardContent>
		</GlassCard>
	);
};
