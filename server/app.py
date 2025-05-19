from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from database import db, User, HydroData, Fish
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from pathlib import Path
import csv
import io
import os
import pandas as pd
from werkzeug.datastructures import FileStorage
from math import isnan

app = Flask(__name__)
CORS(app)

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


# 获取所有用户列表接口（仅管理员可用）
@app.route("/api/users", methods=["GET"])
def get_users():
    users = User.query.all()
    users_list = []
    for user in users:
        users_list.append({
            "id": user.id,
            "username": user.username,
            "role": user.role
        })
    return jsonify({"users": users_list})

# 获取单个用户信息
@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "用户不存在"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.role
    })

# 更新用户信息
@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "用户不存在"}), 404
    
    data = request.get_json()
    
    # 检查用户名是否已被其他用户使用
    if "username" in data and data["username"] != user.username:
        existing_user = User.query.filter_by(username=data["username"]).first()
        if existing_user:
            return jsonify({"message": "用户名已存在"}), 409
        user.username = data["username"]
    
    # 更新角色
    if "role" in data:
        # 检查是否尝试将最后一个管理员改为普通用户
        if user.role == "admin" and data["role"] != "admin":
            admin_count = User.query.filter_by(role="admin").count()
            if admin_count <= 1:
                return jsonify({"message": "必须保留至少一个管理员账户"}), 400
        user.role = data["role"]
    
    # 更新密码
    if "password" in data and data["password"]:
        user.password_hash = generate_password_hash(data["password"])
    
    db.session.commit()
    return jsonify({"message": "用户信息更新成功"})

# 删除用户
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "用户不存在"}), 404
    
    # 检查是否尝试删除最后一个管理员
    if user.role == "admin":
        admin_count = User.query.filter_by(role="admin").count()
        if admin_count <= 1:
            return jsonify({"message": "不能删除唯一的管理员账户"}), 400
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "用户删除成功"})

# 创建新用户（管理员操作）
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    role = data["role"]

    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "用户名已存在"}), 409

    new_user = User(
        username=username, 
        role=role, 
        password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        "message": "用户创建成功",
        "id": new_user.id,
        "username": new_user.username,
        "role": new_user.role
    }), 201

# 创建初始管理员账户
def create_default_admin():
    """创建默认管理员账户，如果不存在的话"""
    admin_exists = User.query.filter_by(role="admin").first()
    if not admin_exists:
        print("创建默认管理员账户...")
        default_admin = User(
            username="admin",
            role="admin",
            password_hash=generate_password_hash("admin123")
        )
        db.session.add(default_admin)
        db.session.commit()
        print(f"默认管理员账户创建成功 (用户名: admin, 密码: admin123)")
    else:
        print("管理员账户已存在，跳过创建默认管理员")

def import_hydrodata_from_csv():
    """从CSV文件导入水质数据"""
    csv_path = os.path.join(os.path.dirname(__file__), '../data/processed/combined_water_quality.csv')
    try:
        df = pd.read_csv(csv_path)
        imported_count = 0

        for _, row in df.iterrows():

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

# 添加模拟的监控数据API
@app.route("/api/monitoring-data", methods=["GET"])
def get_monitoring_data():
    """提供模拟的监控数据"""
    monitoring_data = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "camera_id": "CAM-001",
        "location": "东海海域-A区",
        "environment": {
            "water_temperature": 22.5,
            "depth": 15.3,
            "visibility": "良好",
            "dissolved_oxygen": 7.2,
            "pH": 7.8
        },
        "fish_activity": {
            "count": 320,
            "main_species": "黄鱼、带鱼",
            "movement_level": "活跃",
            "health_status": "良好"
        },
        "alerts": [
            {
                "type": "water_quality",
                "level": "info",
                "message": "水质参数正常"
            }
        ]
    }
    return jsonify(monitoring_data)

# API连接测试端点
@app.route("/api/test", methods=["GET"])
def test_api():
    """用于测试API连接的简单端点"""
    return jsonify({
        "message": "API连接正常",
        "status": "OK",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # 创建默认管理员账户
        create_default_admin()

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
