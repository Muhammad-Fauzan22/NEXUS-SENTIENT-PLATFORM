import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CompanyLogo } from './CompanyLogo';

interface BrandingHeaderProps {
	showCompanyName?: boolean;
	companyName?: string;
	position?: 'top-left' | 'top-right' | 'center';
	variant?: 'minimal' | 'full' | 'logo-only';
	onLogoClick?: () => void;
}

const HeaderContainer = styled(Box)<{ position: string }>(({ theme, position }) => {
	const positionStyles = {
		'top-left': {
			position: 'fixed' as const,
			top: theme.spacing(3),
			left: theme.spacing(3),
			zIndex: 1000
		},
		'top-right': {
			position: 'fixed' as const,
			top: theme.spacing(3),
			right: theme.spacing(3),
			zIndex: 1000
		},
		center: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			padding: theme.spacing(2)
		}
	};

	return {
		...positionStyles[position as keyof typeof positionStyles],
		backdropFilter: position !== 'center' ? 'blur(10px)' : 'none',
		backgroundColor: position !== 'center' ? `${theme.palette.background.paper}20` : 'transparent',
		borderRadius: position !== 'center' ? theme.spacing(1) : 0,
		padding: position !== 'center' ? theme.spacing(1.5) : theme.spacing(2),
		border: position !== 'center' ? `1px solid ${theme.palette.grey[800]}` : 'none'
	};
});

const CompanyName = styled(Typography)(({ theme }) => ({
	fontFamily: '"Syne", sans-serif',
	fontWeight: 700,
	fontSize: '1.5rem',
	color: theme.palette.text.primary,
	letterSpacing: '0.05em',
	marginLeft: theme.spacing(2),
	background: `linear-gradient(45deg, #FF0000, #FF4444)`,
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
	textShadow: '0 0 20px rgba(255, 0, 0, 0.3)'
}));

const TagLine = styled(Typography)(({ theme }) => ({
	fontFamily: '"Inter", sans-serif',
	fontWeight: 300,
	fontSize: '0.9rem',
	color: theme.palette.text.secondary,
	letterSpacing: '0.02em',
	marginLeft: theme.spacing(2),
	marginTop: theme.spacing(0.5)
}));

export const BrandingHeader: React.FC<BrandingHeaderProps> = ({
	showCompanyName = true,
	companyName = 'NEXUS',
	position = 'top-left',
	variant = 'full',
	onLogoClick
}) => {
	const renderContent = () => {
		switch (variant) {
			case 'logo-only':
				return <CompanyLogo size="medium" variant="glow" onClick={onLogoClick} />;

			case 'minimal':
				return (
					<Stack direction="row" alignItems="center">
						<CompanyLogo size="small" variant="default" onClick={onLogoClick} />
						{showCompanyName && <CompanyName variant="h6">{companyName}</CompanyName>}
					</Stack>
				);

			case 'full':
			default:
				return (
					<Stack direction="row" alignItems="center">
						<CompanyLogo size="medium" variant="glow" onClick={onLogoClick} />
						{showCompanyName && (
							<Box>
								<CompanyName variant="h6">{companyName}</CompanyName>
								<TagLine>Living Interface Platform</TagLine>
							</Box>
						)}
					</Stack>
				);
		}
	};

	return <HeaderContainer position={position}>{renderContent()}</HeaderContainer>;
};

export default BrandingHeader;
