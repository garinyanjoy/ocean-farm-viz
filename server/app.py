from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from database import db, User, HydroData, Fish
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from pathlib import Path
import csv
import io
import os
import pandas as pd
import random
from werkzeug.datastructures import FileStorage
from math import isnan

app = Flask(__name__)
# 配置CORS，允许所有来源访问API
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Read database connection details from environment variables
db_user = os.getenv('DB_USER', 'root')
db_password = os.getenv('DB_PASSWORD', '123456')
db_host = os.getenv('DB_HOST', '127.0.0.1')
db_port = os.getenv('DB_PORT', '3306')
db_name = os.getenv('DB_NAME', 'ocean-monitor')

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
db.init_app(app)

# 登录接口
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    user: User = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify(
            {
                "message": "Login successful",
                "username": user.username,
                "role": user.role,  # the role will be used in the client.
            }
        )
    else:
        return jsonify({"message": "Invalid username or password"}), 401

# 注册接口
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    role = data["role"]

    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "用户名已存在"}), 409
    # Check if a admin already exists
    existing_admin = User.query.filter_by(role="admin").first()
    if role == "admin" and existing_admin:
        return jsonify({"message": "您不能注册管理员账户"}), 409

    new_user = User(
        username=username, role=role, password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(
        {
            "message": "Registration successful",
            "username": new_user.username,
            "role": new_user.role,  # the role will be used in the client.
        }
    )

def import_hydrodata_from_csv():
    """从CSV文件导入水质数据"""
    csv_path = os.path.join(os.path.dirname(__file__), '../data/processed/combined_water_quality.csv')
    try:
        df = pd.read_csv(csv_path)
        imported_count = 0

        for _, row in df.iterrows():
            # # 检查监测时间是否为null或无效值
            # if pd.isna(row['监测时间']) or not isinstance(row['监测时间'], str):
            #     print(f"警告：无效的监测时间值 {row['监测时间']}，跳过这一行。")
            #     continue  # 跳过这一行

            date_str = row['监测时间'].split()[0]
            date = datetime.strptime(date_str, '%Y-%m-%d').date()

            def parse_value(value):
                if pd.isna(value) or str(value).lower() in ['null', 'nan', 'na', '']:
                    return None
                try:
                    return float(value)
                except (ValueError, TypeError):
                    return None

            new_data = HydroData(
                location=row['省份'],
                basin=row['流域'],
                section_name=row['断面名称'],
                date=date,
                water_temperature=parse_value(row['水温']),
                pH=parse_value(row['pH']),
                dissolved_oxygen=parse_value(row['溶解氧']),
                conductivity=parse_value(row['电导率']),
                turbidity=parse_value(row['浊度']),
                permanganate_index=parse_value(row['高锰酸盐指数']),
                ammonia_nitrogen=parse_value(row['氨氮']),
                total_phosphorus=parse_value(row['总磷']),
                total_nitrogen=parse_value(row['总氮']),
                site_condition=row['站点情况'] if row['站点情况'] != 'null' else None
            )

            db.session.add(new_data)
            imported_count += 1

            if imported_count % 100 == 0:
                db.session.commit()

        db.session.commit()
        print(f"成功导入 {imported_count} 条水质数据")

    except Exception as e:
        db.session.rollback()
        print(f"导入水质数据失败: {str(e)}")


def import_fish_from_csv():
    """从CSV文件导入鱼类数据"""
    csv_path = os.path.join(os.path.dirname(__file__), '../data/Fish.csv')
    try:
        df = pd.read_csv(csv_path)
        imported_count = 0

        for _, row in df.iterrows():
            new_fish = Fish(
                species=row['Species'],
                weight=row['Weight(g)'],
                length1=row['Length1(cm)'],
                length2=row['Length2(cm)'],
                length3=row['Length3(cm)'],
                height=row['Height(cm)'],
                width=row['Width(cm)']
            )

            db.session.add(new_fish)
            imported_count += 1

            if imported_count % 100 == 0:
                db.session.commit()

        db.session.commit()
        print(f"成功导入 {imported_count} 条鱼类数据")

    except Exception as e:
        db.session.rollback()
        print(f"导入鱼类数据失败: {str(e)}")

# 测试API - 返回简单数据确认API服务正常
@app.route("/api/test", methods=["GET"])
def api_test():
    return jsonify({"status": "ok", "message": "API服务正常"})

# 获取监控数据接口
@app.route("/api/monitoring-data", methods=["GET"])
def get_monitoring_data():
    try:
        # 从数据库获取最新的水质数据
        latest_hydro = HydroData.query.order_by(HydroData.date.desc()).first()
        
        # 从数据库获取随机的鱼类数据作为示例
        random_fish = Fish.query.order_by(db.func.rand()).first()
        
        # 如果没有找到数据，返回模拟数据
        if not latest_hydro:
            water_temp = round(random.uniform(15.0, 22.0), 1)
            depth = round(random.uniform(12.0, 18.0), 1)
            visibility = random.choice(['低', '中', '高'])
        else:
            # 使用实际水温数据，其他使用模拟数据
            water_temp = latest_hydro.water_temperature or round(random.uniform(15.0, 22.0), 1)
            depth = round(random.uniform(12.0, 18.0), 1)
            visibility = random.choice(['低', '中', '高'])
        
        # 获取当前时间
        current_time = datetime.now()
        
        # 构建监控数据响应
        monitoring_data = {
            "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
            "camera_id": "CAM-01",
            "location": "东海区域A",
            "environment": {
                "water_temperature": water_temp,
                "depth": depth,
                "visibility": visibility,
                "dissolved_oxygen": latest_hydro.dissolved_oxygen if latest_hydro else round(random.uniform(5.0, 9.0), 1),
                "pH": latest_hydro.pH if latest_hydro else round(random.uniform(6.5, 8.5), 1)
            },
            "fish_activity": {
                "count": random.randint(10, 50),
                "main_species": random_fish.species if random_fish else "鲈鱼",
                "movement_level": random.choice(["活跃", "正常", "低活动"]),
                "health_status": random.choice(["良好", "正常", "需关注"])
            },
            "alerts": []
        }
        
        # 根据数据生成警报
        if water_temp > 25.0:
            monitoring_data["alerts"].append({
                "type": "temperature",
                "level": "warning",
                "message": "水温偏高，可能影响鱼类生长"
            })
        
        if latest_hydro and latest_hydro.dissolved_oxygen and latest_hydro.dissolved_oxygen < 5.0:
            monitoring_data["alerts"].append({
                "type": "oxygen",
                "level": "critical",
                "message": "溶解氧浓度过低，鱼类健康受到威胁"
            })
            
        return jsonify(monitoring_data)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # 检查是否需要导入数据
        if not HydroData.query.first():  # 如果数据库中没有数据
            print("开始导入水质数据...")
            import_hydrodata_from_csv()

        if not Fish.query.first():  # 如果数据库中没有数据
            print("开始导入鱼类数据...")
            import_fish_from_csv()

        # 检查导入结果
        hydro_count = HydroData.query.count()
        fish_count = Fish.query.count()
        print(f"当前水质数据记录数: {hydro_count}")
        print(f"当前鱼类数据记录数: {fish_count}")

    app.run(host='0.0.0.0', debug=True)
