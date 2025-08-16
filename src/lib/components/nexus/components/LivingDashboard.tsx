import React, { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert, LinearProgress, Card, CardContent, Stack, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { DevelopmentPillar, UserProgress, Activity } from '../types';
import { BrandingHeader } from './BrandingHeader';

const DashboardContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #000000 0%, #0A0A0A 50%, #1A1A1A 100%)',
  padding: theme.spacing(4),
  overflow: 'auto'
}));

const DashboardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(3),
  maxWidth: '1200px',
  margin: '0 auto'
}));

const ProgressCard = styled(Card)(({ theme }) => ({
  backgroundColor: `${theme.palette.background.paper}90`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.primary.main}30`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 25px ${theme.palette.primary.main}20`
  }
}));

const PillarProgress = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .pillar-name': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  }
}));

const ActivityChip = styled(Chip)<{ completed: boolean }>(({ theme, completed }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: completed 
    ? `${theme.palette.success.main}30` 
    : `${theme.palette.grey[700]}30`,
  color: completed ? theme.palette.success.main : theme.palette.text.secondary,
  border: `1px solid ${completed ? theme.palette.success.main : theme.palette.grey[600]}`,
  '&:hover': {
    backgroundColor: completed 
      ? `${theme.palette.success.main}50` 
      : `${theme.palette.grey[600]}50`
  }
}));

const NotificationAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: `${theme.palette.background.paper}95`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.primary.main}50`,
  color: theme.palette.text.primary,
  '& .MuiAlert-icon': {
    color: theme.palette.primary.main
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center'
}));

interface LivingDashboardProps {
  userProgress: UserProgress;
  activities: Activity[];
  onActivityClick: (activityId: string) => void;
}

const PillarColors = {
  [DevelopmentPillar.ACADEMIC]: '#4A90E2',
  [DevelopmentPillar.MANAGERIAL]: '#50C878',
  [DevelopmentPillar.LEADERSHIP]: '#FFD93D',
  [DevelopmentPillar.TECHNICAL]: '#FF6B6B',
  [DevelopmentPillar.SOCIAL]: '#6BCFFF'
};

export const LivingDashboard: React.FC<LivingDashboardProps> = ({
  userProgress,
  activities,
  onActivityClick
}) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    timestamp: Date;
  }>>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Simulate proactive notifications
  useEffect(() => {
    const notificationTimer = setInterval(() => {
      const opportunityMessages = [
        "NEXUS: Sebuah peluang baru di 'Basis Data Program Kerja' Notion sangat cocok dengan tujuan 'Manajerial' Anda. Lihat?",
        "NEXUS: Tim Robotika sedang mencari anggota baru. Ini bisa meningkatkan skill Technical Anda!",
        "NEXUS: Workshop Leadership minggu depan tersedia. Perfect untuk development pillar Leadership Anda.",
        "NEXUS: PKM deadline approaching. Saatnya fokus pada Academic pillar!"
      ];

      const randomMessage = opportunityMessages[Math.floor(Math.random() * opportunityMessages.length)];
      
      const newNotification = {
        id: Date.now().toString(),
        message: randomMessage,
        type: 'info' as const,
        timestamp: new Date()
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
      setShowNotification(true);

      setTimeout(() => setShowNotification(false), 5000);
    }, 15000); // Show notification every 15 seconds

    return () => clearInterval(notificationTimer);
  }, []);

  const formatPillarName = (pillar: DevelopmentPillar): string => {
    switch (pillar) {
      case DevelopmentPillar.ACADEMIC: return 'Akademik';
      case DevelopmentPillar.MANAGERIAL: return 'Manajerial';
      case DevelopmentPillar.LEADERSHIP: return 'Kepemimpinan';
      case DevelopmentPillar.TECHNICAL: return 'Teknis';
      case DevelopmentPillar.SOCIAL: return 'Sosial';
      default: return pillar;
    }
  };

  const getActivitiesForPillar = (pillar: DevelopmentPillar) => {
    return activities.filter(activity => activity.pillar === pillar);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <DashboardContainer>
      <BrandingHeader 
        position="top-left"
        variant="full"
        showCompanyName={true}
        companyName="NEXUS"
      />
      
      <HeaderSection>
        <Typography variant="h2" gutterBottom sx={{ fontFamily: '"Syne", sans-serif' }}>
          Living Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Konstelasi Anda berkembang seiring waktu
        </Typography>
        
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Progress Keseluruhan
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={userProgress.overallProgress * 100}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'grey.800',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #4A90E2, #50C878, #FFD93D)'
              }
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {Math.round(userProgress.overallProgress * 100)}% Complete
          </Typography>
        </Box>
      </HeaderSection>

      <DashboardGrid>
        {Object.values(DevelopmentPillar).map(pillar => {
          const progress = userProgress.pillarProgress[pillar] || 0;
          const pillarActivities = getActivitiesForPillar(pillar);
          
          return (
            <ProgressCard key={pillar}>
              <CardContent>
                <PillarProgress>
                  <Box className="pillar-name">
                    <Typography variant="h6" sx={{ color: PillarColors[pillar] }}>
                      {formatPillarName(pillar)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(progress * 100)}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={progress * 100}
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'grey.800',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: PillarColors[pillar]
                      }
                    }}
                  />
                </PillarProgress>

                <Typography variant="body2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                  Aktivitas:
                </Typography>
                
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {pillarActivities.map(activity => (
                    <ActivityChip
                      key={activity.id}
                      label={activity.title}
                      size="small"
                      completed={userProgress.completedActivities.includes(activity.id)}
                      onClick={() => onActivityClick(activity.id)}
                      icon={userProgress.completedActivities.includes(activity.id) 
                        ? <TrendingUpOutlinedIcon /> 
                        : undefined
                      }
                    />
                  ))}
                </Stack>

                {pillarActivities.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Belum ada aktivitas untuk pillar ini
                  </Typography>
                )}
              </CardContent>
            </ProgressCard>
          );
        })}
      </DashboardGrid>

      {/* Recent Notifications Panel */}
      {notifications.length > 0 && (
        <ProgressCard sx={{ mt: 4, maxWidth: '800px', mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveOutlinedIcon color="primary" />
              Notifikasi Proaktif
            </Typography>
            
            <Stack spacing={2}>
              {notifications.slice(0, 3).map(notification => (
                <NotificationAlert 
                  key={notification.id}
                  severity={notification.type}
                  variant="outlined"
                >
                  {notification.message}
                </NotificationAlert>
              ))}
            </Stack>
          </CardContent>
        </ProgressCard>
      )}

      {/* Proactive Notification Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <NotificationAlert 
          onClose={handleCloseNotification}
          severity="info"
          variant="filled"
        >
          {notifications[0]?.message}
        </NotificationAlert>
      </Snackbar>
    </DashboardContainer>
  );
};