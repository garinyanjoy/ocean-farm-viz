import React from 'react';
import styled from 'styled-components';
import oceanTheme from '../styles/oceanTheme';

// 波浪SVG
const waveBorder = `
<svg viewBox="0 0 1200 30" xmlns="http://www.w3.org/2000/svg">
  <path d="M0,15 C100,5 200,25 300,15 C400,5 500,25 600,15 C700,5 800,25 900,15 C1000,5 1100,25 1200,15 L1200,30 L0,30 Z" fill="${oceanTheme.wave}" opacity="0.6"/>
</svg>
`;

const ToolBarContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 24px;
  background: ${oceanTheme.panelGradient};
  border-radius: 16px;
  box-shadow: ${oceanTheme.cardShadow};
  margin: 16px 0;
  position: relative;
  border: 1px solid ${oceanTheme.border};
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 8px;
    background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(waveBorder)}');
    background-size: 100% 100%;
  }
`;

const ToolButton = styled.button`
  background: linear-gradient(135deg, ${oceanTheme.primary} 0%, ${oceanTheme.sky} 100%);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${oceanTheme.buttonShadow};
  transition: all ${oceanTheme.transitionFast};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(33,150,243,0.3);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: auto;
`;

const FilterLabel = styled.span`
  font-size: 14px;
  color: ${oceanTheme.deepBlue};
  font-weight: 500;
`;

const FilterSelect = styled.select`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${oceanTheme.border};
  background-color: rgba(255, 255, 255, 0.8);
  color: ${oceanTheme.deepBlue};
  font-size: 14px;
  outline: none;
  transition: all ${oceanTheme.transitionFast};
  
  &:focus {
    border-color: ${oceanTheme.primary};
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${oceanTheme.border};
  background-color: rgba(255, 255, 255, 0.8);
  color: ${oceanTheme.deepBlue};
  font-size: 14px;
  outline: none;
  width: 180px;
  transition: all ${oceanTheme.transitionFast};
  
  &:focus {
    border-color: ${oceanTheme.primary};
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
    width: 220px;
  }
  
  &::placeholder {
    color: ${oceanTheme.lightText};
  }
`;

interface ToolBarProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onFilter?: (filter: string) => void;
  onSearch?: (query: string) => void;
  filterOptions?: Array<{ value: string; label: string }>;
}

const ToolBar: React.FC<ToolBarProps> = ({
  onRefresh,
  onExport,
  onFilter,
  onSearch,
  filterOptions = [],
}) => {
  return (
    <ToolBarContainer>
      {onRefresh && (
        <ToolButton onClick={onRefresh}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          刷新数据
        </ToolButton>
      )}
      
      {onExport && (
        <ToolButton onClick={onExport}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
          </svg>
          导出数据
        </ToolButton>
      )}
      
      <FilterContainer>
        {filterOptions.length > 0 && (
          <>
            <FilterLabel>筛选：</FilterLabel>
            <FilterSelect onChange={(e) => onFilter?.(e.target.value)}>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </>
        )}
        
        {onSearch && (
          <SearchInput
            type="text"
            placeholder="搜索..."
            onChange={(e) => onSearch(e.target.value)}
          />
        )}
      </FilterContainer>
    </ToolBarContainer>
  );
};

export default ToolBar; 