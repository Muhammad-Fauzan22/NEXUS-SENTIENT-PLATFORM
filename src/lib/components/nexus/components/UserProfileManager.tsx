import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Stack, 
  Avatar,
  Button,
  Chip,
  useTheme,
  LinearProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { RadarChart } from '@mui/x-charts';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { mockStore } from '../data/personalizationMockData';
import { formatPersonalityType, formatLearningStyle } from '../utils/personalizationFormatters';

const GlassContainer = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden'
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const ScoreBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4
  }
}));

interface UserProfileManagerProps {
  onProfileUpdate?: () => void;
  onReassessment?: () => void;
}

export const UserProfileManager: React.FC<UserProfileManagerProps> = ({
  onProfileUpdate,
  onReassessment
}) => {
  const theme = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { userProfile } = mockStore;

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      onProfileUpdate?.();
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const riasecData = Object.entries(userProfile.riasecProfile.scores).map(([key, value]) => ({
    trait: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  }));

  const bigFiveData = Object.entries(userProfile.bigFiveProfile).map(([key, value]) => ({
    trait: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  }));

  return (
    <GlassContainer elevation={0}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AssignmentIndOutlinedIcon 
            sx={{ 
              fontSize: '2rem', 
              color: theme.palette.primary.main 
            }} 
          />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            User Profile
          </Typography>
        </Stack>
        
        <Button
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={handleProfileUpdate}
          disabled={isUpdating}
          sx={{
            borderRadius: '12px',
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              background: `${theme.palette.primary.main}10`
            }
          }}
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </Stack>

      {/* Profile Overview */}
      <ProfileSection>
        <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 2 }}>
          <Avatar
            sx={{ 
              width: 64, 
              height: 64,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }}
          >
            <AssignmentIndOutlinedIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Profile ID: {userProfile.id}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={userProfile.assessmentCompleted ? 'Assessment Complete' : 'Assessment Pending'}
                size="small"
                sx={{
                  backgroundColor: userProfile.assessmentCompleted 
                    ? `${theme.palette.success.main}20` 
                    : `${theme.palette.warning.main}20`,
                  color: userProfile.assessmentCompleted 
                    ? theme.palette.success.main 
                    : theme.palette.warning.main,
                  fontWeight: 600
                }}
              />
              <Chip
                label={`Updated: ${new Date(userProfile.lastUpdated).toLocaleDateString()}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: theme.palette.grey[400],
                  color: theme.palette.text.secondary
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </ProfileSection>

      {/* RIASEC Profile */}
      <ProfileSection>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <PsychologyOutlinedIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            RIASEC Personality Profile
          </Typography>
          <Chip
            label={`Dominant: ${formatPersonalityType(userProfile.riasecProfile.dominant).split(' ')[0]}`}
            size="small"
            sx={{
              backgroundColor: `${theme.palette.primary.main}20`,
              color: theme.palette.primary.main,
              fontWeight: 600
            }}
          />
        </Stack>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mb: 2
        }}>
          {riasecData.map((item) => (
            <Box key={item.trait}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.trait}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: getScoreColor(item.score) }}>
                  {item.score}%
                </Typography>
              </Stack>
              <ScoreBar 
                variant="determinate" 
                value={item.score}
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(item.score)
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </ProfileSection>

      {/* Big Five Profile */}
      <ProfileSection>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <PsychologyOutlinedIcon sx={{ color: theme.palette.secondary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Big Five Personality Traits
          </Typography>
        </Stack>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mb: 2
        }}>
          {bigFiveData.map((item) => (
            <Box key={item.trait}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.trait}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: getScoreColor(item.score) }}>
                  {item.score}%
                </Typography>
              </Stack>
              <ScoreBar 
                variant="determinate" 
                value={item.score}
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(item.score)
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </ProfileSection>

      {/* Learning Style Profile */}
      <ProfileSection>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <LocalLibraryOutlinedIcon sx={{ color: theme.palette.info.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            VARK Learning Styles
          </Typography>
          <Chip
            label={`Dominant: ${formatLearningStyle(userProfile.varkProfile.dominant)}`}
            size="small"
            sx={{
              backgroundColor: `${theme.palette.info.main}20`,
              color: theme.palette.info.main,
              fontWeight: 600
            }}
          />
        </Stack>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 2
        }}>
          {Object.entries(userProfile.varkProfile.scores).map(([style, score]) => (
            <Box key={style}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: getScoreColor(score) }}>
                  {score}%
                </Typography>
              </Stack>
              <ScoreBar 
                variant="determinate" 
                value={score}
                sx={{
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(score)
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </ProfileSection>

      {/* Actions */}
      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          onClick={onReassessment}
          sx={{
            borderRadius: '12px',
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
              background: `${theme.palette.secondary.main}10`
            }
          }}
        >
          Retake Assessment
        </Button>
        
        <Button
          variant="contained"
          onClick={handleProfileUpdate}
          disabled={isUpdating}
          sx={{
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
            }
          }}
        >
          {isUpdating ? 'Syncing...' : 'Sync Profile'}
        </Button>
      </Stack>
    </GlassContainer>
  );
};