# Ocean Farm Visualization System

智能海洋养殖可视化监控系统

## 项目结构

```
ocean-farm-viz/
├── client/          # 前端React应用
├── server/          # 后端Flask服务
├── script/          # 数据处理脚本
├── .gitignore      # Git忽略文件
└── README.md        # 项目说明文档
```

## 功能特性

- 实时监控海洋养殖环境数据
- 用户认证和权限管理
- 数据可视化和分析
- 智能预警系统
- 水质监测和分析

## 安装说明

### 后端服务器

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 前端应用

```bash
cd client
npm install
npm start
```

## 技术栈

- 前端：React, TypeScript, Material-UI
- 后端：Python, Flask, MySQL
- 数据处理：Pandas, NumPy

## 开发团队

- 后端开发：[Your Name]
- 前端开发：[Your Name]
- 数据分析：[Your Name]