#!/bin/bash
set -e
###
 # @Author: Justin
 # @Date: 2025-10-29 11:29:57
 # @filename: install_gds.sh
 # @version: v1.0
 # @Description: 安装并配置 Neo4j GDS 插件
 # @LastEditTime: 2025-10-29 11:42:09
###

NEO4J_CONF="/etc/neo4j/neo4j.conf"
PLUGIN_DIR="/var/lib/neo4j/plugins"
GDS_VER="2.22.0"
GDS_JAR="neo4j-graph-data-science-${GDS_VER}.jar"
GDS_URL="https://github.com/neo4j/graph-data-science/releases/download/${GDS_VER}/${GDS_JAR}"

# 检查插件目录是否存在
if [ ! -d "$PLUGIN_DIR" ]; then
  echo "❌ 插件目录不存在: $PLUGIN_DIR"
  exit 1
fi

cd $PLUGIN_DIR

# 删除已存在的 GDS jar（可选）
if ls neo4j-graph-data-science-*.jar 1> /dev/null 2>&1; then
    echo "🧹 清理旧版本 GDS 插件..."
    sudo rm -f neo4j-graph-data-science-*.jar
fi

# 下载 GDS 插件
echo "⬇️ 下载 GDS 插件: $GDS_JAR"
sudo wget -O "$GDS_JAR" "$GDS_URL"

# 校验文件
if [ ! -f "$GDS_JAR" ]; then
    echo "❌ GDS 插件下载失败!"
    exit 2
fi

echo "✅ GDS 插件下载完成: $PLUGIN_DIR/$GDS_JAR"

# 配置 conf 文件
echo "🔧 配置 $NEO4J_CONF"

add_or_replace_conf() {
    local key=$1
    local val=$2
    # 检查是否已存在，存在则替换，否则添加
    if grep -q "^${key}=" "$NEO4J_CONF"; then
        sudo sed -i "s|^${key}=.*|${key}=${val}|" "$NEO4J_CONF"
    else
        echo "${key}=${val}" | sudo tee -a "$NEO4J_CONF" > /dev/null
    fi
}

add_or_replace_conf "dbms.security.procedures.unrestricted" "apoc.*,gds.*"
add_or_replace_conf "dbms.security.procedures.allowlist" "apoc.coll.*,apoc.load.*,gds.*"

echo "✅ 配置项已添加/更新: unrestricted, allowlist"

# 重启 Neo4j 服务
echo "🔄 正在重启 Neo4j 服务..."
sudo systemctl restart neo4j

# 检查服务状态
echo "⌛ 等待 Neo4j 启动..."
sleep 8
if systemctl is-active --quiet neo4j; then
    echo "✅ Neo4j 已重启"
else
    echo "❌ Neo4j 服务未能成功重启，请检查日志！"
    exit 3
fi

echo "🎉 GDS 插件安装并配置完成，请进入 Neo4j Browser，执行：CALL gds.version(); 检查版本"