import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Fade, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';

const GlassmorphismContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}10 50%, 
    ${theme.palette.primary.light}20 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 50%, ${theme.palette.primary.main}30 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${theme.palette.secondary.main}30 0%, transparent 50%),
                 radial-gradient(circle at 40% 80%, ${theme.palette.primary.light}20 0%, transparent 50%)`,
    animation: 'gradientShift 8s ease-in-out infinite',
    zIndex: 0
  },
  '@keyframes gradientShift': {
    '0%, 100%': {
      transform: 'scale(1) rotate(0deg)',
      opacity: 0.8
    },
    '50%': {
      transform: 'scale(1.1) rotate(5deg)',
      opacity: 1
    }
  }
}));

const GlassCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  padding: theme.spacing(8, 6),
  textAlign: 'center',
  maxWidth: '800px',
  margin: '0 auto',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 35px 70px -12px rgba(0, 0, 0, 0.35)'
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'left 0.5s'
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 10px 25px ${theme.palette.primary.main}40`,
    '&::before': {
      left: '100%'
    }
  }
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  animation: 'float 6s ease-in-out infinite'
}));

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onLearnMore
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <GlassmorphismContainer>
      {/* Floating elements */}
      <FloatingElement
        sx={{
          width: 100,
          height: 100,
          top: '20%',
          left: '10%',
          animationDelay: '0s'
        }}
      />
      <FloatingElement
        sx={{
          width: 60,
          height: 60,
          top: '70%',
          right: '15%',
          animationDelay: '2s'
        }}
      />
      <FloatingElement
        sx={{
          width: 80,
          height: 80,
          bottom: '20%',
          left: '20%',
          animationDelay: '4s'
        }}
      />

      <Fade in={isVisible} timeout={1000}>
        <GlassCard>
          <Stack spacing={4} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ElectricBoltOutlinedIcon 
                sx={{ 
                  fontSize: '3rem', 
                  color: theme.palette.primary.main,
                  animation: 'pulse 2s ease-in-out infinite'
                }} 
              />
              <Typography 
                variant="h1" 
                sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800
                }}
              >
                NEXUS SENTIENT PLATFORM
              </Typography>
            </Box>

            <Typography 
              variant="h3" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
                opacity: 0.9
              }}
            >
              Experience the Future
            </Typography>

            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: '600px',
                lineHeight: 1.6
              }}
            >
              World-Class Intelligence Platform with advanced AI analytics, 
              real-time insights, and intelligent automation. Built for the next generation 
              of digital experiences.
            </Typography>

            <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
              <AnimatedButton
                variant="contained"
                size="large"
                onClick={onGetStarted}
                endIcon={<ArrowForwardIosOutlinedIcon />}
              >
                Get Started
              </AnimatedButton>

              <Button
                variant="outlined"
                size="large"
                onClick={onLearnMore}
                sx={{
                  borderRadius: '50px',
                  padding: theme.spacing(1.5, 4),
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Stack>
        </GlassCard>
      </Fade>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </GlassmorphismContainer>
  );
};