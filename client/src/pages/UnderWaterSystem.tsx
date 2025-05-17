import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { styled } from "@mui/system";

// 模拟数据：真实项目中应通过接口获取
const waterQualityData = [
  { label: "水温", value: 22.5 },
  { label: "pH", value: 7.4 },
  { label: "溶解氧", value: 6.8 },
  { label: "电导率", value: 300 },
  { label: "浊度", value: 2.1 },
  { label: "高锰酸盐指数", value: 3.2 },
  { label: "氨氮", value: 0.5 },
  { label: "总磷", value: 0.2 },
  { label: "总氮", value: 1.8 },
];
interface Fish {
  species: string;
  weight: number;
  length: number;
  height: number;
  width: number;
}
// 生成正态分布的随机数
function randomNormal(mean: number, std: number) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// 生成模拟鱼类数据
const fishSpecies = ["鲤鱼", "草鱼", "鲫鱼", "鲢鱼"];
const fishData: Fish[] = [];
for (let i = 0; i < 200; i++) {
  const species = fishSpecies[Math.floor(Math.random() * fishSpecies.length)];
  // 不同鱼种不同均值和方差
  let meanWeight = 1.5, stdWeight = 0.3, meanLength = 30, stdLength = 5;
  if (species === "草鱼") { meanWeight = 2.2; stdWeight = 0.4; meanLength = 38; stdLength = 6; }
  if (species === "鲫鱼") { meanWeight = 0.8; stdWeight = 0.15; meanLength = 20; stdLength = 3; }
  if (species === "鲢鱼") { meanWeight = 2.8; stdWeight = 0.5; meanLength = 42; stdLength = 7; }
  fishData.push({
    species,
    weight: Math.max(0.2, Number(randomNormal(meanWeight, stdWeight).toFixed(2))),
    length: Math.max(5, Number(randomNormal(meanLength, stdLength).toFixed(2))),
    height: Math.max(2, Number(randomNormal(10, 2).toFixed(2))),
    width: Math.max(1, Number(randomNormal(5, 1).toFixed(2))),
  });
}

// 环境评分：均值示例
const calculateScore = () => {
  const sum = waterQualityData.reduce((acc, item) => acc + item.value, 0);
  return parseFloat((sum / waterQualityData.length).toFixed(2));
};

const SectionCard = styled(Card)(({ theme }) => ({
  background: "rgba(255,255,255,0.13)",
  borderRadius: '1.5rem',
  boxShadow: '0 8px 32px 0 rgba(2, 119, 189, 0.25)',
  color: '#fff',
  border: '2px solid',
  borderImage: 'linear-gradient(135deg, #4fc3f7 0%, #01579b 100%) 1',
  backdropFilter: 'blur(8px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 16px 48px 0 rgba(2, 119, 189, 0.35)',
    borderImage: 'linear-gradient(135deg, #81d4fa 0%, #0288d1 100%) 1',
  },
}));

const ChartBox = styled(Box)({ height: 250, width: '100%' });
const COLORS = ['#0288d1', '#03a9f4', '#b3e5fc', '#81d4fa'];

