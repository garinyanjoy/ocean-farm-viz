// 上海水质监测断面坐标信息
export interface WaterStation {
  id: string;
  name: string;
  basin: string;
  location: string;
  coordinates: [number, number]; // [经度, 纬度]
  type: '河流' | '湖泊' | '河口';
  description?: string;
}

// 上海市主要水质监测断面
export const shanghaiWaterStations: WaterStation[] = [
  {
    id: 'HJ01',
    name: '黄浦江吴淞口',
    basin: '黄浦江',
    location: '吴淞口水域',
    coordinates: [121.508189, 31.405871],
    type: '河口',
    description: '黄浦江入长江口断面'
  },
  {
    id: 'HJ02',
    name: '黄浦江外白渡桥',
    basin: '黄浦江',
    location: '外白渡桥水域',
    coordinates: [121.490973, 31.241839],
    type: '河流',
    description: '市中心重要监测断面'
  },
  {
    id: 'HJ03',
    name: '黄浦江杨浦大桥',
    basin: '黄浦江',
    location: '杨浦大桥水域',
    coordinates: [121.526752, 31.260971],
    type: '河流',
    description: '黄浦江下游重要断面'
  },
  {
    id: 'SZ01',
    name: '苏州河提篮桥',
    basin: '苏州河',
    location: '提篮桥水域',
    coordinates: [121.498892, 31.251234],
    type: '河流',
    description: '苏州河入黄浦江口断面'
  },
  {
    id: 'SZ02',
    name: '苏州河中山公园',
    basin: '苏州河',
    location: '中山公园水域',
    coordinates: [121.420836, 31.231518],
    type: '河流',
    description: '苏州河中游断面'
  },
  {
    id: 'DH01',
    name: '淀浦河青浦',
    basin: '淀浦河',
    location: '青浦水域',
    coordinates: [121.113052, 31.151673],
    type: '河流',
    description: '淀浦河上游断面'
  },
  {
    id: 'CH01',
    name: '长江口崇明岛',
    basin: '长江口',
    location: '崇明岛北部水域',
    coordinates: [121.397705, 31.617676],
    type: '河口',
    description: '长江口生态监测点'
  },
  {
    id: 'DH02',
    name: '大治河闵行',
    basin: '大治河',
    location: '闵行水域',
    coordinates: [121.375818, 31.115896],
    type: '河流',
    description: '大治河重要断面'
  }
];

// 生成模拟的水质数据
export interface WaterQualityData {
  stationId: string;
  date: string;
  pH: number;
  dissolved_oxygen: number;
  ammonia_nitrogen: number;
  water_temperature: number;
  turbidity: number;
  conductivity: number;
  total_phosphorus: number;
  total_nitrogen: number;
  chlorophyll: number;
  site_condition: '正常' | '异常' | '维护中';
}

// 生成指定范围内的随机数
const randomInRange = (min: number, max: number): number => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

// 随机选择站点状态
const getRandomSiteCondition = (): '正常' | '异常' | '维护中' => {
  const rand = Math.random();
  if (rand < 0.8) return '正常';
  if (rand < 0.9) return '异常';
  return '维护中';
};

// 生成单个站点的历史数据
export const generateStationData = (stationId: string, days: number = 30): WaterQualityData[] => {
  const data: WaterQualityData[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      stationId,
      date: date.toISOString().split('T')[0],
      pH: randomInRange(6.5, 8.5),
      dissolved_oxygen: randomInRange(5.0, 9.0),
      ammonia_nitrogen: randomInRange(0.1, 1.0),
      water_temperature: randomInRange(15, 25),
      turbidity: randomInRange(0, 10),
      conductivity: randomInRange(200, 800),
      total_phosphorus: randomInRange(0.01, 0.2),
      total_nitrogen: randomInRange(0.5, 2.0),
      chlorophyll: randomInRange(1, 20),
      site_condition: getRandomSiteCondition()
    });
  }

  return data;
};

// 获取所有站点的数据
export const getAllStationsData = (): WaterQualityData[] => {
  let allData: WaterQualityData[] = [];
  shanghaiWaterStations.forEach(station => {
    allData = allData.concat(generateStationData(station.id));
  });
  return allData;
};

// 获取指定站点的所有数据
export const getStationAllData = (stationId: string, allData: WaterQualityData[]): WaterQualityData[] => {
  return allData.filter(data => data.stationId === stationId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 获取指定站点的最新数据
export const getStationLatestData = (stationId: string, allData: WaterQualityData[]): WaterQualityData | null => {
  const stationData = getStationAllData(stationId, allData);
  return stationData.length > 0 ? stationData[0] : null;
}; 