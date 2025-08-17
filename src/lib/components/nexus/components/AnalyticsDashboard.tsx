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
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { MetricCard } from './MetricCard';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import { mockQuery } from '../data/nexusSentientMockData';

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

interface AnalyticsDashboardProps {
  onMetricClick?: (metric: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onMetricClick
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['metrics', 'charts']));

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

  const formatMetricValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const metricsData = [
    {
      title: 'Active Users',
      value: formatMetricValue(mockQuery.systemMetrics.activeUsers),
      subtitle: 'Current active sessions',
      trend: { direction: 'up' as const, value: '+12.5%' },
      icon: <InsightsOutlinedIcon />
    },
    {
      title: 'Total Transactions',
      value: formatMetricValue(mockQuery.systemMetrics.totalTransactions),
      subtitle: 'All time transactions',
      trend: { direction: 'up' as const, value: '+8.2%' },
      icon: <ShowChartOutlinedIcon />
    },
    {
      title: 'Response Time',
      value: `${mockQuery.systemMetrics.averageResponseTime}ms`,
      subtitle: 'Average response time',
      trend: { direction: 'down' as const, value: '-5.1%' },
      icon: <ElectricBoltOutlinedIcon />
    },
    {
      title: 'System Uptime',
      value: `${mockQuery.systemMetrics.systemUptime}%`,
      subtitle: 'Last 30 days',
      trend: { direction: 'up' as const, value: '+0.03%' },
      icon: <InsightsOutlinedIcon />
    }
  ];

  return (
    <GlassDashboard elevation={0}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
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
          Analytics Dashboard
        </Typography>
        
        <IconButton onClick={handleMenuClick}>
          <MoreVertOutlinedIcon />
        </IconButton>
      </Stack>

      {/* Metrics Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => handleSectionToggle('metrics')}
          startIcon={expandedSections.has('metrics') ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          sx={{ 
            mb: 2, 
            textTransform: 'none',
            color: theme.palette.text.primary,
            fontWeight: 600
          }}
        >
          Key Metrics
        </Button>
        
        <Collapse in={expandedSections.has('metrics')}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 2,
            mb: 3
          }}>
            {metricsData.map((metric, index) => (
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

      {/* Charts Section */}
      <Box>
        <Button
          onClick={() => handleSectionToggle('charts')}
          startIcon={expandedSections.has('charts') ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          sx={{ 
            mb: 2, 
            textTransform: 'none',
            color: theme.palette.text.primary,
            fontWeight: 600
          }}
        >
          Data Visualization
        </Button>
        
        <Collapse in={expandedSections.has('charts')}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 3
          }}>
            {/* User Growth Chart */}
            <ChartContainer>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                User Growth Trend
              </Typography>
              <LineChart
                width={400}
                height={300}
                series={[
                  {
                    data: mockQuery.analyticsData.map(d => d.users),
                    label: 'Active Users',
                    color: theme.palette.primary.main
                  }
                ]}
                xAxis={[{
                  scaleType: 'point',
                  data: mockQuery.analyticsData.map(d => d.month)
                }]}
                margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
                grid={{ vertical: true, horizontal: true }}
              />
            </ChartContainer>

            {/* Performance Metrics */}
            <ChartContainer>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                System Performance
              </Typography>
              <BarChart
                width={400}
                height={300}
                series={[
                  {
                    data: mockQuery.performanceData.map(d => d.cpu),
                    label: 'CPU Usage',
                    color: theme.palette.primary.main
                  },
                  {
                    data: mockQuery.performanceData.map(d => d.memory),
                    label: 'Memory Usage',
                    color: theme.palette.secondary.main
                  }
                ]}
                xAxis={[{
                  scaleType: 'band',
                  data: mockQuery.performanceData.map(d => d.time)
                }]}
                margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
              />
            </ChartContainer>

            {/* Response Time Chart */}
            <ChartContainer sx={{ gridColumn: 'span 2' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Response Time Analysis
              </Typography>
              <LineChart
                width={800}
                height={300}
                series={[
                  {
                    data: mockQuery.analyticsData.map(d => d.responseTime),
                    label: 'Response Time (ms)',
                    color: theme.palette.secondary.main,
                    curve: 'smooth'
                  }
                ]}
                xAxis={[{
                  scaleType: 'point',
                  data: mockQuery.analyticsData.map(d => d.month)
                }]}
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
        <MenuItem onClick={() => setMenuAnchor(null)}>Export Data</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>Refresh</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>Settings</MenuItem>
      </Menu>
    </GlassDashboard>
  );
};