# 智能海洋养殖可视化监控系统配置与运行说明

## 项目概述
智能海洋养殖可视化监控系统是一个集成了实时监控、数据分析和可视化的综合平台，旨在为海洋养殖提供智能化的监控和管理解决方案。

## 系统要求
- Windows 10+
- Node.js 14+
- Python 3.8+
- MySQL 5.7+

## 项目结构
项目分为前端(client)和后端(server)两部分：
- 前端：基于React、TypeScript和Material-UI
- 后端：基于Flask、SQLAlchemy

## 配置步骤

### 1. 数据库配置
1. 安装并启动MySQL服务
2. 创建数据库和表结构
   ```
   mysql -u root -p < create_db.sql
   ```
   - 默认管理员账户：admin
   - 默认密码：admin123

### 2. 后端配置
1. 进入server目录，创建并激活虚拟环境
   ```
   cd server
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   ```

2. 安装依赖
   ```
   pip install flask flask-cors sqlalchemy pymysql pandas flask-sqlalchemy scikit-learn numpy
   ```

3. 配置环境变量（可选，默认值已设置）
   ```
   $env:DB_USER = "root"
   $env:DB_PASSWORD = "123456"
   $env:DB_HOST = "127.0.0.1"
   $env:DB_PORT = "3306"
   $env:DB_NAME = "ocean-monitor"
   ```

4. 启动后端服务
   ```
   python app.py
   ```

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

## 常见问题排查
1. 数据库连接问题：
   - 确保MySQL服务已启动
   - 检查数据库连接信息是否正确

2. 后端依赖安装问题：
   - 如遇到网络问题，可尝试更换PyPI源：
     ```
     pip install -r requirements.txt -i https://pypi.org/simple
     ```

3. 前端启动问题：
   - 确保Node.js版本兼容
   - 检查端口3000是否被占用

## 数据导入
系统启动时会自动从以下CSV文件导入示例数据：
- data/Fish.csv：鱼类数据
- data/processed/combined_water_quality.csv：水质数据

如需导入自定义数据，可以修改这两个CSV文件，系统会在启动时读取。 