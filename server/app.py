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
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from zhipuai import ZhipuAI
import re
from flask import Flask, request, jsonify
import base64

app = Flask(__name__)
CORS(app)

# Read database connection details from environment variables
db_user = os.getenv('DB_USER', 'root')
db_password = os.getenv('DB_PASSWORD', 'lbr200424')
db_host = os.getenv('DB_HOST', '127.0.0.1')
db_port = os.getenv('DB_PORT', '3306')
db_name = os.getenv('DB_NAME', 'ocean-monitor')

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
print("连接数据库：", db_user, db_password, db_host, db_port, db_name)
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

def import_hydrodata_from_csv():
    """从CSV文件导入水质数据"""
    csv_path = os.path.join(os.path.dirname(__file__), '../data/processed/combined_water_quality.csv')
    try:
        df = pd.read_csv(csv_path)
        imported_count = 0

        for _, row in df.iterrows():

            # 检查监测时间是否为null或无效值
            if pd.isna(row['监测时间']) or not isinstance(row['监测时间'], str):
                print(f"无效数据，跳过这一行。")
                continue  # 跳过这一行
                
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
    """提供从数据库获取的最新监控数据并生成警报"""
    # 获取最新的水质数据记录
    latest_hydrodata = HydroData.query.order_by(HydroData.date.desc(), HydroData.id.desc()).first()

    if not latest_hydrodata:
        return jsonify({"error": "No data available"}), 404

    # 定义安全阈值
    thresholds = {
        "water_temperature": {"min_warn": 10, "max_warn": 28, "min_crit": 5, "max_crit": 32},
        "pH": {"min_warn": 6.5, "max_warn": 8.5, "min_crit": 6.0, "max_crit": 9.0},
        "dissolved_oxygen": {"min_warn": 4, "min_crit": 2}
    }

    alerts = []
    # Fallback to default values if data is missing
    env_data = {
        "water_temperature": latest_hydrodata.water_temperature if latest_hydrodata.water_temperature is not None else 22.5,
        "depth": 15.3,  # 假设深度为静态值
        "visibility": "良好", # 假设为静态值
        "dissolved_oxygen": latest_hydrodata.dissolved_oxygen if latest_hydrodata.dissolved_oxygen is not None else 7.2,
        "pH": latest_hydrodata.pH if latest_hydrodata.pH is not None else 7.8
    }

    # 检查水温
    temp = env_data["water_temperature"]
    if temp < thresholds["water_temperature"]["min_crit"] or temp > thresholds["water_temperature"]["max_crit"]:
        alerts.append({"type": "water_quality", "level": "critical", "message": f"水温严重异常: {temp}°C"})
    elif temp < thresholds["water_temperature"]["min_warn"] or temp > thresholds["water_temperature"]["max_warn"]:
        alerts.append({"type": "water_quality", "level": "warning", "message": f"水温警告: {temp}°C"})

    # 检查pH值
    ph = env_data["pH"]
    if ph < thresholds["pH"]["min_crit"] or ph > thresholds["pH"]["max_crit"]:
        alerts.append({"type": "water_quality", "level": "critical", "message": f"pH值严重异常: {ph}"})
    elif ph < thresholds["pH"]["min_warn"] or ph > thresholds["pH"]["max_warn"]:
        alerts.append({"type": "water_quality", "level": "warning", "message": f"pH值警告: {ph}"})

    # 检查溶解氧
    oxygen = env_data["dissolved_oxygen"]
    if oxygen < thresholds["dissolved_oxygen"]["min_crit"]:
        alerts.append({"type": "water_quality", "level": "critical", "message": f"溶解氧严重不足: {oxygen} mg/L"})
    elif oxygen < thresholds["dissolved_oxygen"]["min_warn"]:
        alerts.append({"type": "water_quality", "level": "warning", "message": f"溶解氧警告: {oxygen} mg/L"})

    if not alerts:
        alerts.append({"type": "water_quality", "level": "info", "message": "水质参数正常"})

    monitoring_data = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "camera_id": "CAM-001",
        "location": latest_hydrodata.section_name or "东海海域-A区",
        "environment": env_data,
        "fish_activity": {
            "count": 320,
            "main_species": "黄鱼、带鱼",
            "movement_level": "活跃",
            "health_status": "良好"
        },
        "alerts": alerts
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

