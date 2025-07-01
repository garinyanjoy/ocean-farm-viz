# 智能海洋养殖可视化监控系统配置与运行说明

## 项目概述
智能海洋养殖可视化监控系统是一个集成了实时监控、数据分析和可视化的综合平台，旨在为海洋养殖提供智能化的监控和管理解决方案。

## 系统要求
- Windows 10+
- Node.js 14+
- Python 3.8+
- SQLite (项目将自动创建数据库文件)

## 项目结构
项目分为前端(client)和后端(server)两部分：
- 前端：基于React、TypeScript和Material-UI
- 后端：基于Flask、SQLAlchemy

## 配置步骤

### 1. 数据库配置
项目已配置为使用SQLite，无需额外安装和配置数据库服务。首次运行后端服务时，将在 `server/instance/` 目录下自动创建 `ocean-monitor.db` 数据库文件。

### 2. 后端配置
1. 进入server目录，创建并激活虚拟环境
   ```
   cd server
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   ```

2. 安装依赖
   ```
   pip install -r requirements.txt
   ```

3. 启动后端服务
   ```
   python app.py
   ```
   服务启动后，将自动创建数据库并添加默认用户。

### 3. 前端配置
1. 进入client目录
   ```
   cd client
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 启动开发服务器
   ```
   npm start
   ```

## 系统访问
- 前端地址：http://localhost:3000
- 后端API地址：http://localhost:5000

## 默认账号
- 管理员：
  - 用户名：admin
  - 密码：admin123
- 普通用户：
  - 用户名：user
  - 密码：user123

## 常见问题排查
1. 数据库连接问题：
   - 确保 `server/instance` 目录有写入权限。
   - 如果遇到问题，可尝试删除 `ocean-monitor.db` 文件后重启后端服务。

2. 后端依赖安装问题：
   - 如遇到网络问题，可尝试更换PyPI源：
     ```