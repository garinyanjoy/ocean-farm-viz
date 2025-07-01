import React from 'react';
import styled, { keyframes } from 'styled-components';
import oceanTheme from '../styles/oceanTheme';

// 波浪动画
const waveAnimation = keyframes`
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: 1000px;
  }
`;

// 浮动动画
const floatAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
`;

// 气泡上升动画
const bubbleAnimation = keyframes`
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
`;

// 阳光闪烁动画
const sunshineAnimation = keyframes`
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
`;

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
`;

const Wave = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 150" xmlns="http://www.w3.org/2000/svg"><path d="M0,100 C150,50 350,150 500,100 C650,50 850,150 1000,100 L1000,150 L0,150 Z" fill="%2381d4fa" opacity="0.3"/></svg>') repeat-x;
  background-size: 1000px 100px;
  animation: ${waveAnimation} 20s linear infinite;
  opacity: 0.6;
  
  &:nth-child(2) {
    bottom: -10px;
    height: 120px;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 150" xmlns="http://www.w3.org/2000/svg"><path d="M0,100 C150,50 350,150 500,100 C650,50 850,150 1000,100 L1000,150 L0,150 Z" fill="%234fc3f7" opacity="0.3"/></svg>') repeat-x;
    background-size: 1000px 120px;
    animation: ${waveAnimation} 15s linear infinite;
    opacity: 0.5;
  }
  
  &:nth-child(3) {
    bottom: -20px;
    height: 140px;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 150" xmlns="http://www.w3.org/2000/svg"><path d="M0,100 C150,50 350,150 500,100 C650,50 850,150 1000,100 L1000,150 L0,150 Z" fill="%232196f3" opacity="0.2"/></svg>') repeat-x;
    background-size: 1000px 140px;
    animation: ${waveAnimation} 30s linear infinite;
    opacity: 0.4;
  }
`;

const Sunshine = styled.div`
  position: absolute;
  top: 40px;
  right: 80px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, ${oceanTheme.secondary} 0%, rgba(255, 235, 59, 0) 70%);
  border-radius: 50%;
  animation: ${sunshineAnimation} 5s ease-in-out infinite;
  opacity: 0.7;
`;

const SeaElement = styled.div<{ size: number; delay: number; duration: number; left: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-size: contain;
  background-repeat: no-repeat;
  animation: ${floatAnimation} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  left: ${props => props.left};
  bottom: 10%;
  opacity: 0.7;
`;

const Seaweed = styled(SeaElement)`
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"><path d="M50,0 C60,40 40,80 50,120 C60,160 40,200 50,200" stroke="%234caf50" stroke-width="5" fill="none"/><path d="M30,50 C40,90 20,130 30,170" stroke="%234caf50" stroke-width="4" fill="none"/><path d="M70,30 C80,70 60,110 70,150" stroke="%234caf50" stroke-width="4" fill="none"/></svg>');
  height: ${props => props.size * 2}px;
`;

const Fish = styled(SeaElement)`
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M20,25 L0,40 L0,10 Z" fill="%234fc3f7"/><ellipse cx="60" cy="25" rx="40" ry="20" fill="%234fc3f7"/><circle cx="75" cy="20" r="3" fill="white"/></svg>');
`;

const Shell = styled(SeaElement)`
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20,80 C0,60 0,40 20,20 C40,0 60,0 80,20 C100,40 100,60 80,80 C60,100 40,100 20,80 Z" fill="%23ffe0b2"/><path d="M30,70 C20,60 20,40 30,30 C40,20 60,20 70,30 C80,40 80,60 70,70 C60,80 40,80 30,70 Z" fill="%23ffcc80"/></svg>');
`;

const Starfish = styled(SeaElement)`
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" fill="%23ff7043"/></svg>');
`;

const Bubble = styled.div<{ size: number; delay: number; duration: number; left: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.1));
  bottom: -100px;
  left: ${props => props.left};
  animation: ${bubbleAnimation} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const OceanBackground: React.FC = () => {
  // 生成多个气泡
  const renderBubbles = () => {
    const bubbles = [];
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 30 + 10;
      const delay = Math.random() * 30;
      const duration = Math.random() * 10 + 10;
      const left = `${Math.random() * 100}%`;
      
      bubbles.push(
        <Bubble 
          key={`bubble-${i}`}
          size={size}
          delay={delay}
          duration={duration}
          left={left}
        />
      );
    }
    return bubbles;
  };

  return (
    <BackgroundContainer>
      <Sunshine />
      
      {/* 海洋元素 */}
      <Seaweed size={80} delay={0} duration={7} left="5%" />
      <Seaweed size={60} delay={2} duration={8} left="15%" />
      <Seaweed size={70} delay={1} duration={6} left="85%" />
      
      <Fish size={40} delay={3} duration={12} left="25%" />
      <Fish size={30} delay={6} duration={10} left="65%" />
      <Fish size={50} delay={1.5} duration={15} left="45%" />
      
      <Shell size={40} delay={2} duration={9} left="75%" />
      <Starfish size={50} delay={4} duration={11} left="35%" />
      
      {/* 气泡 */}
      {renderBubbles()}
      
      {/* 波浪 */}
      <Wave />
      <Wave />
      <Wave />
    </BackgroundContainer>
  );
};

export default OceanBackground; 