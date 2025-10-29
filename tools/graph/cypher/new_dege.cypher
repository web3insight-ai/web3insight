// 新建边，用于标识仓库于仓库之间的关联
// 采用共同开发者数量作为权重
// 只保留有超过 10 个共同开发者的 Repo 对，用于忽略一些关联性较弱的关联

MATCH (a:Actor)-[:INTERACTS_WITH]->(r1:Repo),
(a)-[:INTERACTS_WITH]->(r2:Repo)
WHERE id(r1) < id(r2) // 避免重复和自环
WITH r1, r2, count( DISTINCT a) AS common_actors
WHERE common_actors > 10
MERGE (r1)-[e:CO_DEVELOPED_WITH]->(r2)
 SET e.weight = common_actors
