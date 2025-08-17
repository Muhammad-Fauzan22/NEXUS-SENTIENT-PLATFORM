import React, { useState } from 'react';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Box,
	Stack,
	Menu,
	MenuItem,
	Switch,
	Badge,
	Avatar,
	useTheme,
	useMediaQuery,
	Drawer,
	List,
	ListItem,
	ListItemText,
	ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BentoOutlinedIcon from '@mui/icons-material/BentoOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const GlassAppBar = styled(AppBar)(({ theme }) => ({
	background: 'rgba(255, 255, 255, 0.1)',
	backdropFilter: 'blur(20px)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
	color: theme.palette.text.primary
}));

const NavButton = styled(Button)(({ theme }) => ({
	borderRadius: '12px',
	textTransform: 'none',
	fontWeight: 500,
	padding: theme.spacing(1, 2),
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	'&:hover': {
		background: 'rgba(255, 255, 255, 0.1)',
		transform: 'translateY(-2px)'
	}
}));

const GlassDrawer = styled(Drawer)(({ theme }) => ({
	'& .MuiDrawer-paper': {
		background: 'rgba(255, 255, 255, 0.95)',
		backdropFilter: 'blur(20px)',
		border: 'none',
		width: 280
	}
}));

interface NavigationHeaderProps {
	onThemeToggle?: () => void;
	isDarkMode?: boolean;
	notificationCount?: number;
	user?: {
		name: string;
		avatar: string;
	};
	onNavigate?: (section: string) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
	onThemeToggle,
	isDarkMode = false,
	notificationCount = 0,
	user,
	onNavigate
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
	const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

	const navigationItems = [
		{ label: 'Dashboard', icon: <BentoOutlinedIcon />, key: 'dashboard' },
		{ label: 'Analytics', icon: <InsightsOutlinedIcon />, key: 'analytics' },
		{ label: 'Features', icon: <MenuOutlinedIcon />, key: 'features' }
	];

	const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
		setNotificationMenuAnchor(event.currentTarget);
	};

	const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenuAnchor(event.currentTarget);
	};

	const handleMobileMenuToggle = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const handleNavigate = (section: string) => {
		onNavigate?.(section);
		setMobileMenuOpen(false);
	};

	const renderDesktopNav = () => (
		<Stack direction="row" spacing={2} alignItems="center">
			{navigationItems.map((item) => (
				<NavButton
					key={item.key}
					startIcon={item.icon}
					onClick={() => handleNavigate(item.key)}
					sx={{ color: theme.palette.text.primary }}
				>
					{item.label}
				</NavButton>
			))}
		</Stack>
	);

	const renderMobileDrawer = () => (
		<GlassDrawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
			<Box sx={{ p: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						NEXUS SENTIENT
					</Typography>
					<IconButton onClick={() => setMobileMenuOpen(false)}>
						<CloseOutlinedIcon />
					</IconButton>
				</Stack>

				<List>
					{navigationItems.map((item) => (
						<ListItem
							key={item.key}
							onClick={() => handleNavigate(item.key)}
							sx={{
								borderRadius: '12px',
								mb: 1,
								cursor: 'pointer',
								'&:hover': {
									background: 'rgba(0, 0, 0, 0.05)'
								}
							}}
						>
							<ListItemIcon sx={{ color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
							<ListItemText primary={item.label} />
						</ListItem>
					))}
				</List>
			</Box>
		</GlassDrawer>
	);

	return (
		<>
			<GlassAppBar position="fixed" elevation={0}>
				<Toolbar sx={{ justifyContent: 'space-between' }}>
					{/* Logo and Mobile Menu */}
					<Stack direction="row" alignItems="center" spacing={2}>
						{isMobile && (
							<IconButton
								onClick={handleMobileMenuToggle}
								sx={{ color: theme.palette.text.primary }}
							>
								<MenuOutlinedIcon />
							</IconButton>
						)}

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
					</Stack>

					{/* Desktop Navigation */}
					{!isMobile && renderDesktopNav()}

					{/* Right Side Actions */}
					<Stack direction="row" alignItems="center" spacing={1}>
						{/* Theme Toggle */}
						<Stack direction="row" alignItems="center" spacing={1}>
							<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
								{isDarkMode ? '🌙' : '☀️'}
							</Typography>
							<Switch
								checked={isDarkMode}
								onChange={onThemeToggle}
								size="small"
								sx={{
									'& .MuiSwitch-thumb': {
										background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
									}
								}}
							/>
						</Stack>

						{/* Notifications */}
						<IconButton
							onClick={handleNotificationClick}
							sx={{ color: theme.palette.text.primary }}
						>
							<Badge badgeContent={notificationCount} color="error">
								<NotificationsOutlinedIcon />
							</Badge>
						</IconButton>

						{/* User Avatar */}
						{user && (
							<IconButton onClick={handleUserClick}>
								<Avatar
									src={user.avatar}
									alt={user.name}
									sx={{
										width: 32,
										height: 32,
										border: `2px solid ${theme.palette.primary.main}`
									}}
								/>
							</IconButton>
						)}
					</Stack>
				</Toolbar>
			</GlassAppBar>

			{/* Mobile Drawer */}
			{renderMobileDrawer()}

			{/* Notification Menu */}
			<Menu
				anchorEl={notificationMenuAnchor}
				open={Boolean(notificationMenuAnchor)}
				onClose={() => setNotificationMenuAnchor(null)}
				PaperProps={{
					sx: {
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(20px)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
						borderRadius: '12px',
						minWidth: 300
					}
				}}
			>
				<MenuItem>
					<Stack>
						<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
							System Update Complete
						</Typography>
						<Typography variant="body2" color="text.secondary">
							All systems updated to v2.1.0
						</Typography>
					</Stack>
				</MenuItem>
				<MenuItem>
					<Stack>
						<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
							New Analytics Report
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Monthly performance report available
						</Typography>
					</Stack>
				</MenuItem>
			</Menu>

			{/* User Menu */}
			<Menu
				anchorEl={userMenuAnchor}
				open={Boolean(userMenuAnchor)}
				onClose={() => setUserMenuAnchor(null)}
				PaperProps={{
					sx: {
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(20px)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
						borderRadius: '12px',
						minWidth: 200
					}
				}}
			>
				<MenuItem>
					<SettingsOutlinedIcon sx={{ mr: 2 }} />
					Settings
				</MenuItem>
				<MenuItem>Sign Out</MenuItem>
			</Menu>
		</>
	);
};
