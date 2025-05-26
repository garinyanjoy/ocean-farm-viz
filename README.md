# 智能海洋养殖可视化监控系统 (Ocean Farm Visualization System)

## 项目简介
智能海洋养殖可视化监控系统是一个集成了实时监控、数据分析和可视化的综合平台，旨在为海洋养殖提供智能化的监控和管理解决方案。

## 技术栈
### 前端
- React
- TypeScript
- Material-UI
- ECharts（数据可视化）

### 后端
- Python 3.8+
- Flask
- SQLAlchemy
- MySQL

### 数据处理
- Pandas
- NumPy

## 项目结构
```
ocean-farm-viz/
├── client/          # 前端React应用
│   ├── src/         # 源代码
│   ├── public/      # 静态资源
│   └── package.json # 依赖配置
├── server/          # 后端Flask服务
│   ├── app.py       # 主应用入口
│   ├── database.py  # 数据库模型
│   └── utils/       # 工具函数
└── script/          # 数据处理脚本
    └── data_process/ # 数据预处理脚本
```

## 核心功能
1. 实时监控
   - 水质参数监测（温度、pH值、溶解氧等）
   - 鱼类活动监测
   - 环境数据采集

2. 数据可视化
   - 实时数据图表展示
   - 历史数据趋势分析
   - 多维数据对比分析

3. 智能预警
   - 异常数据检测
   - 预警信息推送
   - 风险评估报告

4. 用户管理
   - 多角色权限控制
   - 用户操作日志
   - 安全认证机制

## 安装部署

### 环境要求
- Python 3.8+
- Node.js 14+
- MySQL 5.7+

### 后端部署
```bash
# 进入后端目录
cd server

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# 安装依赖
pip install flask flask-cors sqlalchemy pymysql pandas

# 启动服务
python app.py
```

### 前端部署
```bash
# 进入前端目录
cd client

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 数据库配置
```python
# 数据库连接配置（server/app.py）
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'your_password')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'ocean-monitor')
```

## 使用说明
1. 系统登录
   - 管理员账户：默认用户名 admin
   - 普通用户：需要管理员创建账户

2. 数据监控
   - 实时数据展示在仪表盘
   - 可选择不同时间范围查看历史数据
   - 支持数据导出功能

3. 系统配置
   - 预警阈值设置
   - 监控参数配置
   - 用户权限管理

## 开发团队
- 后端开发：[开发者姓名]
- 前端开发：[开发者姓名]
- 数据分析：[开发者姓名]

## 版本历史
- v1.0.0 (2024-03) - 初始版本发布
  - 基础监控功能
  - 用户管理系统
  - 数据可视化模块

## 许可证
MIT License