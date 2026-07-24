# CalcuAlert 代理服务器

## 快速启动

### 方式一：使用启动脚本
```bash
# Windows
双击 start_proxy.bat

# 或者手动启动
python proxy_server.py
```

### 方式二：手动启动

**1. 启动 Python 代理服务器**
```bash
cd pg
python proxy_server.py
```

**2. 启动 frpc 客户端**（需要先安装 frpc）
```bash
frpc.exe -c frpc.toml
```

## 端口分配

| 服务 | 本地端口 | 说明 |
|------|----------|------|
| Proxy Server | 50000 | Python 代理服务器 |
| API Server | 5792 | Flask API 服务 |
| FRPS | 17000 | 服务端绑定端口 |
| FRPS Web | 17500 | 管理面板 |

## 访问方式

### 本地访问
- 主页: http://127.0.0.1:50000
- API: http://127.0.0.1:50000/predict

### 公网访问（需要 frpc 运行）
- 主页: http://8.137.187.63:17000
- FRPS 管理面板: http://8.137.187.63:17500 (admin/ydl123)

## 文件说明

- `proxy_server.py` - Python 代理服务器
- `frpc.toml` - frpc 客户端配置
- `start_proxy.bat` - Windows 启动脚本
- `api_server.py` - Flask API 服务器

## 注意事项

1. 确保 `api_server.py` 已启动（端口 5792）
2. 需要安装 frpc 客户端：https://github.com/fatedier/frp/releases
3. frps 服务器已配置：token=ydl, bindPort=17000
