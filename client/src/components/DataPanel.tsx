import React from 'react';
import styled from 'styled-components';
import oceanTheme from '../styles/oceanTheme';
import {
  Thermostat as ThermostatIcon,
  Opacity as OpacityIcon,
  Science as ScienceIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';

// 波浪装饰SVG
const waveDecoration = `
<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
  <path d="M0,0 C150,40 350,0 600,30 C850,60 1050,20 1200,0 L1200,120 L0,120 Z" fill="${oceanTheme.sky}" opacity="0.6"/>
</svg>
`;

// 贝壳图标SVG
const shellIcon = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M20,80 C0,60 0,40 20,20 C40,0 60,0 80,20 C100,40 100,60 80,80 C60,100 40,100 20,80 Z" fill="${oceanTheme.sand}"/>
  <path d="M30,70 C20,60 20,40 30,30 C40,20 60,20 70,30 C80,40 80,60 70,70 C60,80 40,80 30,70 Z" fill="${oceanTheme.coral}" opacity="0.7"/>
</svg>
`;

const Panel = styled.div`
  background: ${oceanTheme.panelGradient};
  border-radius: 16px;
  box-shadow: ${oceanTheme.cardShadow};
  padding: 24px;
  margin: 16px 0;
  position: relative;
  overflow: hidden;
  border: 1px solid ${oceanTheme.border};
  transition: all ${oceanTheme.transitionNormal};
  
  &:hover {
    box-shadow: 0 12px 48px rgba(0,188,212,0.18);
    transform: translateY(-4px);
  }
`;

const WaveTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 12px;
  background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(waveDecoration)}');
  background-size: cover;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 8px;
  border-bottom: 2px solid ${oceanTheme.border};
  padding-bottom: 12px;
`;

const PanelTitle = styled.h3`
  margin: 0;
  color: ${oceanTheme.deepBlue};
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  &:before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    margin-right: 8px;
    background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(shellIcon)}');
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const PanelContent = styled.div`
  position: relative;
  z-index: 1;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const DataCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,188,212,0.08);
  border: 1px solid ${oceanTheme.border};
  transition: all ${oceanTheme.transitionFast};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0,188,212,0.12);
  }
`;

const DataLabel = styled.div`
  font-size: 0.9rem;
  color: ${oceanTheme.lightText};
  margin-bottom: 6px;
`;

const DataValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${oceanTheme.deepBlue};
`;

const DataUnit = styled.span`
  font-size: 0.9rem;
  color: ${oceanTheme.lightText};
  margin-left: 4px;
`;

interface DataPanelProps {
  title: string;
  children?: React.ReactNode;
}

const DataPanel: React.FC<DataPanelProps> = ({ title, children }) => {
  return (
    <Panel>
      <WaveTop />
      <PanelHeader>
        <PanelTitle>{title}</PanelTitle>
      </PanelHeader>
      <PanelContent>
        {children}
      </PanelContent>
    </Panel>
  );
};

// 导出主组件和子组件
export default DataPanel;
export { DataGrid, DataCard, DataLabel, DataValue, DataUnit }; 