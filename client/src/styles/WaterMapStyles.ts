// 地图样式配置
export const mapStyles = {
  // 水域颜色
  waterColor: '#a4d3fb',
  
  // 标注样式
  markerNormal: {
    size: 8,
    color: '#0288d1',
    borderColor: '#fff',
    borderWidth: 2,
  },
  
  markerHighlight: {
    size: 10,
    color: '#26a69a',
    borderColor: '#fff',
    borderWidth: 2,
  },
  
  // 水质状态颜色
  waterQualityColors: {
    normal: '#4CAF50',     // 正常
    lightPolluted: '#FFC107', // 轻度污染
    mediumPolluted: '#FF9800', // 中度污染
    heavyPolluted: '#F44336',  // 重度污染
  },
  
  // 自定义信息窗口样式
  infoWindow: {
    width: '300px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  
  // 主题色
  theme: {
    primary: '#0288d1', // 深海蓝
    secondary: '#26a69a', // 海藻绿
    border: '#e0e0e0',
    background: '#f5f5f5',
  }
};

// 自定义地图样式
export const customMapStyle = [
  // 水系设置
  {
    featureType: 'water',
    elementType: 'all',
    stylers: {
      color: '#a4d3fb',
      visibility: 'on',
    }
  },
  // 陆地设置
  {
    featureType: 'land',
    elementType: 'all',
    stylers: {
      color: '#f5f5f5',
      visibility: 'on',
    }
  },
  // 区域边界设置
  {
    featureType: 'boundary',
    elementType: 'all',
    stylers: {
      color: '#b8d5f5',
      weight: '1',
      visibility: 'on',
    }
  },
  // 道路设置
  {
    featureType: 'road',
    elementType: 'all',
    stylers: {
      color: '#ffffff',
      visibility: 'on',
    }
  }
]; 