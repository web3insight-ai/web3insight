# README

从PG导入Neo4j数据，主要分为以下的三个步骤，分别对应三个脚本

1. [export_gharchive.sh](./1-export_gharchive.sh)：将数据从PG数据库导出
2. [data_process.py](2-data_process.py)：处理导出的数据，使其可以满足Neo4j数据库的导入条件
3. [import_neo4j.sh](3-import_neo4j.sh)：导入数据库

下面将会对三个脚本进行解析，便于调整

## step-0 安装Neo4j

社区版本Neo4j的安装参考：https://neo4j.com/docs/operations-manual/current/installation/

其中对于最新版本，**JDK-21**是必须项，并且需要严格遵守版本要求，具体安装与检查内容可以参考[0-install_neo4j.sh](./0-install_neo4j.sh)

核心步骤包括：

- 检查并配置JAVA路径
- 安装Neo4j，这里采用了下载rpm包直接安装的方式
- 配置Neo4j.conf，核心配置http和bolt端口，与监听IP

如果遇到访问问题，可以检查本机防火墙是否开放对应端口

## 1. 导出数据

具体语句参考：[1-export_gharchive.sh](./1-export_gharchive.sh)，使用`psql`·命令导出

数据库中共有4张表，先处理其中的actors、repos、events三张表

actors约250万、repos约40w、events约一亿条数据

actors和repos均一次性导出为一份CSV文件

events 按时间分批导出

## 2. 数据处理

具体语句参考：[2-data_process.py](./2-data_process.py)，使用python配合pandas分批处理数据

采用python脚本处理数据，使其符合neo4j的导入格式

其中actors 与 repos均作为节点，处理较为简单，重命名列表名称即可，使得ID满足`actor_id:ID(Actor)`形式命名

events作为边，由Actor指向repo，需要重命名列名称的同时，需要添加边类型，并且将start、end与type前置

因为events 数据在导出时就分为了多个文件，所以分批次处理即可



## 3. 导入数据

采用了`neo4j-admin database import` 命令导入数据，但是有几个前置条件：

- 数据库必须为空
- neo4j数据库必须是停止状态
- 待导入的数据必须在指定目录下（一般是`"/var/lib/neo4j/import"`），或者目录与neo4j有相同的权限

`import`命令支持批量文件导入，具体命令参考[3-import_neo4j.sh](./3-import_neo4j.sh)，其中：

- sudo -u neo4j：以 neo4j 用户身份运行命令（Neo4j 服务用户）。
- neo4j-admin：Neo4j 提供的管理命令行工具。
- database import full：执行高性能的全量初始化导入，用于导入非空的全新数据库（数据库必须不存在或为空）。
- --nodes=<Label>=<file>：定义节点数据来源。
- --relationships=<TYPE>=<file>：定义边（关系）的数据来源。
-  --id-type=INTEGER：指定 ID 类型为整数（支持 INTEGER 或 STRING）
- --multiline-fields=true：表示 CSV 字段中可能包含换行符 \n，不会因为多行内容导致导入失败
- --skip-bad-relationships=true：忽略那些起点或终点节点不存在的边关系
- --skip-duplicate-nodes=true：忽略重复的节点记录
- --trim-strings=true：自动清除字符串字段开头或结尾的空格
-  --overwrite-destination=true：如果目标数据库已存在，会删除它并覆盖，适合导入全新数据

并且在最后，在conf中需要添加刚导入的数据库名称，才能在浏览器页面看到刚导入的数据库名称

