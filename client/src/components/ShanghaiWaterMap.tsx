import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { shanghaiWaterStations, WaterStation, WaterQualityData, getAllStationsData, getStationAllData } from '../data/shanghaiWaterStations';
import type { HydroData } from '../types/hydro';
import oceanTheme from '../styles/oceanTheme';

// 修复 Leaflet 默认图标路径问题
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// 水质参数类型定义
type WaterQualityParameter = keyof Pick<WaterQualityData, 'pH' | 'dissolved_oxygen' | 'ammonia_nitrogen'>;

interface WaterQualityThreshold {
  name: string;
  unit: string;
  ranges: Array<{
    min: number;
    max: number;
    level: WaterQualityLevel;
  }>;
}

type WaterQualityThresholds = {
  [K in WaterQualityParameter]: WaterQualityThreshold;
};

// 水质等级类型定义
type WaterQualityLevel = 'I' | 'II' | 'III' | 'IV' | 'V';

interface WaterQualityLevelInfo {
  color: string;
  description: string;
}

type WaterQualityLevels = Record<WaterQualityLevel, WaterQualityLevelInfo>;

// 水质参数阈值
const WATER_QUALITY_THRESHOLDS: WaterQualityThresholds = {
  pH: {
    name: 'pH值',
    unit: '',
    ranges: [
      { min: 6.5, max: 8.5, level: 'I' },
      { min: 6.0, max: 9.0, level: 'II' },
      { min: 5.5, max: 9.5, level: 'III' }
    ]
  },
  dissolved_oxygen: {
    name: '溶解氧',
    unit: 'mg/L',
    ranges: [
      { min: 7.5, max: Infinity, level: 'I' },
      { min: 6.0, max: 7.5, level: 'II' },
      { min: 5.0, max: 6.0, level: 'III' },
      { min: 3.0, max: 5.0, level: 'IV' },
      { min: 2.0, max: 3.0, level: 'V' }
    ]
  },
  ammonia_nitrogen: {
    name: '氨氮',
    unit: 'mg/L',
    ranges: [
      { min: 0, max: 0.15, level: 'I' },
      { min: 0.15, max: 0.5, level: 'II' },
      { min: 0.5, max: 1.0, level: 'III' },
      { min: 1.0, max: 1.5, level: 'IV' },
      { min: 1.5, max: 2.0, level: 'V' }
    ]
  }
};

// 水质等级定义
const WATER_QUALITY_LEVELS: WaterQualityLevels = {
  I: { color: '#8BC34A', description: '优' },
  II: { color: '#4CAF50', description: '良好' },
  III: { color: '#FFC107', description: '轻度污染' },
  IV: { color: '#FF9800', description: '中度污染' },
  V: { color: '#F44336', description: '重度污染' }
};

// 获取水质等级
const getWaterQualityLevel = (value: number, parameter: WaterQualityParameter): WaterQualityLevel => {
  const thresholds = WATER_QUALITY_THRESHOLDS[parameter];
  if (!thresholds) return 'V';

  for (const range of thresholds.ranges) {
    if (value >= range.min && value <= range.max) {
      return range.level;
    }
  }
  return 'V';
};

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// 自定义颜色主题
const theme = {
  primary: '#0288d1', // 深海蓝
  secondary: '#26a69a', // 海藻绿
  border: '#e0e0e0',
  background: '#f5f5f5',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  text: '#333333',
  lightText: '#666666',
};

// 水质指标评估函数
const getWaterQualityStatus = (value: number, type: string): string => {
  switch (type) {
    case 'pH':
      return value >= 6.5 && value <= 8.5 ? '正常' : '异常';
    case 'dissolved_oxygen':
      return value >= 5 ? '正常' : '异常';
    case 'turbidity':
      return value <= 10 ? '正常' : '异常';
    case 'ammonia_nitrogen':
      return value <= 1.0 ? '正常' : '异常';
    default:
      return '正常';
  }
};

// 获取状态对应的颜色
const getStatusColor = (status: string): string => {
  switch (status) {
    case '正常':
      return theme.success;
    case '异常':
      return theme.error;
    case '维护中':
      return theme.warning;
    default:
      return theme.lightText;
  }
};

