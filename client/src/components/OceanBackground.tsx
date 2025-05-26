import React from 'react';
import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

const waveAnimation = keyframes`
  0% {
    transform: translateX(0) translateZ(0) scaleY(1);
  }
  50% {
    transform: translateX(-25%) translateZ(0) scaleY(0.55);
  }
  100% {
    transform: translateX(-50%) translateZ(0) scaleY(1);
  }
`;

const WaveContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  overflow: 'hidden',
  background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)',
});

const Wave = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '200%',
  height: '100%',
  backgroundImage: 'linear-gradient(to bottom, rgba(2, 136, 209, 0.2), transparent)',
  animation: `${waveAnimation} 25s infinite linear`,
});

const Wave2 = styled(Wave)({
  bottom: '10px',
  opacity: 0.5,
  backgroundImage: 'linear-gradient(to bottom, rgba(38, 166, 154, 0.2), transparent)',
  animation: `${waveAnimation} 15s infinite linear`,
});

const Wave3 = styled(Wave)({
  bottom: '20px',
  opacity: 0.2,
  backgroundImage: 'linear-gradient(to bottom, rgba(3, 169, 244, 0.2), transparent)',
  animation: `${waveAnimation} 20s infinite linear`,
});

const OceanBackground: React.FC = () => {
  return (
    <WaveContainer>
      <Wave />
      <Wave2 />
      <Wave3 />
    </WaveContainer>
  );
};

export default OceanBackground; 