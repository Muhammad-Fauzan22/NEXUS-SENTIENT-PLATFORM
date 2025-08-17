import { SystemStatus, UserRole } from '../types/enums';

// Mock data for analytics charts
export const mockQuery = {
	analyticsData: [
		{ month: 'Jan', users: 1200, transactions: 8500, responseTime: 45 },
		{ month: 'Feb', users: 1800, transactions: 12300, responseTime: 42 },
		{ month: 'Mar', users: 2400, transactions: 15600, responseTime: 38 },
		{ month: 'Apr', users: 3200, transactions: 21400, responseTime: 35 },
		{ month: 'May', users: 4100, transactions: 28900, responseTime: 33 },
		{ month: 'Jun', users: 5200, transactions: 35600, responseTime: 31 }
	],
	systemMetrics: {
		activeUsers: 15420,
		totalTransactions: 2847392,
		averageResponseTime: 34,
		systemUptime: 99.97,
		status: SystemStatus.ACTIVE as const
	},
	performanceData: [
		{ time: '00:00', cpu: 45, memory: 62, network: 23 },
		{ time: '04:00', cpu: 38, memory: 58, network: 19 },
		{ time: '08:00', cpu: 72, memory: 71, network: 45 },
		{ time: '12:00', cpu: 85, memory: 78, network: 67 },
		{ time: '16:00', cpu: 91, memory: 82, network: 73 },
		{ time: '20:00', cpu: 67, memory: 69, network: 52 }
	]
};

// Mock data for global state
export const mockStore = {
	user: {
		id: 'user_001',
		name: 'John Doe',
		email: 'john.doe@nexussentient.com',
		role: UserRole.ADMIN as const,
		avatar: 'https://i.pravatar.cc/150?img=1',
		isAuthenticated: true
	},
	theme: {
		mode: 'light' as const,
		primaryColor: '#6366f1',
		accentColor: '#8b5cf6'
	},
	notifications: [
		{
			id: 'notif_001',
			title: 'System Update Complete',
			message: 'All systems have been successfully updated to version 2.1.0',
			timestamp: new Date('2025-01-15T10:30:00Z'),
			read: false,
			type: 'success' as const
		},
		{
			id: 'notif_002',
			title: 'New Analytics Report',
			message: 'Monthly performance report is now available',
			timestamp: new Date('2025-01-15T09:15:00Z'),
			read: false,
			type: 'info' as const
		}
	]
};

// Mock props for root component
export const mockRootProps = {
	initialTheme: 'light' as const,
	showWelcomeModal: false,
	debugMode: false
};
