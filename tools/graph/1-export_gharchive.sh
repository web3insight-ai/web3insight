#!/bin/bash
###
 # @Author: Justin
 # @Date: 2025-08-19 14:27:47
 # @filename: 
 # @version: 
 # @Description: 
 # @LastEditTime: 2025-09-27 21:13:05
### 

# === 配置参数 ===
DB_NAME="your_database"          # 数据库名
DB_USER="postgres"               # 用户名
EXPORT_DIR="./data/data_raw"  # 这里是输出目录
mkdir -p "$EXPORT_DIR"

# === 1. 一次性导出 actors 和 repos ===
echo "Exporting actors and repos..."

psql -U $DB_USER -d $DB_NAME -c "\COPY actors TO '$EXPORT_DIR/actors.csv' CSV HEADER"
psql -U $DB_USER -d $DB_NAME -c "\COPY repos TO '$EXPORT_DIR/repos.csv' CSV HEADER"

echo "Finished exporting actors and repos."

# === 2. 分批导出 events（按月）===
# 设定你要导出的起止年月（示例为 2015 年 1 月～2025 年 12 月）
START_YEAR=2015
START_MONTH=1
END_YEAR=2025
END_MONTH=12

echo "Exporting events in batches..."

year=$START_YEAR
month=$START_MONTH

while [[ $year -lt $END_YEAR || ($year -eq $END_YEAR && $month -le $END_MONTH) ]]; do
  start_date=$(printf "%04d-%02d-01" $year $month)
  end_date=$(date -d "$start_date +1 month" +"%Y-%m-%d")
  output_file="$EXPORT_DIR/events_${year}_$(printf "%02d" $month).csv"

  echo "  → Exporting $start_date to $end_date → $output_file"
  psql -U $DB_USER -d $DB_NAME -c "\COPY (SELECT * FROM events WHERE created_at >= DATE '$start_date' AND created_at < DATE '$end_date') TO '$output_file' CSV HEADER"

  # 递增月份
  month=$((month + 1))
  if [ $month -gt 12 ]; then
    month=1
    year=$((year + 1))
  fi
done

echo "✅ All exports completed."