@app.route("/api/fish", methods=["GET"])
def get_fish():
    fish_list = Fish.query.all()
    result = []
    for fish in fish_list:
        result.append({
            "id": fish.id,
            "species": fish.species,
            "weight": fish.weight,
            "length1": fish.length1,
            "length2": fish.length2,
            "length3": fish.length3,
            "height": fish.height,
            "width": fish.width
        })
    return jsonify(result)

@app.route("/api/hydrodata", methods=["GET"])
def get_hydrodata():
    # 支持多条件筛选
    query = HydroData.query
    id = request.args.get("id")
    location = request.args.get("location")
    basin = request.args.get("basin")
    section_name = request.args.get("section_name")
    date = request.args.get("date")
    if id:
        query = query.filter_by(id=id)
    if location:
        query = query.filter_by(location=location)
    if basin:
        query = query.filter_by(basin=basin)
    if section_name:
        query = query.filter_by(section_name=section_name)
    if date:
        query = query.filter_by(date=date)
    data = query.all()
    result = []
    for d in data:
        result.append({
            "id": d.id,
            "location": d.location,
            "basin": d.basin,
            "section_name": d.section_name,
            "date": d.date.strftime("%Y-%m-%d"),
            "water_temperature": d.water_temperature,
            "pH": d.pH,
            "dissolved_oxygen": d.dissolved_oxygen,
            "conductivity": d.conductivity,
            "turbidity": d.turbidity,
            "permanganate_index": d.permanganate_index,
            "ammonia_nitrogen": d.ammonia_nitrogen,
            "total_phosphorus": d.total_phosphorus,
            "total_nitrogen": d.total_nitrogen,
            "site_condition": d.site_condition
        })
    return jsonify(result)


# 添加鱼类体长预测接口
@app.route("/api/fish/predict", methods=["POST"])
def predict_fish_length():
    """基于鱼类的高度和宽度预测体长"""
    try:
        data = request.get_json()
        species = data.get("species")
        height = float(data.get("height"))
        width = float(data.get("width"))

        # 获取该物种的历史数据用于训练模型
        fish_data = Fish.query.filter_by(species=species).all()

        if len(fish_data) < 3:
            return jsonify({
                "error": "该鱼种数据不足，无法进行准确预测",
                "message": f"需要至少3条{species}的历史数据，当前仅有{len(fish_data)}条"
            }), 400

        # 准备训练数据
        X = []  # 特征：高度和宽度
        y1, y2, y3 = [], [], []  # 目标：三个体长

        for fish in fish_data:
            X.append([fish.height, fish.width])
            y1.append(fish.length1)
            y2.append(fish.length2)
            y3.append(fish.length3)

        X = np.array(X)
        y1, y2, y3 = np.array(y1), np.array(y2), np.array(y3)

        # 训练三个独立的线性回归模型
        models = {}
        predictions = {}

        for i, (name, y) in enumerate([("length1", y1), ("length2", y2), ("length3", y3)]):
            model = LinearRegression()
            model.fit(X, y)

            # 进行预测
            pred = model.predict([[height, width]])[0]
            predictions[name] = round(pred, 2)

            # 计算置信度（基于R²分数）
            score = model.score(X, y)
            models[name] = {
                "prediction": round(pred, 2),
                "confidence": round(score * 100, 1)
            }

        return jsonify({
            "species": species,
            "input": {
                "height": height,
                "width": width
            },
            "predictions": {
                "length1": models["length1"]["prediction"],  # 鼻端到尾鳍起点
                "length2": models["length2"]["prediction"],  # 鼻端到尾鳍缺刻
                "length3": models["length3"]["prediction"]  # 鼻端到尾鳍末端
            },
            "confidence": {
                "length1": models["length1"]["confidence"],
                "length2": models["length2"]["confidence"],
                "length3": models["length3"]["confidence"]
            },
            "sample_size": len(fish_data),
            "message": "预测完成"
        })

    except ValueError as e:
        return jsonify({"error": "输入数据格式错误", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "预测失败", "message": str(e)}), 500


