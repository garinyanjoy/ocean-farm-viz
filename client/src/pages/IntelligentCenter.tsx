import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, Button, message, Input, Select } from 'antd';
import { InboxOutlined, EnvironmentOutlined, BugOutlined  } from '@ant-design/icons';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
  height: calc(100vh - 160px);
  padding: 0px;
  background: rgb(255, 255, 255);
`;

// ========== 通用样式 ==========
const SectionBase = styled.div`
  background: rgb(255, 255, 255);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.h2`
  text-align: center;
  margin: 0 0 16px 0;
  color: #1890ff;
`;

// ========== 智能问答区域 ==========
const ChatSection = styled(SectionBase)``;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 8px;
  border: 1px solid rgb(79, 128, 202);
  border-radius: 4px;
`;

const MessageBubble = styled.div<{ $isAssistant: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  margin: 8px;
  border-radius: ${props =>
    props.$isAssistant ? '12px 12px 12px 0' : '12px 12px 0 12px'};
  background: ${props =>
    props.$isAssistant ? '#f5f5f5' : '#1890ff'};
  color: ${props =>
    props.$isAssistant ? '#333' : 'white'};
  align-self: ${props =>
    props.$isAssistant ? 'flex-start' : 'flex-end'};
`;

const ChatInputArea = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 8px;
    border: 1px solid rgb(47, 121, 168);
    border-radius: 4px;
  }
`;

// ========== 图片识别区域 ==========
const ImageSection = styled(SectionBase)``;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  margin: 16px 0;
  border: 2px dashed #e8e8e8;
`;

const ResultBox = styled.div`
  width: 100%;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
  min-height: 80px;
  margin-top: 16px;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

// ========== 天气区域 ==========
const WeatherSection = styled(SectionBase)``;

const WeatherInputArea = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const WeatherCard = styled.div`
  padding: 16px;
  background: #1890ff;
  border-radius: 8px;
  color: white;
  text-align: center;
  margin: 16px 0;
`;

const AlertBox = styled.div`
  padding: 12px;
  background: rgb(233, 239, 128);
  border: 1px solid rgb(71, 19, 126);
  border-radius: 4px;
  color: #333;
`;

// ========== 鱼类预测区域 ==========
const FishSection = styled(SectionBase)``;

const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
    color: #333;
  }
`;

const PredictionResult = styled.div`
  background: #f0f8ff;
  border: 1px solid #1890ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const PredictionItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
`;

