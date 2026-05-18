#!/bin/bash
set -e

###
 # @Author: Justin
 # @Date: 2025-08-20 00:10:46
 # @filename: 
 # @version: 
 # @Description: 
 # @LastEditTime: 2025-09-28 13:08:24
### 



# === 用户可自定义部分 ===
NEO4J_RPM_FILE="neo4j-2025.08.0-1.noarch.rpm"   # 替换实际下载的文件名
HTTP_PORT=60001 # HTTP 端口
BOLT_PORT=60002 # BOLT 端口
JDK_PATH="/usr/lib/jvm/java-21-alibaba-dragonwell-21.0.5.0.5-1.1.al8.x86_64" # JDK 路径

# === 自动执行开始 ===
echo "📦 开始安装 Neo4j from RPM 文件: $NEO4J_RPM_FILE"

# 安装 RPM 包
sudo dnf install -y ./$NEO4J_RPM_FILE

# 设置 JAVA_HOME
echo "🔧 设置 JAVA_HOME 为 $JDK_PATH"
echo "export JAVA_HOME=$JDK_PATH" >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
export JAVA_HOME=$JDK_PATH
export PATH=$JAVA_HOME/bin:$PATH

# 检查 Java
java -version

# 修改配置文件
echo "🛠 修改 /etc/neo4j/neo4j.conf 配置文件"

sudo sed -i "s|^#\?dbms.default_listen_address=.*|dbms.default_listen_address=0.0.0.0|" /etc/neo4j/neo4j.conf
sudo sed -i "s|^#\?dbms.connector.http.listen_address=.*|dbms.connector.http.listen_address=:$HTTP_PORT|" /etc/neo4j/neo4j.conf
sudo sed -i "s|^#\?dbms.connector.bolt.listen_address=.*|dbms.connector.bolt.listen_address=:$BOLT_PORT|" /etc/neo4j/neo4j.conf

# 启动服务
echo "🚀 启动并设置 Neo4j 为开机自启"
sudo systemctl enable neo4j
sudo systemctl restart neo4j



# 测试端口监听
echo "🔍 当前监听端口:"
ss -tulnp | grep -E "$HTTP_PORT|$BOLT_PORT"

# 测试本地访问
echo "🧪 测试本地访问 http://localhost:$HTTP_PORT"
curl -I http://localhost:$HTTP_PORT || true

echo "🎉 Neo4j 安装完成！"
echo "🌐 浏览器访问地址: http://<your-public-ip>:$HTTP_PORT"
echo "🔐 默认用户名密码: neo4j / neo4j（首次登录会强制修改）"