# 获取所有鱼类品种列表
@app.route("/api/fish/species", methods=["GET"])
def get_fish_species():
    """获取数据库中所有鱼类品种"""
    try:
        species_list = db.session.query(Fish.species).distinct().all()
        species_names = [species[0] for species in species_list]

        # 获取每个品种的数据量
        species_info = []
        for species_name in species_names:
            count = Fish.query.filter_by(species=species_name).count()
            species_info.append({
                "name": species_name,
                "count": count,
                "predictable": count >= 3  # 是否有足够数据进行预测
            })

        return jsonify({
            "species": species_info,
            "total_species": len(species_names)
        })

    except Exception as e:
        return jsonify({"error": "获取鱼类品种失败", "message": str(e)}), 500

client = ZhipuAI(api_key="defbe559ed21463b907066351fadd53c.IxkASnky77ZVRhEI") #API KEY
# Markdown转换为纯文本
def markdown_to_plaintext(markdown_text):
    """
    将Markdown格式文本转换为纯文本段落
    参数:
        markdown_text (str): 包含Markdown格式的文本
    返回:
        str: 纯文本格式的内容
    """
    # 移除代码块 (```code```)
    text = re.sub(r'```[^`]*```', '', markdown_text, flags=re.DOTALL)
    # 移除行内代码 (`code`)
    text = re.sub(r'`([^`]*)`', r'\1', text)
    # 移除加粗标记 (**bold** 或 __bold__)
    text = re.sub(r'\*\*([^*]+)\*\*|__([^_]+)__', r'\1\2', text)
    # 移除斜体标记 (*italic* 或 _italic_)
    text = re.sub(r'\*([^*]+)\*|_([^_]+)_', r'\1\2', text)
    # 移除删除线标记 (~~strikethrough~~)
    text = re.sub(r'~~([^~]+)~~', r'\1', text)
    # 移除标题标记 (### Heading)
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    # 移除无序列表标记 (- item 或 * item)
    text = re.sub(r'^[\s]*[-*+]\s+', '', text, flags=re.MULTILINE)
    # 移除有序列表标记 (1. item)
    text = re.sub(r'^[\s]*\d+\.\s+', '', text, flags=re.MULTILINE)
    # 移除引用标记 (> quote)
    text = re.sub(r'^>+\s*', '', text, flags=re.MULTILINE)
    # 移除链接 ([text](url))
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # 移除图片标记 (![alt](url))
    text = re.sub(r'!\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # 移除水平线 (--- 或 ***)
    text = re.sub(r'^[-*]{3,}\s*$', '', text, flags=re.MULTILINE)
    # 移除多余的空白和换行
    text = re.sub(r'\n{3,}', '\n\n', text)  # 多个空行转换为两个空行
    text = re.sub(r'[ \t]{2,}', ' ', text)  # 多个空格转换为一个空格
    text = text.strip()  # 移除首尾空白
    return text

# 智能问答接口
@app.route('/api/chat', methods=['POST'])
def handle_chat():
    data = request.json
    if data['type'] != 'chat':
        return jsonify({'error': 'Invalid request type'}), 400

    user_message = data['message']

    try:
        response = client.chat.completions.create(
        model="glm-4-plus",  # 模型名称
        messages=[
            {"role": "user", "content": "你是一个内置于智慧海洋牧场可视化系统的智能问答小助手可以回答用户的问题特别是关于智慧海洋牧场的相关问题，要求：只需要回答问题，不要有多余的引导，回答只包含中文。"},
            {"role": "assistant", "content": "当然，请告诉我要咨询的问题"},
            {"role": "user", "content": user_message},
    ],
)

        content = response.choices[0].message.content
        content = markdown_to_plaintext(content)  # 转换为纯文本

        return jsonify({
            'type': 'chat',
            'reply': content,
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to generate response'}), 500

# 图像识别接口
@app.route('/api/image', methods=['POST'])
def handle_image():
    # 检查前端发送的字段名
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    
    # 检查空文件
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        # 读取图片数据
        img_base = base64.b64encode(file.read()).decode('utf-8')
        # 调用图像识别处理
        response = client.chat.completions.create(
            model="glm-4v-plus-0111",  #模型名称
            messages=[
          {
            "role": "user",
            "content": [
              {
                "type": "image_url",
                "image_url": {
                "url": img_base
                }
              },
              {
                "type": "text",
                "text": "识别图中物品，要求：只给出答案(最主要的一个物品名称，如果能判断出物品的品种，则给出具体品种，如鲤鱼、鲫鱼、波斯猫、布偶猫等不能的话给出笼统的名称如鱼、猫等），回答只包含中文，除名称外没有其他文字。"
              }
            ]
          }
        ]
    )
        content = response.choices[0].message.content
        # 返回前端需要的结构
        return jsonify({
            'type': 'image',
            'result': content,
        })

    except Exception:
        return jsonify({'error': 'Image processing failed'}), 500

# === 数据管理API接口 ===

# 添加鱼类数据
@app.route("/api/fish", methods=["POST"])
def add_fish():
    try:
        data = request.get_json()
        new_fish = Fish(
            species=data["species"],
            weight=float(data["weight"]),
            length1=float(data["length1"]),
            length2=float(data["length2"]),
            length3=float(data["length3"]),
            height=float(data["height"]),
            width=float(data["width"])
        )
        db.session.add(new_fish)
        db.session.commit()
        return jsonify({"message": "鱼类数据添加成功", "id": new_fish.id}), 201
    except Exception as e:
        return jsonify({"error": "添加失败", "message": str(e)}), 400

# 删除鱼类数据
@app.route("/api/fish/<int:fish_id>", methods=["DELETE"])
def delete_fish(fish_id):
    try:
        fish = Fish.query.get(fish_id)
        if not fish:
            return jsonify({"error": "数据不存在"}), 404
        db.session.delete(fish)
        db.session.commit()
        return jsonify({"message": "鱼类数据删除成功"})
    except Exception as e:
        return jsonify({"error": "删除失败", "message": str(e)}), 400

# 添加水质数据
@app.route("/api/hydrodata", methods=["POST"])
def add_hydrodata():
    try:
        data = request.get_json()
        date_obj = datetime.strptime(data["date"], "%Y-%m-%d").date()
        new_hydro = HydroData(
            location=data["location"],
            basin=data["basin"],
            section_name=data["section_name"],
            date=date_obj,
            water_temperature=float(data.get("water_temperature", 0)),
            pH=float(data.get("pH", 7)),
            dissolved_oxygen=float(data.get("dissolved_oxygen", 0)),
            conductivity=float(data.get("conductivity", 0)),
            turbidity=float(data.get("turbidity", 0)),
            permanganate_index=float(data.get("permanganate_index", 0)),
            ammonia_nitrogen=float(data.get("ammonia_nitrogen", 0)),
            total_phosphorus=float(data.get("total_phosphorus", 0)),
            total_nitrogen=float(data.get("total_nitrogen", 0)),
            site_condition=data.get("site_condition", "")
        )
        db.session.add(new_hydro)
        db.session.commit()
        return jsonify({"message": "水质数据添加成功", "id": new_hydro.id}), 201
    except Exception as e:
        return jsonify({"error": "添加失败", "message": str(e)}), 400

# 删除水质数据
@app.route("/api/hydrodata/<int:hydro_id>", methods=["DELETE"])
def delete_hydrodata(hydro_id):
    try:
        hydro = HydroData.query.get(hydro_id)
        if not hydro:
            return jsonify({"error": "数据不存在"}), 404
        db.session.delete(hydro)
        db.session.commit()
        return jsonify({"message": "水质数据删除成功"})
    except Exception as e:
        return jsonify({"error": "删除失败", "message": str(e)}), 400

# 导出鱼类数据为CSV
@app.route("/api/fish/export", methods=["GET"])
def export_fish():
    try:
        fish_list = Fish.query.all()
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 写入表头
        writer.writerow(['Species', 'Weight(g)', 'Length1(cm)', 'Length2(cm)', 'Length3(cm)', 'Height(cm)', 'Width(cm)'])
        
        # 写入数据
        for fish in fish_list:
            writer.writerow([fish.species, fish.weight, fish.length1, fish.length2, fish.length3, fish.height, fish.width])
        
        output.seek(0)
        
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': 'attachment; filename=fish_data.csv'
            }
        )
    except Exception as e:
        return jsonify({"error": "导出失败", "message": str(e)}), 500

# 导出水质数据为CSV
@app.route("/api/hydrodata/export", methods=["GET"])
def export_hydrodata():
    try:
        hydro_list = HydroData.query.all()
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 写入表头
        writer.writerow(['Location', 'Basin', 'Section_Name', 'Date', 'Water_Temperature', 'pH', 
                        'Dissolved_Oxygen', 'Conductivity', 'Turbidity', 'Permanganate_Index',
                        'Ammonia_Nitrogen', 'Total_Phosphorus', 'Total_Nitrogen', 'Site_Condition'])
        
        # 写入数据
        for hydro in hydro_list:
            writer.writerow([
                hydro.location, hydro.basin, hydro.section_name, hydro.date.strftime("%Y-%m-%d"),
                hydro.water_temperature, hydro.pH, hydro.dissolved_oxygen, hydro.conductivity,
                hydro.turbidity, hydro.permanganate_index, hydro.ammonia_nitrogen,
                hydro.total_phosphorus, hydro.total_nitrogen, hydro.site_condition
            ])
        
        output.seek(0)
        
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': 'attachment; filename=water_quality_data.csv'
            }
        )
    except Exception as e:
        return jsonify({"error": "导出失败", "message": str(e)}), 500