const ConfidenceBar = styled.div<{ confidence: number }>`
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  margin-top: 4px;

  &::after {
    content: '';
    display: block;
    width: ${props => props.confidence}%;
    height: 100%;
    background: ${props =>
      props.confidence > 80 ? '#52c41a' :
      props.confidence > 60 ? '#faad14' : '#ff4d4f'};
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

const IntelligentCenter: React.FC = () => {
  // ========== 聊天状态 ==========
  const [messages, setMessages] = useState<Array<{
    content: string;
    isAssistant: boolean;
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ========== 图像识别状态 ==========
  const [previewImage, setPreviewImage] = useState<string>();
  const [recognitionResult, setRecognitionResult] = useState('');

  // ========== 天气状态 ==========
  const [selectedCity, setSelectedCity] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // ========== 鱼类预测状态 ==========
  const [fishSpecies, setFishSpecies] = useState<Array<{
    name: string;
    count: number;
    predictable: boolean;
  }>>([]);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [fishHeight, setFishHeight] = useState('');
  const [fishWidth, setFishWidth] = useState('');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // 自动触发定位
    handleGetLocation();
    // 加载鱼类品种数据
    loadFishSpecies();
  }, []);

  // ========== 鱼类预测功能 ==========
  const loadFishSpecies = async () => {
    try {
      const response = await fetch('/api/fish/species');
      const data = await response.json();
      if (data.species) {
        setFishSpecies(data.species);
      }
    } catch (error) {
      message.error('加载鱼类品种失败');
    }
  };

  const handleFishPrediction = async () => {
    if (!selectedSpecies || !fishHeight || !fishWidth) {
      message.error('请填写完整的预测信息');
      return;
    }

    const height = parseFloat(fishHeight);
    const width = parseFloat(fishWidth);

    if (isNaN(height) || isNaN(width) || height <= 0 || width <= 0) {
      message.error('请输入有效的数值');
      return;
    }

    setPredicting(true);
    try {
      const response = await fetch('/api/fish/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          species: selectedSpecies,
          height: height,
          width: width
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '预测失败');
      }

      setPredictionResult(data);
      message.success('预测完成！');
    } catch (error: any) {
      message.error(error.message || '预测失败');
      setPredictionResult(null);
    } finally {
      setPredicting(false);
    }
  };

  // ========== 聊天功能处理 ==========
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, {
      content: inputMessage,
      isAssistant: false
    }]);

    try {
      const response = await fetch('/intelligent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          message: inputMessage
        })
      });

      const data = await response.json();

      if (data.type === 'chat') {
        setMessages(prev => [...prev, {
          content: data.reply,
          isAssistant: true
        }]);
      }
    } catch (error) {
      message.error('发送消息失败');
    }

    setInputMessage('');
  };

  // ========== 图像识别处理 ==========
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
    }
    return isImage;
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
  };

  const handleRecognition = async () => {
    if (!previewImage) return;

    try {
      const formData = new FormData();
      formData.append('type', 'image');
      formData.append('file', dataURLtoFile(previewImage, 'image.jpg'));

      const response = await fetch('/intelligent', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.type === 'image') {
        setRecognitionResult(data.result);
      }
    } catch (error) {
      message.error('识别失败');
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // ========== 天气功能处理 ==========
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      message.error('浏览器不支持定位功能');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const apiKey = '1ef2b09e54904ea6bf07404436dec7a5';
          const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=${apiKey}`);
          const data = await response.json();
          const city = data.results[0].components.city;
          setSelectedCity(city);
          handleGetWeather(city);
        } catch (error) {
          message.error('获取位置失败');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        message.error('获取位置失败: ' + error.message);
        setGettingLocation(false);
      }
    );
  };

  const handleGetWeather = async (city?: string) => {
    const targetCity = city || selectedCity;
    if (!targetCity.trim()) {
      message.error('请输入城市名称');
      return;
    }

    setLoadingWeather(true);
    try {
      const apiKey = '16c686206982413cb7a51625251605';
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${targetCity}&aqi=no`);
      if (!response.ok) {
        throw new Error('获取天气信息失败');
      }
      const data = await response.json();
      if (data.location && data.current) {
        setWeatherData(data.current);
      }
    } catch (error) {
      message.error('获取天气失败');
    } finally {
      setLoadingWeather(false);
    }
  };

  const generateWeatherAlert = () => {
    if (weatherData.temp_c > 35) {
      return '高温警告：请注意防暑降温';
    }
    if (weatherData.humidity > 80) {
      return '高湿警告：请注意设备防潮';
    }
    if (weatherData.wind_kph > 30) {
      return '大风警告：请注意航行安全';
    }
    return '天气条件适宜海洋作业';
  };

  return (
    <Container>
      {/* 左侧聊天区域 */}
      <ChatSection>
        <SectionHeader>智能问答小助手</SectionHeader>
        <ChatMessages>
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              $isAssistant={msg.isAssistant}
            >
              {msg.content}
            </MessageBubble>
          ))}
          <div ref={chatEndRef} />
        </ChatMessages>

        <ChatInputArea>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="输入消息..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            type="primary"
            onClick={handleSendMessage}
          >
            发送
          </Button>
        </ChatInputArea>
      </ChatSection>

      {/* 图像识别区域 */}
      <ImageSection>
        <SectionHeader>图像识别</SectionHeader>
        <Upload.Dragger
          accept="image/*"
          beforeUpload={beforeUpload}
          customRequest={({ file }) => handleImageUpload(file as File)}
          showUploadList={false}
        >
          <p><InboxOutlined style={{ fontSize: 30 }} /></p>
          <p>点击或拖拽图片到此区域</p>
        </Upload.Dragger>

        {previewImage && <PreviewImage src={previewImage} />}

        <Button
          type="primary"
          onClick={handleRecognition}
          disabled={!previewImage}
          style={{ marginTop: 16 }}
        >
          识别
        </Button>

        <ResultBox>
          {recognitionResult || '识别结果'}
        </ResultBox>
      </ImageSection>

      {/* 天气区域 */}
      <WeatherSection>
        <SectionHeader>天气查询</SectionHeader>
        <WeatherInputArea>
          <Input
            placeholder="输入城市"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            onPressEnter={() => handleGetWeather()}
          />
          <Button
            type="primary"
            onClick={() => handleGetWeather()}
            loading={loadingWeather}
          >
            确定
          </Button>
          <Button
            type="primary"
            icon={<EnvironmentOutlined />}
            onClick={handleGetLocation}
            loading={gettingLocation}
          >
          </Button>
        </WeatherInputArea>

        {weatherData && (
          <>
            <WeatherCard>
              <h3>{selectedCity}</h3>
              <p>温度: {weatherData.temp_c}°C</p>
              <p>湿度: {weatherData.humidity}%</p>
              <p>风速: {weatherData.wind_kph} km/h</p>
              <p>天气状况: {weatherData.condition.text}</p>
            </WeatherCard>

            <AlertBox>
              {generateWeatherAlert()}
            </AlertBox>
          </>
        )}
      </WeatherSection>

      {/* 鱼类体长预测区域 */}
      <FishSection>
        <SectionHeader>
          <BugOutlined  style={{ marginRight: 8 }} />
          鱼类体长预测
        </SectionHeader>

        <FormGroup>
          <label>选择鱼类品种:</label>
          <Select
            placeholder="请选择鱼类品种"
            value={selectedSpecies}
            onChange={setSelectedSpecies}
            style={{ width: '100%' }}
          >
            {fishSpecies.map(species => (
              <Select.Option
                key={species.name}
                value={species.name}
                disabled={!species.predictable}
              >
                {species.name} ({species.count}条数据)
                {!species.predictable && ' - 数据不足'}
              </Select.Option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <label>高度 (cm):</label>
          <Input
            type="number"
            placeholder="请输入鱼的高度"
            value={fishHeight}
            onChange={(e) => setFishHeight(e.target.value)}
            min="0"
            step="0.1"
          />
        </FormGroup>

        <FormGroup>
          <label>宽度 (cm):</label>
          <Input
            type="number"
            placeholder="请输入鱼的宽度"
            value={fishWidth}
            onChange={(e) => setFishWidth(e.target.value)}
            min="0"
            step="0.1"
          />
        </FormGroup>

        <Button
          type="primary"
          icon={<BugOutlined  />}
          onClick={handleFishPrediction}
          loading={predicting}
          disabled={!selectedSpecies || !fishHeight || !fishWidth}
          style={{ width: '100%', marginBottom: 16 }}
        >
          开始预测
        </Button>

        {predictionResult && (
          <PredictionResult>
            <h4>预测结果 - {predictionResult.species}</h4>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
              基于 {predictionResult.sample_size} 条历史数据
            </p>

            <PredictionItem>
              <div>
                <strong>体长1 (鼻端→尾鳍起点)</strong>
                <div style={{ fontSize: '20px', color: '#1890ff' }}>
                  {predictionResult.predictions.length1} cm
                </div>
                <ConfidenceBar confidence={predictionResult.confidence.length1} />
                <small>置信度: {predictionResult.confidence.length1}%</small>
              </div>
            </PredictionItem>

            <PredictionItem>
              <div>
                <strong>体长2 (鼻端→尾鳍缺刻)</strong>
                <div style={{ fontSize: '20px', color: '#1890ff' }}>
                  {predictionResult.predictions.length2} cm
                </div>
                <ConfidenceBar confidence={predictionResult.confidence.length2} />
                <small>置信度: {predictionResult.confidence.length2}%</small>
              </div>
            </PredictionItem>

            <PredictionItem>
              <div>
                <strong>体长3 (鼻端→尾鳍末端)</strong>
                <div style={{ fontSize: '20px', color: '#1890ff' }}>
                  {predictionResult.predictions.length3} cm
                </div>
                <ConfidenceBar confidence={predictionResult.confidence.length3} />
                <small>置信度: {predictionResult.confidence.length3}%</small>
              </div>
            </PredictionItem>
          </PredictionResult>
        )}
      </FishSection>
    </Container>
  );
};

export default IntelligentCenter;
