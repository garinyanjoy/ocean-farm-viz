# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from aip import AipImageClassify
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# ========== 第三方API配置 ==========
# 百度图像识别配置
BAIDU_APP_ID = os.getenv('BAIDU_APP_ID', 'your_app_id')
BAIDU_API_KEY = os.getenv('BAIDU_API_KEY', 'your_api_key')
BAIDU_SECRET_KEY = os.getenv('BAIDU_SECRET_KEY', 'your_secret_key')
image_client = AipImageClassify(BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY)

# 高德地图配置
AMAP_API_KEY = os.getenv('AMAP_API_KEY', 'your_amap_key')

# 天气API配置
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', 'your_weather_key')

# 文件上传配置
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ========== 统一请求处理入口 ==========
@app.route('/intelligent', methods=['POST'])
def handle_intelligent_request():
    try:
        request_type = request.form.get('type') or request.json.get('type')
        
        if request_type == 'chat':
            return handle_chat_request()
        elif request_type == 'image':
            return handle_image_request()
        elif request_type == 'weather':
            return handle_weather_request()
        elif request_type == 'location':
            return handle_location_request()
        else:
            return jsonify({'error': 'Invalid request type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== 聊天处理逻辑 ==========
def handle_chat_request():
    data = request.json
    user_message = data.get('message', '')
    
    # 示例：调用智谱AI API（需自行实现）
    # 实际应替换为真正的AI服务调用
    bot_response = f"已收到：{user_message}（示例回复）"
    
    return jsonify({
        'type': 'chat',
        'reply': bot_response
    })

# ========== 图像处理逻辑 ==========
def handle_image_request():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # 调用百度图像识别
        with open(file_path, 'rb') as f:
            image_data = f.read()
            
        result = image_client.advancedGeneral(image_data)
        items = [item['keyword'] for item in result.get('result', [])]
        
        os.remove(file_path)  # 清理临时文件
        
        return jsonify({
            'type': 'image',
            'result': ', '.join(items) if items else '未识别到有效内容'
        })
        
    return jsonify({'error': 'Invalid file type'}), 400

# ========== 位置处理逻辑 ==========
def handle_location_request():
    data = request.json
    lat = data.get('lat')
    lng = data.get('lng')
    
    # 使用高德逆地理编码API
    url = f'https://restapi.amap.com/v3/geocode/regeo?key={AMAP_API_KEY}&location={lng},{lat}'
    response = requests.get(url).json()
    
    return jsonify({
        'type': 'location',
        'city': response['regeocode']['addressComponent']['city']
    })


# ========== 天气处理逻辑 ==========
def handle_weather_request():
    data = request.json
    city = data.get('city')
    
    if not city:
        return jsonify({'error': 'City parameter required'}), 400
    
    # 获取地理位置编码
    geo_url = f'https://restapi.amap.com/v3/geocode/geo?key={AMAP_API_KEY}&address={city}'
    geo_res = requests.get(geo_url).json()
    
    if not geo_res['geocodes']:
        return jsonify({'error': 'City not found'}), 404
        
    location = geo_res['geocodes'][0]['location']
    
    # 获取天气数据
    weather_url = f'http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={location}'
    weather_res = requests.get(weather_url).json()
    
    if 'error' in weather_res:
        return jsonify({'error': weather_res['error']['message']}), 500
        
    current = weather_res['current']
    
    return jsonify({
        'type': 'weather',
        'data': {
            'temp_c': current['temp_c'],
            'humidity': current['humidity'],
            'wind_kph': current['wind_kph'],
            'condition': current['condition']['text']
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)