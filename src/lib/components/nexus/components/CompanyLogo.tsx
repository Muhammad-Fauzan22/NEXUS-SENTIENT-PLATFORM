import React from 'react';
import { Box, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CompanyLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'glow' | 'minimal';
  color?: string;
  onClick?: () => void;
  className?: string;
}

const LogoContainer = styled(Box)<{ 
  size: string; 
  variant: string; 
  clickable: boolean;
}>(({ theme, size, variant, clickable }) => {
  const sizeMap = {
    small: '32px',
    medium: '48px', 
    large: '64px',
    xlarge: '96px'
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeMap[size as keyof typeof sizeMap],
    height: sizeMap[size as keyof typeof sizeMap],
    cursor: clickable ? 'pointer' : 'default',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    ...(variant === 'glow' && {
      filter: 'drop-shadow(0 0 20px #FF0000)',
      '&:hover': clickable ? {
        filter: 'drop-shadow(0 0 30px #FF0000)',
        transform: 'scale(1.05)'
      } : {}
    }),
    
    ...(clickable && {
      '&:hover': {
        transform: 'scale(1.05)'
      }
    })
  };
});

const WLogoSvg = styled(SvgIcon)<{ logoColor: string }>(({ theme, logoColor }) => ({
  width: '100%',
  height: '100%',
  '& path': {
    fill: logoColor
  }
}));

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  size = 'medium',
  variant = 'default',
  color = '#FF0000',
  onClick,
  className
}) => {
  return (
    <LogoContainer 
      size={size} 
      variant={variant} 
      clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <WLogoSvg logoColor={color} viewBox="0 0 100 100">
        <path d="M5 5 L25 5 L35 75 L45 35 L55 35 L65 75 L75 5 L95 5 L95 95 L75 95 L65 25 L55 65 L45 65 L35 25 L25 95 L5 95 Z" />
      </WLogoSvg>
    </LogoContainer>
  );
};

export default CompanyLogo;