import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, Button, message, Select } from 'antd';
import { InboxOutlined, CloudOutlined } from '@ant-design/icons';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 64px);
  padding: 20px;
  background: #f0f2f5;
`;

// ==========智能问答区域 ==========
const ChatSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 8px;
  border: 1px solid #e8e8e8;
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
`;

// ========== 图片识别区域 ==========
const ImageSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  margin: 16px 0;
  border: 2px dashed #e8e8e8;
`;

const ResultBox = styled.div`
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  min-height: 100px;
`;

// ========== 天气区域 ==========
const WeatherSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
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
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #333;
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

  // 自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ========== 聊天功能处理 ==========
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // 添加用户消息
    setMessages(prev => [...prev, {
      content: inputMessage,
      isAssistant: false
    }]);

    try {
      // 发送到后端API（示例）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();
      
      // 添加助手回复
      setMessages(prev => [...prev, {
        content: data.reply,
        isAssistant: true
      }]);
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
      // 发送到图像识别API（示例）
      const response = await fetch('/api/image-recognition', {
        method: 'POST',
        body: JSON.stringify({ image: previewImage })
      });

      const data = await response.json();
      setRecognitionResult(data.result);
    } catch (error) {
      message.error('识别失败');
    }
  };

  // ========== 天气功能处理 ==========
  const getLocation = () => {
    if (!navigator.geolocation) {
      message.error('浏览器不支持定位功能');
      return;
    }

    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // 使用逆地理编码获取城市名称
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`
          );
          const data = await response.json();
          const city = data.results[0].components.city;
          setSelectedCity(city);
          fetchWeather(city);
        } catch (error) {
          message.error('获取位置失败');
        } finally {
          setLoadingWeather(false);
        }
      },
      (error) => {
        message.error('获取位置失败');
        setLoadingWeather(false);
      }
    );
  };

  const fetchWeather = async (city: string) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=${city}`
      );
      const data = await response.json();
      setWeatherData(data.current);
    } catch (error) {
      message.error('获取天气失败');
    }
  };

  const generateWeatherAlert = () => {
    if (!weatherData) return null;
    
    if (weatherData.temp_c > 35) {
      return '高温警告：请注意防暑降温';
    }
    if (weatherData.precip_mm > 10) {
      return '暴雨警告：请注意航行安全';
    }
    return '天气条件适宜海洋作业';
  };

  return (
    <Container>
      {/* 左侧聊天区域 */}
      <ChatSection>
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

      {/* 中间图像识别区域 */}
      <ImageSection>
        <Upload.Dragger
          accept="image/*"
          beforeUpload={beforeUpload}
          customRequest={({ file }) => handleImageUpload(file as File)}
          showUploadList={false}
        >
          <p><InboxOutlined style={{ fontSize: 24 }} /></p>
          <p>点击或拖拽图片到此区域</p>
        </Upload.Dragger>

        {previewImage && <PreviewImage src={previewImage} />}

        <Button
          type="primary"
          onClick={handleRecognition}
          disabled={!previewImage}
        >
          开始识别
        </Button>

        <ResultBox>
          {recognitionResult || '识别结果将显示在此处'}
        </ResultBox>
      </ImageSection>

      {/* 右侧天气区域 */}
      <WeatherSection>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            icon={<CloudOutlined />}
            loading={loadingWeather}
            onClick={getLocation}
          >
            获取当前位置天气
          </Button>
          <Select
            style={{ width: 120 }}
            onChange={(value) => {
              setSelectedCity(value);
              fetchWeather(value);
            }}
            options={[
              { value: 'shanghai', label: '上海' },
              { value: 'sanya', label: '三亚' },
              { value: 'qingdao', label: '青岛' }
            ]}
          />
        </div>

        {weatherData && (
          <>
            <WeatherCard>
              <h3>{selectedCity}天气</h3>
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
    </Container>
  );
};

export default IntelligentCenter;