# 上传CSV数据
@app.route("/api/upload/<string:data_type>", methods=["POST"])
def upload_csv(data_type):
    try:
        if 'file' not in request.files:
            return jsonify({"error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "文件名为空"}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "只支持CSV文件"}), 400
        
        # 读取CSV文件
        content = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content))
        
        imported_count = 0
        
        if data_type == "fish":
            for row in csv_reader:
                fish = Fish(
                    species=row['Species'],
                    weight=float(row['Weight(g)']),
                    length1=float(row['Length1(cm)']),
                    length2=float(row['Length2(cm)']),
                    length3=float(row['Length3(cm)']),
                    height=float(row['Height(cm)']),
                    width=float(row['Width(cm)'])
                )
                db.session.add(fish)
                imported_count += 1
                
        elif data_type == "hydrodata":
            for row in csv_reader:
                date_obj = datetime.strptime(row['Date'], '%Y-%m-%d').date()
                hydro = HydroData(
                    location=row['Location'],
                    basin=row['Basin'],
                    section_name=row['Section_Name'],
                    date=date_obj,
                    water_temperature=float(row.get('Water_Temperature', 0)),
                    pH=float(row.get('pH', 7)),
                    dissolved_oxygen=float(row.get('Dissolved_Oxygen', 0)),
                    conductivity=float(row.get('Conductivity', 0)),
                    turbidity=float(row.get('Turbidity', 0)),
                    permanganate_index=float(row.get('Permanganate_Index', 0)),
                    ammonia_nitrogen=float(row.get('Ammonia_Nitrogen', 0)),
                    total_phosphorus=float(row.get('Total_Phosphorus', 0)),
                    total_nitrogen=float(row.get('Total_Nitrogen', 0)),
                    site_condition=row.get('Site_Condition', '')
                )
                db.session.add(hydro)
                imported_count += 1
        else:
            return jsonify({"error": "不支持的数据类型"}), 400
        
        db.session.commit()
        return jsonify({"message": f"成功导入 {imported_count} 条数据"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "上传失败", "message": str(e)}), 500

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