const UnderWaterSystem: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [selectedMetric, setSelectedMetric] = useState<keyof Fish>('weight');
  const [selectedSpecies, setSelectedSpecies] = useState<string>(fishData[0].species);
  const [selectedWqMetric, setSelectedWqMetric] = useState<string>(waterQualityData[0].label);

  useEffect(() => { setScore(calculateScore()); }, []);

  // 全量分布
  const makeDistribution = (metric: keyof Fish, data: Fish[]) => {
    // 1. 找到最小最大值
    const values = data.map(f => Number(f[metric]));
    if (values.length === 0) return [];
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    const step = metric === 'weight' ? 0.2 : 2; // 体重用0.2kg，其他用2cm为步长
    const buckets: { x: number, count: number }[] = [];
    for (let x = min; x <= max; x += step) {
      buckets.push({ x: Number(x.toFixed(2)), count: 0 });
    }
    // 2. 统计每个区间数量
    values.forEach(val => {
      const idx = Math.floor((val - min) / step);
      if (buckets[idx]) buckets[idx].count += 1;
    });
    return buckets;
  };

  const overallDist = makeDistribution(selectedMetric, fishData);
  const speciesDist = fishData.filter(f => f.species === selectedSpecies);
  const pieData = fishData.reduce((acc: Record<string, number>, f) => { acc[f.species] = (acc[f.species] || 0) + 1; return acc; }, {});
  const pieChartData = Object.entries(pieData).map(([name, value]) => ({ name, value }));

  return (
    <>
      <div className="bubble-bg">
        {Array.from({length: 18}).map((_,i)=>(
          <span key={i} className="bubble" style={{
            left: `${Math.random()*100}%`,
            animationDuration: `${4+Math.random()*6}s`,
            animationDelay: `${Math.random()*6}s`,
            width: `${10+Math.random()*20}px`,
            height: `${10+Math.random()*20}px`,
            opacity: 0.3+Math.random()*0.5
          }} />
        ))}
      </div>
      <Grid container spacing={2} sx={{ flex: 1, height: "100%", margin: 0 }}>
        {/* 第一行：左-中-右 */}
        <Grid item xs={12} md={4}>
          <SectionCard>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  color: '#e3f2fd',
                  fontWeight: 700,
                }}
              >
                <svg width="24" height="18" viewBox="0 0 24 18" style={{ marginLeft: 8 }} fill="none">
                  <ellipse cx="18" cy="9" rx="3" ry="2.5" fill="#4fc3f7" />
                  <path d="M2 9c3-4 10-7 17-4v8C12 16 5 13 2 9Z" fill="#4fc3f7" fillOpacity="0.7"/>
                  <circle cx="6" cy="9" r="1" fill="#01579b"/>
                </svg>
                鱼群属性分布
              </Typography>
              <ButtonGroup size="small" sx={{ mb: 1 }}>
                {(['weight', 'length', 'height', 'width'] as Array<keyof Fish>).map(m => (
                  <Button
                    key={m}
                    variant={selectedMetric === m ? "contained" : "outlined"}
                    onClick={() => setSelectedMetric(m)}
                    sx={{
                      color: selectedMetric === m ? '#fff' : '#4fc3f7',
                      background: selectedMetric === m ? 'linear-gradient(90deg,#0288d1,#4fc3f7)' : 'none',
                      borderColor: '#4fc3f7'
                    }}
                  >
                    {m === 'weight' ? '体重' : m === 'length' ? '体长' : m === 'height' ? '高度' : '宽度'}
                  </Button>
                ))}
              </ButtonGroup>
              <FormControl size="small" sx={{ ml: 2, minWidth: 120, background: 'rgba(33,150,243,0.10)', borderRadius: 1 }}>
                <InputLabel sx={{ color: '#4fc3f7' }}>鱼种</InputLabel>
                <Select
                  value={selectedSpecies}
                  label="鱼种"
                  onChange={e => setSelectedSpecies(e.target.value)}
                  sx={{
                    color: '#e3f2fd',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#4fc3f7' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0288d1' },
                    '.MuiSvgIcon-root': { color: '#4fc3f7' }
                  }}
                >
                  {Array.from(new Set(fishData.map(f => f.species))).map(sp =>
                    <MenuItem key={sp} value={sp}>{sp}</MenuItem>
                  )}
                </Select>
              </FormControl>
              <ChartBox>
                <ResponsiveContainer>
                  <LineChart data={makeDistribution(selectedMetric, fishData.filter(f => f.species === selectedSpecies))}>
                    <XAxis dataKey="x" stroke="#b3e5fc" type="number" domain={['auto', 'auto']} tickCount={8} />
                    <YAxis stroke="#b3e5fc" />
                    <Tooltip
                      contentStyle={{ background: "rgba(2,119,189,0.8)", border: "none", color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#4fc3f7" strokeWidth={3} dot={{ r: 5, fill: "#0288d1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
              {/* 统计区 */}
              <Box sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'space-around',
                background: 'rgba(33,150,243,0.10)',
                borderRadius: 2,
                py: 1
              }}>
                {(() => {
                  const current = fishData.filter(f => f.species === selectedSpecies);
                  const values = current.map(f => Number(f[selectedMetric]));
                  const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '--';
                  const min = values.length ? Math.min(...values).toFixed(2) : '--';
                  const max = values.length ? Math.max(...values).toFixed(2) : '--';
                  return (
                    <>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: '#4fc3f7', fontWeight: 600, fontSize: 15 }}>数量</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{current.length}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: '#4fc3f7', fontWeight: 600, fontSize: 15 }}>均值</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{avg}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: '#4fc3f7', fontWeight: 600, fontSize: 15 }}>最小值</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{min}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: '#4fc3f7', fontWeight: 600, fontSize: 15 }}>最大值</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{max}</Typography>
                      </Box>
                    </>
                  );
                })()}
              </Box>
            </CardContent>
          </SectionCard>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <SectionCard>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  color: '#e3f2fd',
                  fontWeight: 700,
                }}
              >
                <svg width="24" height="18" viewBox="0 0 24 18" style={{ marginLeft: 8 }} fill="none">
                  <ellipse cx="18" cy="9" rx="3" ry="2.5" fill="#4fc3f7" />
                  <path d="M2 9c3-4 10-7 17-4v8C12 16 5 13 2 9Z" fill="#4fc3f7" fillOpacity="0.7"/>
                  <circle cx="6" cy="9" r="1" fill="#01579b"/>
                </svg>
                鱼类总体信息
              </Typography>
              <Typography sx={{ color: '#b3e5fc', fontSize: 14, mb: 2 }}>
                展示当前水体内鱼类的整体分布与健康状况。
              </Typography>
              {/* 品种分布饼图 */}
              <Box sx={{ width: '100%', height: 180, mb: 2 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#4fc3f7"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {/* 平均值柱状图 */}
              <Box sx={{ width: '100%', height: 120 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { name: '体重', value: (fishData.reduce((a, f) => a + f.weight, 0) / fishData.length).toFixed(2) },
                      { name: '体长', value: (fishData.reduce((a, f) => a + f.length, 0) / fishData.length).toFixed(2) },
                      { name: '高度', value: (fishData.reduce((a, f) => a + f.height, 0) / fishData.length).toFixed(2) },
                      { name: '宽度', value: (fishData.reduce((a, f) => a + f.width, 0) / fishData.length).toFixed(2) },
                    ]}
                  >
                    <XAxis dataKey="name" stroke="#b3e5fc" />
                    <YAxis stroke="#b3e5fc" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0288d1" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  color: '#e3f2fd',
                  fontWeight: 700,
                }}
              >
                <svg width="24" height="18" viewBox="0 0 24 18" style={{ marginLeft: 8 }} fill="none">
                  <ellipse cx="18" cy="9" rx="3" ry="2.5" fill="#4fc3f7" />
                  <path d="M2 9c3-4 10-7 17-4v8C12 16 5 13 2 9Z" fill="#4fc3f7" fillOpacity="0.7"/>
                  <circle cx="6" cy="9" r="1" fill="#01579b"/>
                </svg>
                种群数量变化
              </Typography>
              <Typography sx={{ color: '#e3f2fd', fontSize: 14, mb: 1 }}>
                可查看不同鱼类在一段时间内的数量变化趋势。
              </Typography>
              {/* 选择鱼类 */}
              <FormControl size="small" sx={{ minWidth: 120, mb: 2, background: 'rgba(33,150,243,0.10)', borderRadius: 1 }}>
                <InputLabel sx={{ color: '#4fc3f7' }}>鱼种</InputLabel>
                <Select
                  value={selectedSpecies}
                  label="鱼种"
                  onChange={e => setSelectedSpecies(e.target.value)}
                  sx={{
                    color: '#e3f2fd',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#4fc3f7' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0288d1' },
                    '.MuiSvgIcon-root': { color: '#4fc3f7' }
                  }}
                >
                  {Array.from(new Set(fishData.map(f => f.species))).map(sp =>
                    <MenuItem key={sp} value={sp}>{sp}</MenuItem>
                  )}
                </Select>
              </FormControl>
              {/* 模拟时间序列数据 */}
              <ChartBox>
                <ResponsiveContainer>
                  <LineChart
                    data={[
                      { date: '1月', value: Math.floor(Math.random() * 10 + 10) },
                      { date: '2月', value: Math.floor(Math.random() * 10 + 12) },
                      { date: '3月', value: Math.floor(Math.random() * 10 + 14) },
                      { date: '4月', value: Math.floor(Math.random() * 10 + 13) },
                      { date: '5月', value: Math.floor(Math.random() * 10 + 15) },
                      { date: '6月', value: Math.floor(Math.random() * 10 + 16) },
                    ]}
                  >
                    <XAxis dataKey="date" stroke="#b3e5fc" />
                    <YAxis stroke="#b3e5fc" />
                    <Tooltip
                      contentStyle={{ background: "rgba(2,119,189,0.8)", border: "none", color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#4fc3f7" strokeWidth={3} dot={{ r: 5, fill: "#0288d1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
            </CardContent>
          </SectionCard>
        </Grid>

        {/* 第二行：左-中-右 */}
        <Grid item xs={12} md={4}>
          <SectionCard>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  color: '#e3f2fd', // 更亮的字体色
                  fontWeight: 700,
                }}
              >
                <span style={{ marginRight: 8 }}>水质雷达图</span>
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                  <path d="M0 6 Q8 0 16 6 T32 6" stroke="#4fc3f7" strokeWidth="2" fill="none" />
                </svg>
                <svg width="20" height="20" style={{ marginLeft: 8 }} viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="15" rx="6" ry="3" fill="#4fc3f7" fillOpacity="0.3"/>
                  <path d="M10 2 C13 7, 16 11, 10 18 C4 11, 7 7, 10 2 Z" fill="#4fc3f7" fillOpacity="0.7"/>
                </svg>
              </Typography>
              <Typography sx={{ color: '#e3f2fd', fontSize: 14, mb: 1 }}>
                展示当前水体各项关键指标的综合表现，帮助快速判断水质健康状况。
              </Typography>
              <ChartBox>
                <ResponsiveContainer>
                  <RadarChart data={waterQualityData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="label" stroke="#e3f2fd" fontSize={12} />
                    <PolarRadiusAxis stroke="#b3e5fc" tick={{ fill: "#b3e5fc", fontSize: 12 }} />
                    <Radar dataKey="value" stroke="#4fc3f7" fill="#0288d1" fillOpacity={0.5} />
                    <Tooltip
                      contentStyle={{ background: "rgba(2,119,189,0.8)", border: "none", color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartBox>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: '#b3e5fc', fontWeight: 500, fontSize: 15, mb: 1 }}>
                  当前各项指标：
                </Typography>
                <Grid container spacing={1}>
                  {waterQualityData.map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(33,150,243,0.15)',
                        borderRadius: '8px',
                        px: 1,
                        py: 0.5,
                        mb: 0.5,
                      }}>
                        <span style={{ color: '#4fc3f7', fontWeight: 600, marginRight: 6 }}>{item.label}：</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{item.value}</span>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  color: '#e3f2fd',
                  fontWeight: 700,
                }}
              >
                <span style={{ marginRight: 8 }}>水质指标变化</span>
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                  <path d="M0 6 Q8 0 16 6 T32 6" stroke="#4fc3f7" strokeWidth="2" fill="none" />
                </svg>
              </Typography>
              <Typography sx={{ color: '#e3f2fd', fontSize: 14, mb: 1 }}>
                选择指标，查看其随时间的变化趋势，并对照水质标准分级。
              </Typography>
              {/* 指标选择按钮组 */}
              <ButtonGroup size="small" sx={{ mb: 2 }}>
                {waterQualityData.map((item, idx) => (
                  <Button
                    key={item.label}
                    variant={selectedWqMetric === item.label ? "contained" : "outlined"}
                    onClick={() => setSelectedWqMetric(item.label)}
                    sx={{
                      color: selectedWqMetric === item.label ? '#fff' : '#4fc3f7',
                      background: selectedWqMetric === item.label ? 'linear-gradient(90deg,#0288d1,#4fc3f7)' : 'none',
                      borderColor: '#4fc3f7'
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </ButtonGroup>
              <ChartBox>
                <ResponsiveContainer>
                  <LineChart
                    data={[
                      // 模拟数据，实际应为后端返回的历史数据
                      { date: '1月', value: 7.2 },
                      { date: '2月', value: 7.4 },
                      { date: '3月', value: 7.1 },
                      { date: '4月', value: 7.5 },
                      { date: '5月', value: 7.3 },
                      { date: '6月', value: 7.6 },
                    ]}
                  >
                    <XAxis dataKey="date" stroke="#b3e5fc" />
                    <YAxis stroke="#b3e5fc" />
                    <Tooltip
                      contentStyle={{ background: "rgba(2,119,189,0.8)", border: "none", color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    {/* 标准范围区域/线条示例：以pH为例 */}
                    {selectedWqMetric === 'pH' && (
                      <>
                        {/* I类标准范围 */}
                        <ReferenceArea y1={6.5} y2={8.5} strokeOpacity={0.1} fill="#81d4fa" fillOpacity={0.18} />
                        {/* II类标准范围 */}
                        <ReferenceArea y1={6.0} y2={9.0} strokeOpacity={0.1} fill="#4fc3f7" fillOpacity={0.12} />
                        {/* III类标准范围 */}
                        <ReferenceArea y1={5.5} y2={9.5} strokeOpacity={0.1} fill="#0288d1" fillOpacity={0.08} />
                        {/* 标准线 */}
                        <ReferenceLine y={6.5} stroke="#81d4fa" strokeDasharray="3 3" />
                        <ReferenceLine y={8.5} stroke="#81d4fa" strokeDasharray="3 3" />
                      </>
                    )}
                    {/* 你可以为其他指标设置不同的标准范围 */}
                    <Line type="monotone" dataKey="value" stroke="#4fc3f7" strokeWidth={3} dot={{ r: 5, fill: "#0288d1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: '#b3e5fc', fontWeight: 500, fontSize: 15, mb: 1 }}>
                  指标标准说明：
                </Typography>
                {selectedWqMetric === 'pH' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：6.5~8.5</li>
                    <li>II类：6.0~9.0</li>
                    <li>III类：5.5~9.5</li>
                  </ul>
                )}
                {selectedWqMetric === '水温' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：0~30℃</li>
                    <li>II类：0~32℃</li>
                    <li>III类：0~35℃</li>
                  </ul>
                )}
                {selectedWqMetric === '溶解氧' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：≥7.5 mg/L</li>
                    <li>II类：≥6 mg/L</li>
                    <li>III类：≥5 mg/L</li>
                  </ul>
                )}
                {selectedWqMetric === '电导率' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：≤300 μS/cm</li>
                    <li>II类：≤500 μS/cm</li>
                    <li>III类：≤1000 μS/cm</li>
                  </ul>
                )}
                {selectedWqMetric === '浊度' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：≤1 NTU</li>
                    <li>II类：≤3 NTU</li>
                    <li>III类：≤10 NTU</li>
                  </ul>
                )}
                {selectedWqMetric === '高锰酸盐指数' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：≤2 mg/L</li>
                    <li>II类：≤4 mg/L</li>
                    <li>III类：≤6 mg/L</li>
                  </ul>
                )}
                {selectedWqMetric === '氨氮' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：≤0.15 mg/L</li>
                    <li>II类：≤0.5 mg/L</li>
                    <li>III类：≤1.0 mg/L</li>
                  </ul>
                )}
                {selectedWqMetric === '总磷' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：≤0.02 mg/L</li>
                    <li>II类：≤0.1 mg/L</li>
                    <li>III类：≤0.2 mg/L</li>
                  </ul>
                )}
                {selectedWqMetric === '总氮' && (
                  <ul style={{ color: '#e3f2fd', fontSize: 13, margin: 0, paddingLeft: 18 }}>
                    <li>I类：≤0.2 mg/L</li>
                    <li>II类：≤0.5 mg/L</li>
                    <li>III类：≤1.0 mg/L</li>
                  </ul>
                )}
              </Box>
            </CardContent>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  color: '#e3f2fd',
                  fontWeight: 700,
                }}
              >
                <span style={{ marginRight: 8 }}>环境评分</span>
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                  <path d="M0 6 Q8 0 16 6 T32 6" stroke="#4fc3f7" strokeWidth="2" fill="none" />
                </svg>
                <svg width="20" height="20" style={{ marginLeft: 8 }} viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="15" rx="6" ry="3" fill="#4fc3f7" fillOpacity="0.3"/>
                  <path d="M10 2 C13 7, 16 11, 10 18 C4 11, 7 7, 10 2 Z" fill="#4fc3f7" fillOpacity="0.7"/>
                </svg>
              </Typography>
              <Typography sx={{ color: '#e3f2fd', fontSize: 14, mb: 1 }}>
                展示环境评分随时间的变化趋势，便于动态监控水体健康状况。
              </Typography>
              <ChartBox>
                <ResponsiveContainer>
                  <LineChart
                    data={[
                      { date: '1月', score: 7.8 },
                      { date: '2月', score: 8.1 },
                      { date: '3月', score: 7.5 },
                      { date: '4月', score: 8.3 },
                      { date: '5月', score: 8.0 },
                      { date: '6月', score: 8.5 },
                    ]}
                  >
                    <XAxis dataKey="date" stroke="#b3e5fc" />
                    <YAxis stroke="#b3e5fc" domain={[6, 10]} />
                    <Tooltip
                      contentStyle={{ background: "rgba(2,119,189,0.8)", border: "none", color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#4fc3f7" strokeWidth={3} dot={{ r: 5, fill: "#0288d1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography sx={{ color: '#b3e5fc', fontWeight: 500, fontSize: 15 }}>
                  当前综合评分：<span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{score}</span>
                </Typography>
              </Box>
            </CardContent>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
};

export default UnderWaterSystem;
