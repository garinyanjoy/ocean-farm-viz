import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { oceanTheme } from '../styles/oceanTheme';
import ShanghaiWaterMap from '../components/ShanghaiWaterMap';

interface FishData {
  id?: number;
  species: string;
  weight: number;
  length1: number;
  length2: number;
  length3: number;
  height: number;
  width: number;
}

interface HydroData {
  id?: number;
  location: string;
  basin: string;
  section_name: string;
  date: string;
  water_temperature: number;
  pH: number;
  dissolved_oxygen: number;
  conductivity: number;
  turbidity: number;
  permanganate_index: number;
  ammonia_nitrogen: number;
  total_phosphorus: number;
  total_nitrogen: number;
  site_condition: string;
}

const DataCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fish' | 'water' | 'map'>('map');
  const [fishData, setFishData] = useState<FishData[]>([]);
  const [hydroData, setHydroData] = useState<HydroData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState<any>({});

  // 获取鱼类数据
  const fetchFishData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/fish');
      const data = await response.json();
      setFishData(data);
    } catch (error) {
      console.error('获取鱼类数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取水质数据
  const fetchHydroData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/hydrodata');
      const data = await response.json();
      setHydroData(data);
    } catch (error) {
      console.error('获取水质数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFishData();
    fetchHydroData();
  }, []);

  // 删除数据
  const handleDelete = async (id: number, type: 'fish' | 'water') => {
    if (!window.confirm('确定要删除这条数据吗？')) return;
    
    try {
      const endpoint = type === 'fish' ? `fish/${id}` : `hydrodata/${id}`;
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (type === 'fish') {
          fetchFishData();
        } else {
          fetchHydroData();
        }
        alert('删除成功！');
      } else {
        alert('删除失败！');
      }
    } catch (error) {
      console.error('删除数据失败:', error);
      alert('删除失败！');
    }
  };

  // 添加数据
  const handleAdd = async () => {
    try {
      const endpoint = activeTab === 'fish' ? 'fish' : 'hydrodata';
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewData({});
        if (activeTab === 'fish') {
          fetchFishData();
        } else {
          fetchHydroData();
        }
        alert('添加成功！');
      } else {
        alert('添加失败！');
      }
    } catch (error) {
      console.error('添加数据失败:', error);
      alert('添加失败！');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const endpoint = activeTab === 'fish' ? 'fish/export' : 'hydrodata/export';
      const response = await fetch(`http://localhost:5000/api/${endpoint}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = activeTab === 'fish' ? 'fish_data.csv' : 'water_quality_data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('导出失败！');
      }
    } catch (error) {
      console.error('导出数据失败:', error);
      alert('导出失败！');
    }
  };

  // 上传数据
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const dataType = activeTab === 'fish' ? 'fish' : 'hydrodata';
      const response = await fetch(`http://localhost:5000/api/upload/${dataType}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        if (activeTab === 'fish') {
          fetchFishData();
        } else {
          fetchHydroData();
        }
      } else {
        alert(result.error || '上传失败！');
      }
    } catch (error) {
      console.error('上传数据失败:', error);
      alert('上传失败！');
    }

    // 清空输入框
    event.target.value = '';
  };

  const renderFishTable = () => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <Th>物种</Th>
            <Th>重量(g)</Th>
            <Th>长度1(cm)</Th>
            <Th>长度2(cm)</Th>
            <Th>长度3(cm)</Th>
            <Th>高度(cm)</Th>
            <Th>宽度(cm)</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody>
          {fishData.map((fish) => (
            <tr key={fish.id}>
              <Td>{fish.species}</Td>
              <Td>{fish.weight}</Td>
              <Td>{fish.length1}</Td>
              <Td>{fish.length2}</Td>
              <Td>{fish.length3}</Td>
              <Td>{fish.height}</Td>
              <Td>{fish.width}</Td>
              <Td>
                <DeleteBtn onClick={() => handleDelete(fish.id!, 'fish')}>
                  删除
                </DeleteBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );

  const renderWaterTable = () => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <Th>位置</Th>
            <Th>流域</Th>
            <Th>断面名称</Th>
            <Th>日期</Th>
            <Th>水温(°C)</Th>
            <Th>pH</Th>
            <Th>溶解氧</Th>
            <Th>电导率</Th>
            <Th>浊度</Th>
            <Th>高锰酸盐指数</Th>
            <Th>氨氮</Th>
            <Th>总磷</Th>
            <Th>总氮</Th>
            <Th>现场情况</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody>
          {hydroData.slice(0, 100).map((hydro) => (
            <tr key={hydro.id}>
              <Td>{hydro.location}</Td>
              <Td>{hydro.basin}</Td>
              <Td>{hydro.section_name}</Td>
              <Td>{hydro.date}</Td>
              <Td>{hydro.water_temperature}</Td>
              <Td>{hydro.pH}</Td>
              <Td>{hydro.dissolved_oxygen}</Td>
              <Td>{hydro.conductivity}</Td>
              <Td>{hydro.turbidity}</Td>
              <Td>{hydro.permanganate_index}</Td>
              <Td>{hydro.ammonia_nitrogen}</Td>
              <Td>{hydro.total_phosphorus}</Td>
              <Td>{hydro.total_nitrogen}</Td>
              <Td>{hydro.site_condition}</Td>
              <Td>
                <DeleteBtn onClick={() => handleDelete(hydro.id!, 'water')}>
                  删除
                </DeleteBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );

  const renderAddModal = () => {
    if (!showAddModal) return null;

    const fishFields = [
      { key: 'species', label: '物种', type: 'text' },
      { key: 'weight', label: '重量(g)', type: 'number' },
      { key: 'length1', label: '长度1(cm)', type: 'number' },
      { key: 'length2', label: '长度2(cm)', type: 'number' },
      { key: 'length3', label: '长度3(cm)', type: 'number' },
      { key: 'height', label: '高度(cm)', type: 'number' },
      { key: 'width', label: '宽度(cm)', type: 'number' },
    ];

    const waterFields = [
      { key: 'location', label: '位置', type: 'text' },
      { key: 'basin', label: '流域', type: 'text' },
      { key: 'section_name', label: '断面名称', type: 'text' },
      { key: 'date', label: '日期', type: 'date' },
      { key: 'water_temperature', label: '水温(°C)', type: 'number' },
      { key: 'pH', label: 'pH', type: 'number' },
      { key: 'dissolved_oxygen', label: '溶解氧', type: 'number' },
      { key: 'conductivity', label: '电导率', type: 'number' },
      { key: 'turbidity', label: '浊度', type: 'number' },
      { key: 'permanganate_index', label: '高锰酸盐指数', type: 'number' },
      { key: 'ammonia_nitrogen', label: '氨氮', type: 'number' },
      { key: 'total_phosphorus', label: '总磷', type: 'number' },
      { key: 'total_nitrogen', label: '总氮', type: 'number' },
      { key: 'site_condition', label: '现场情况', type: 'text' },
    ];

    const fields = activeTab === 'fish' ? fishFields : waterFields;

    return (
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <h3>添加{activeTab === 'fish' ? '鱼类' : '水质'}数据</h3>
            <CloseBtn onClick={() => setShowAddModal(false)}>×</CloseBtn>
          </ModalHeader>
          <ModalBody>
            {fields.map((field) => (
              <FormGroup key={field.key}>
                <FormLabel>{field.label}:</FormLabel>
                <FormInput
                  type={field.type}
                  value={newData[field.key] || ''}
                  onChange={(e) =>
                    setNewData({ ...newData, [field.key]: e.target.value })
                  }
                />
              </FormGroup>
            ))}
          </ModalBody>
          <ModalFooter>
            <CancelBtn onClick={() => setShowAddModal(false)}>取消</CancelBtn>
            <ModalButton onClick={handleAdd}>确认添加</ModalButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    );
  };

  return (
    <Container>
      <Header>数据中心</Header>
        <TabContainer>
        <Tab 
          active={activeTab === 'map'} 
          onClick={() => setActiveTab('map')}
        >
          上海水质地图
        </Tab>
          <Tab
            active={activeTab === 'fish'}
            onClick={() => setActiveTab('fish')}
          >
            鱼类数据
          </Tab>
          <Tab
            active={activeTab === 'water'}
            onClick={() => setActiveTab('water')}
          >
            水质数据
          </Tab>
        </TabContainer>
      
      {activeTab === 'map' && (
        <MapContainer>
          <ShanghaiWaterMap hydroData={hydroData.filter(data => data.location === '上海')} />
        </MapContainer>
      )}
      
      {activeTab === 'fish' && (
        <Content>
      <ToolBar>
            <Button onClick={() => setShowAddModal(true)}>添加数据</Button>
            <Button onClick={handleExport}>导出数据</Button>
            <UploadButton>
              上传CSV
              <input type="file" accept=".csv" onChange={handleUpload} />
            </UploadButton>
      </ToolBar>
          {loading ? <LoadingText>加载中...</LoadingText> : renderFishTable()}
        </Content>
      )}

      {activeTab === 'water' && (
      <Content>
          <ToolBar>
            <Button onClick={() => setShowAddModal(true)}>添加数据</Button>
            <Button onClick={handleExport}>导出数据</Button>
            <UploadButton>
              上传CSV
              <input type="file" accept=".csv" onChange={handleUpload} />
            </UploadButton>
          </ToolBar>
          {loading ? <LoadingText>加载中...</LoadingText> : renderWaterTable()}
      </Content>
      )}
      
      {showAddModal && renderAddModal()}
    </Container>
  );
};

// Styled components
const Container = styled.div`
  padding: 20px;
  max-width: 100%;
  overflow-x: auto;
`;

const Header = styled.h1`
  color: ${oceanTheme.deepBlue};
  margin-bottom: 20px;
  text-align: center;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  color: ${props => props.active ? oceanTheme.primary : '#666'};
  border-bottom: ${props => props.active ? `2px solid ${oceanTheme.primary}` : 'none'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.3s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MapContainer = styled.div`
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
`;

const Content = styled.div`
  margin-top: 20px;
`;

const ToolBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: ${oceanTheme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${oceanTheme.deepBlue};
  }
`;

const UploadButton = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background-color: ${oceanTheme.secondary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
  
  input[type='file'] {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  &:hover {
    background-color: ${oceanTheme.deepBlue};
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  padding: 20px;
`;

const TableContainer = styled.div`
  max-height: 600px;
  overflow: auto;
  border-radius: 10px;
  border: 1px solid #e1e8ed;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: linear-gradient(45deg, ${oceanTheme.primary}, ${oceanTheme.secondary});
  color: white;
  padding: 15px 10px;
  text-align: left;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

const Td = styled.td`
  padding: 12px 10px;
  border-bottom: 1px solid #e1e8ed;
  background: white;
  transition: background-color 0.2s ease;

  tr:hover & {
    background: rgba(0, 123, 191, 0.05);
  }
`;

const DeleteBtn = styled.button`
  display: inline-block;
  padding: 8px 16px;
  background-color: ${oceanTheme.coral};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  margin-left: 10px;

  &:hover {
    background-color: #d32f2f;
  }
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
  background: linear-gradient(45deg, ${oceanTheme.primary}, ${oceanTheme.secondary});
  color: white;
  border-radius: 20px 20px 0 0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 30px;
  max-height: 400px;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
  color: ${oceanTheme.deepBlue};
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: ${oceanTheme.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 191, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid #e1e8ed;
  background: #f8f9fa;
  border-radius: 0 0 20px 20px;
`;

const CancelBtn = styled.button`
  padding: 12px 25px;
  border: 2px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #6c757d;
    color: white;
  }
`;

const ModalButton = styled.button`
  font-size: 16px;
  font-weight: 500;
  padding: 12px 25px;
  border: none;
  background: linear-gradient(45deg, ${oceanTheme.primary}, ${oceanTheme.secondary});
  color: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${oceanTheme.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 191, 0.1);
  }
`;

export default DataCenter;
