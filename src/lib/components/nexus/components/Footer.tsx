import React from 'react';
import { Box, Typography, Stack, Link, Divider, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlassFooter = styled(Box)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.05)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	borderRadius: '24px 24px 0 0',
	padding: theme.spacing(4, 3),
	marginTop: theme.spacing(8)
}));

const FooterLink = styled(Link)(({ theme }) => ({
	color: theme.palette.text.secondary,
	textDecoration: 'none',
	fontSize: '0.875rem',
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		color: theme.palette.primary.main,
		textDecoration: 'none',
		transform: 'translateY(-1px)'
	}
}));

export const Footer: React.FC = () => {
	const theme = useTheme();

	const footerSections = [
		{
			title: 'Platform',
			links: [
				{ label: 'Dashboard', href: '#dashboard' },
				{ label: 'Analytics', href: '#analytics' },
				{ label: 'Features', href: '#features' }
			]
		},
		{
			title: 'Resources',
			links: [
				{ label: 'Documentation', href: '#docs' },
				{ label: 'API Reference', href: '#api' },
				{ label: 'Support Center', href: '#support' }
			]
		},
		{
			title: 'Company',
			links: [
				{ label: 'About', href: '#about' },
				{ label: 'Contact', href: '#contact' },
				{ label: 'Careers', href: '#careers' }
			]
		}
	];

	return (
		<GlassFooter>
			<Stack spacing={4}>
				{/* Main Footer Content */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
						gap: 4
					}}
				>
					{/* Brand Section */}
					<Stack spacing={2}>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 800,
								background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent'
							}}
						>
							NEXUS SENTIENT
						</Typography>
						<Typography
							variant="body2"
							sx={{
								color: theme.palette.text.secondary,
								maxWidth: '250px',
								lineHeight: 1.6
							}}
						>
							World-class intelligence platform built for the future of digital experiences.
						</Typography>
					</Stack>

					{/* Footer Links */}
					{footerSections.map((section, index) => (
						<Stack key={index} spacing={2}>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 600,
									color: theme.palette.text.primary,
									textTransform: 'uppercase',
									letterSpacing: '0.5px'
								}}
							>
								{section.title}
							</Typography>
							<Stack spacing={1}>
								{section.links.map((link, linkIndex) => (
									<FooterLink key={linkIndex} href={link.href}>
										{link.label}
									</FooterLink>
								))}
							</Stack>
						</Stack>
					))}
				</Box>

				<Divider sx={{ opacity: 0.2 }} />

				{/* Bottom Section */}
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					justifyContent="space-between"
					alignItems="center"
					spacing={2}
				>
					<Typography
						variant="body2"
						sx={{
							color: theme.palette.text.secondary,
							fontSize: '0.8rem'
						}}
					>
						© 2025 Nexus Sentient Platform. All rights reserved.
					</Typography>

					<Stack direction="row" spacing={3}>
						<FooterLink href="#privacy">Privacy Policy</FooterLink>
						<FooterLink href="#terms">Terms of Service</FooterLink>
					</Stack>
				</Stack>
			</Stack>
		</GlassFooter>
	);
};