interface ShanghaiWaterMapProps {
  onStationSelect?: (station: WaterStation, data: WaterQualityData[]) => void;
  hydroData?: HydroData[];
}

const ShanghaiWaterMap: React.FC<ShanghaiWaterMapProps> = ({ onStationSelect, hydroData }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedStation, setSelectedStation] = useState<WaterStation | null>(null);
  const [stationData, setStationData] = useState<WaterQualityData[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [legendVisible, setLegendVisible] = useState(true);
  const [activeMarker, setActiveMarker] = useState<L.Marker | null>(null);
  const [showHistoricalData, setShowHistoricalData] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [allData] = useState<WaterQualityData[]>(getAllStationsData());
  const markersRef = useRef<L.Marker[]>([]);

  // 清除所有弹窗和悬浮窗的函数
  const clearAllPopupsExcept = (exceptMarker: L.Marker | null) => {
    markersRef.current.forEach(marker => {
      if (marker !== exceptMarker) {
        marker.closePopup();
      }
    });
    if (!exceptMarker?.isPopupOpen()) {
      setTooltipVisible(false);
    }
  };

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const newMap = L.map(mapContainerRef.current).setView([31.230416, 121.473701], 11);

    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ["1", "2", "3", "4"],
      attribution: '© 高德地图'
    }).addTo(newMap);

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  // 创建自定义弹出框内容
  const createPopupContent = (station: WaterStation, latestData: WaterQualityData | null) => {
    return `
      <div style="font-family: Arial, sans-serif; padding: 15px; min-width: 280px;">
        <h3 style="margin: 0 0 10px 0; color: ${theme.primary}; font-size: 16px; border-bottom: 1px solid ${theme.border}; padding-bottom: 8px;">
          ${station.name}
        </h3>
        <p style="margin: 5px 0; color: ${theme.text};">
          <strong>所属流域:</strong> ${station.basin}
        </p>
        <p style="margin: 5px 0; color: ${theme.text};">
          <strong>位置:</strong> ${station.location}
        </p>
        ${station.description ? `
          <p style="margin: 5px 0; color: ${theme.text};">
            <strong>描述:</strong> ${station.description}
          </p>
        ` : ''}
        ${latestData ? `
          <div style="margin-top: 10px; background: ${theme.background}; padding: 12px; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: ${theme.text}; font-size: 14px;">
              <strong>最新监测数据</strong> (${latestData.date})
            </p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${(Object.entries(WATER_QUALITY_THRESHOLDS) as [WaterQualityParameter, WaterQualityThreshold][]).map(([key, { name, unit }]) => {
                const value = latestData[key];
                const level = getWaterQualityLevel(value, key);
                const color = WATER_QUALITY_LEVELS[level].color;
                return `
                  <div style="
                    background: white;
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid ${theme.border};
                  ">
                    <div style="font-size: 12px; color: ${theme.lightText};">${name}</div>
                    <div style="
                      font-size: 14px;
                      font-weight: bold;
                      color: ${color};
                      margin-top: 4px;
                    ">
                      ${value} ${unit}
                      <span style="
                        font-size: 11px;
                        background: ${color};
                        color: white;
                        padding: 2px 4px;
                        border-radius: 3px;
                        margin-left: 5px;
                      ">
                        ${level}类
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div style="
              margin-top: 10px;
              padding: 8px;
              border-radius: 4px;
              background: ${latestData.site_condition === '正常' ? '#e8f5e9' : latestData.site_condition === '异常' ? '#ffebee' : '#fff3e0'};
              color: ${latestData.site_condition === '正常' ? '#2e7d32' : latestData.site_condition === '异常' ? '#c62828' : '#ef6c00'};
              font-size: 13px;
              text-align: center;
            ">
              <strong>站点状态:</strong> ${latestData.site_condition}
            </div>
          </div>
        ` : ''}
        <button class="show-history-btn" style="
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          background: ${theme.primary};
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        ">
          查看历史数据趋势
        </button>
      </div>
    `;
  };

  // 添加标注点
  useEffect(() => {
    if (!map) return;

    // 清除现有的标记
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // 添加新的标记
    shanghaiWaterStations.forEach(station => {
      const data = getStationAllData(station.id, allData);
      const latestData = data[0] || null;

      // 根据最新数据确定标记点颜色
      let markerColor = theme.primary;
      if (latestData) {
        const doLevel = getWaterQualityLevel(latestData.dissolved_oxygen, 'dissolved_oxygen');
        markerColor = WATER_QUALITY_LEVELS[doLevel].color;
      }

      // 创建自定义标记点
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background: ${markerColor};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${station.name.slice(0, 2)}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([station.coordinates[1], station.coordinates[0]], {
        icon: customIcon,
        title: station.name
      });

      markersRef.current.push(marker);

      const popup = L.popup({
        maxWidth: 350,
        className: 'custom-popup',
        closeButton: true,
        closeOnClick: false,
        autoClose: false
      });

      // 设置弹出框内容并添加事件监听器
      popup.setContent(createPopupContent(station, latestData));
      popup.on('contentupdate', () => {
        const showHistoryBtn = document.querySelector('.show-history-btn');
        if (showHistoryBtn) {
          showHistoryBtn.addEventListener('click', () => {
            clearAllPopupsExcept(marker);
            setShowHistoricalData(true);
            setSelectedStation(station);
            setStationData(data);
            onStationSelect?.(station, data);
          });
        }
      });

      marker.bindPopup(popup);

      // 添加事件监听器
      marker.on('click', () => {
        clearAllPopupsExcept(marker);
        setActiveMarker(marker);
        setSelectedStation(station);
        setStationData(data);
        marker.openPopup();
      });

      marker.on('mouseover', (e) => {
        if (!showHistoricalData) {
          if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
          }

          const pos = e.originalEvent;
          setTooltipPosition({ x: pos.clientX, y: pos.clientY });
          setSelectedStation(station);
          setStationData(data);
          setTooltipVisible(true);
        }
      });

      marker.on('mouseout', () => {
        if (!showHistoricalData) {
          tooltipTimeoutRef.current = setTimeout(() => {
            if (!marker.isPopupOpen()) {
              setTooltipVisible(false);
            }
          }, 300);
        }
      });

      marker.addTo(map);
    });

    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [map, allData, onStationSelect, showHistoricalData]);

  return (
    <MapContainer>
      <MapTitle>上海市水质监测断面分布图</MapTitle>
      <MapWrapper ref={mapContainerRef} />
      
      {tooltipVisible && !showHistoricalData && selectedStation && stationData.length > 0 && (
        <Tooltip 
          style={{ left: `${tooltipPosition.x + 10}px`, top: `${tooltipPosition.y + 10}px` }}
          onMouseEnter={() => {
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
              tooltipTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (!showHistoricalData) {
              tooltipTimeoutRef.current = setTimeout(() => {
                if (!activeMarker?.isPopupOpen()) {
                  setTooltipVisible(false);
                }
              }, 300);
            }
          }}
          onClick={() => {
            if (activeMarker) {
              clearAllPopupsExcept(activeMarker);
              activeMarker.openPopup();
            }
          }}
        >
          <TooltipHeader>
            <h3>{selectedStation.name}</h3>
            <span>{selectedStation.basin}</span>
          </TooltipHeader>
          <TooltipContent>
            <LocationInfo>{selectedStation.location}</LocationInfo>
            {stationData.slice(0, 1).map((data, index) => (
              <WaterQualityGrid key={index}>
                {(Object.entries(WATER_QUALITY_THRESHOLDS) as [WaterQualityParameter, WaterQualityThreshold][]).map(([key, { name, unit }]) => {
                  const value = data[key];
                  const level = getWaterQualityLevel(value, key);
                  return (
                    <WaterQualityItem key={key} level={level}>
                      <span>{name}</span>
                      <strong>{value} {unit}</strong>
                      <QualityLevel level={level}>{level}类</QualityLevel>
                    </WaterQualityItem>
                  );
                })}
              </WaterQualityGrid>
            ))}
            <SmallNote>点击查看更多信息</SmallNote>
          </TooltipContent>
        </Tooltip>
      )}

      {legendVisible && (
        <Legend>
          <LegendTitle>水质等级说明</LegendTitle>
          {Object.entries(WATER_QUALITY_LEVELS).map(([level, { color, description }]) => (
            <LegendItem key={level}>
              <LegendColor color={color} />
              <span>等级{level} - {description}</span>
            </LegendItem>
          ))}
        </Legend>
      )}

      <LegendToggle onClick={() => setLegendVisible(!legendVisible)}>
        {legendVisible ? '隐藏图例' : '显示图例'}
      </LegendToggle>

      {showHistoricalData && selectedStation && stationData.length > 0 && (
        <DataPanel>
          <DataPanelHeader>
            <div>
              <h2>{selectedStation.name}</h2>
              <h3>所属流域: {selectedStation.basin}</h3>
              <p>位置: {selectedStation.location}</p>
              {selectedStation.description && (
                <p>描述: {selectedStation.description}</p>
              )}
            </div>
            <CloseButton onClick={() => {
              setShowHistoricalData(false);
              setSelectedStation(null);
            }}>×</CloseButton>
          </DataPanelHeader>
          
          <DataTable>
            <thead>
              <tr>
                <th>日期</th>
                {(Object.entries(WATER_QUALITY_THRESHOLDS) as [WaterQualityParameter, WaterQualityThreshold][]).map(([key, { name, unit }]) => (
                  <th key={key}>{name}({unit})</th>
                ))}
                <th>站点状态</th>
              </tr>
            </thead>
            <tbody>
              {stationData.map((data, index) => (
                <tr key={index}>
                  <td>{data.date}</td>
                  {(Object.entries(WATER_QUALITY_THRESHOLDS) as [WaterQualityParameter, WaterQualityThreshold][]).map(([key, { unit }]) => {
                    const value = data[key];
                    const level = getWaterQualityLevel(value, key);
                    return (
                      <td key={key}>
                        <DataValue level={level}>
                          {value} {unit}
                          <QualityLevel level={level} small>{level}类</QualityLevel>
                        </DataValue>
                      </td>
                    );
                  })}
                  <td>
                    <StatusBadge status={data.site_condition}>
                      {data.site_condition}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataPanel>
      )}
    </MapContainer>
  );
};

// 样式组件
const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${oceanTheme.cardShadow};
  border: 1px solid ${oceanTheme.border};
  background: ${oceanTheme.panelGradient};
`;

const MapTitle = styled.h2`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  padding: 8px 24px;
  border-radius: 30px;
  font-size: 1.4rem;
  color: ${oceanTheme.deepBlue};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid ${oceanTheme.border};
  backdrop-filter: blur(4px);
  font-family: 'AlibabaPuHuiTi-3', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  
  &::before, &::after {
    content: "🌊";
    margin: 0 10px;
  }
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 600px;
  z-index: 1;
`;

const Tooltip = styled.div`
  position: fixed;
  z-index: 1500;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(179, 229, 252, 0.9));
  border-radius: 12px;
  padding: 16px;
  width: 280px;
  box-shadow: ${oceanTheme.cardShadow};
  border: 1px solid ${oceanTheme.border};
  pointer-events: auto;
  cursor: pointer;
  transition: all ${oceanTheme.transitionFast};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${oceanTheme.primary}, ${oceanTheme.sky});
    border-radius: 12px 12px 0 0;
  }
`;

const TooltipHeader = styled.div`
  border-bottom: 1px solid ${oceanTheme.border};
  padding-bottom: 8px;
  margin-bottom: 12px;
  
  h3 {
    margin: 0 0 4px 0;
    color: ${oceanTheme.deepBlue};
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  span {
    font-size: 0.85rem;
    color: ${oceanTheme.lightText};
  }
`;

const TooltipContent = styled.div`
  font-size: 0.9rem;
`;

const LocationInfo = styled.div`
  margin-bottom: 10px;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  color: ${oceanTheme.text};
  font-size: 0.85rem;
`;

const WaterQualityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const WaterQualityItem = styled.div<{ level: WaterQualityLevel }>`
  padding: 8px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span {
    font-size: 0.75rem;
    color: ${oceanTheme.lightText};
    margin-bottom: 4px;
  }
  
  strong {
    font-size: 0.9rem;
    color: ${props => {
      const level = props.level;
      return WATER_QUALITY_LEVELS[level].color || oceanTheme.primary;
    }};
  }
`;

const QualityLevel = styled.div<{ level: WaterQualityLevel; small?: boolean }>`
  background-color: ${props => {
    const level = props.level;
    return WATER_QUALITY_LEVELS[level].color || oceanTheme.primary;
  }};
  color: white;
  font-size: ${props => props.small ? '0.65rem' : '0.7rem'};
  padding: ${props => props.small ? '1px 4px' : '2px 6px'};
  border-radius: 4px;
  margin-top: 3px;
  font-weight: 600;
`;

const SmallNote = styled.div`
  font-size: 0.75rem;
  color: ${oceanTheme.lightText};
  text-align: center;
  margin-top: 10px;
  font-style: italic;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(179, 229, 252, 0.9));
  border-radius: 12px;
  padding: 12px;
  width: 200px;
  box-shadow: ${oceanTheme.cardShadow};
  border: 1px solid ${oceanTheme.border};
  z-index: 1000;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${oceanTheme.primary}, ${oceanTheme.sky});
    border-radius: 12px 12px 0 0;
  }
`;

const LegendTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${oceanTheme.deepBlue};
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid ${oceanTheme.border};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.8rem;
  color: ${oceanTheme.text};
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 8px;
`;

const LegendToggle = styled.button`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: ${oceanTheme.buttonGradient};
  color: ${oceanTheme.deepBlue};
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  z-index: 1000;
  box-shadow: ${oceanTheme.buttonShadow};
  transition: all ${oceanTheme.transitionFast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(33,150,243,0.3);
  }
`;

const DataPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 500px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(179, 229, 252, 0.9));
  border-radius: 16px;
  padding: 20px;
  box-shadow: ${oceanTheme.cardShadow};
  border: 1px solid ${oceanTheme.border};
  z-index: 1200;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, ${oceanTheme.primary}, ${oceanTheme.sky});
    border-radius: 16px 16px 0 0;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(179, 229, 252, 0.2);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${oceanTheme.sky};
    border-radius: 10px;
  }
`;

const DataPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${oceanTheme.border};
  
  h2 {
    margin: 0 0 8px 0;
    color: ${oceanTheme.deepBlue};
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  h3 {
    margin: 0 0 6px 0;
    color: ${oceanTheme.primary};
    font-size: 1rem;
    font-weight: 500;
  }
  
  p {
    margin: 0 0 4px 0;
    color: ${oceanTheme.text};
    font-size: 0.9rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${oceanTheme.lightText};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${oceanTheme.deepBlue};
    transform: scale(1.2);
  }
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  
  th {
    background-color: rgba(33, 150, 243, 0.1);
    color: ${oceanTheme.deepBlue};
    padding: 8px;
    text-align: left;
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  
  td {
    padding: 8px;
    border-bottom: 1px solid ${oceanTheme.border};
    color: ${oceanTheme.text};
  }
  
  tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.5);
  }
  
  tr:hover {
    background-color: rgba(33, 150, 243, 0.05);
  }
`;

const DataValue = styled.div<{ level: WaterQualityLevel }>`
  color: ${props => {
    const level = props.level;
    return WATER_QUALITY_LEVELS[level].color || oceanTheme.primary;
  }};
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case '正常': return 'rgba(76, 175, 80, 0.2)';
      case '异常': return 'rgba(244, 67, 54, 0.2)';
      case '维护中': return 'rgba(255, 152, 0, 0.2)';
      default: return 'rgba(158, 158, 158, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case '正常': return '#2e7d32';
      case '异常': return '#c62828';
      case '维护中': return '#ef6c00';
      default: return '#616161';
    }
  }};
`;

export default ShanghaiWaterMap; 