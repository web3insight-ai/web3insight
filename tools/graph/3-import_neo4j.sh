#!/bin/bash
set -e
###
 # @Author: Justin
 # @Date: 2025-08-19 23:38:37
 # @filename: 
 # @version: 
 # @Description: 
 # @LastEditTime: 2025-10-28 14:27:32
### 

# 文件路径
IMPORT_DIR="/import/data_clean" # 这是导入的数据存放的目录
ACTORS="$IMPORT_DIR/actors_neo4j_node.csv" # 这是 actors 文件
REPOS="$IMPORT_DIR/repos_neo4j_node.csv" # 这是 repos 文件
# EDGES="$IMPORT_DIR/event_repo_edge_*.csv" # 这是 edges 文件 已经废弃，改为动态查找并拼接
REPORT="$IMPORT_DIR/import.report" # 这是报告文件
TEMP_PATH="/var/lib/neo4j/tmp" # 临时文件路径
DB_NAME="github" # 数据库名称

NEO4J_CONF="/etc/neo4j/neo4j.conf" # Neo4j 配置文件路径

# 日志路径
LOG_FILE="/var/log/neo4j/neo4j-import-$(date +%F-%H-%M-%S).log"


# 关键：找到所有关系文件，用英文逗号拼起来
EDGE_FILES=($IMPORT_DIR/event_repo_edge_*.csv)
if [ ${#EDGE_FILES[@]} -eq 0 ]; then
  echo "❌ 未找到任何关系文件: $IMPORT_DIR/event_repo_edge_*.csv"
  exit 1
fi
EDGES=$(IFS=,; echo "${EDGE_FILES[*]}")

# 检查文件是否存在
check_file() {
  if [ ! -f "$1" ]; then
    echo "❌ 文件未找到: $1"
    exit 1
  fi
}
# 检查数据库是否已存在
check_database_exists() {
  DB_PATH="/var/lib/neo4j/data/databases/$DB_NAME"
  if [ -d "$DB_PATH" ] && [ "$(ls -A "$DB_PATH")" ]; then
    echo "⚠️ 检测到数据库 [$DB_NAME] 已存在且非空：$DB_PATH"
    echo "🛑 请确认是否需要先删除此数据库或更换名称再重新导入。"
    exit 1
  fi
}

echo "🔍 检查文件是否存在..."
check_file "$ACTORS"
check_file "$REPOS"
check_file "${EDGE_FILES[0]}"

echo "🔍 检查数据库 [$DB_NAME] 是否已存在..."
check_database_exists


echo "✅ 所有文件存在且数据库未初始化，开始执行导入流程..."


# 停止 Neo4j 服务
echo "⛔ 停止 Neo4j..."
sudo systemctl stop neo4j

# 执行导入命令
echo "🚀 开始导入 Neo4j 数据库 [$DB_NAME]..."
sudo -u neo4j neo4j-admin database import full \
  --nodes=Actor="$ACTORS" \
  --nodes=Repo="$REPOS" \
  --relationships=INTERACTS_WITH="$EDGES" \
  --id-type=INTEGER \
  --multiline-fields=true \
  --skip-bad-relationships=true \
  --skip-duplicate-nodes=true \
  --trim-strings=true \
  --overwrite-destination=true \
  --report-file="$REPORT" \
  --temp-path="$TEMP_PATH" \
  "$DB_NAME" | tee "$LOG_FILE"

IMPORT_STATUS=$?

# 根据结果提示
if [ $IMPORT_STATUS -eq 0 ]; then
  echo "✅ 导入成功，数据库 [$DB_NAME] 已准备好。"
  echo "📄 日志已保存到: $LOG_FILE"
  
  # 设置默认数据库 
  echo "🔧 设置默认数据库为 [$DB_NAME]..."
  # 如果已存在该项，则替换；否则添加
  if grep -q "^dbms.default_database=" "$NEO4J_CONF"; then
    sudo sed -i "s/^dbms.default_database=.*/dbms.default_database=$DB_NAME/" "$NEO4J_CONF"
  else
    echo "dbms.default_database=$DB_NAME" | sudo tee -a "$NEO4J_CONF" > /dev/null
  fi
  echo "✅ 默认数据库设置完成，当前默认数据库为: $DB_NAME"  
  
  # 重启 Neo4j 服务
  echo "🚀 重新启动 Neo4j..."
  sudo systemctl restart neo4j
  echo "✅ Neo4j 已重新启动，请稍后访问。"
  echo "🔗 浏览器访问地址: http://<your-public-ip>:$HTTP_PORT"
  echo "🔐 默认用户名密码: neo4j / neo4j（首次登录会强制修改）"
else
  echo "❌ 导入失败，请查看日志: $LOG_FILE"
fi