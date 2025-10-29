// 1. 构建间接 Repo–Repo 图：通过 Actor 节点投影为 Repo–Repo 相似度边
CALL gds.graph.project.cypher(
'repoGraph',
'MATCH (r:Repo) RETURN id(r) AS id',
'''
MATCH (a:Actor)-[:INTERACTS_WITH]->(r1:Repo),
(a)-[:INTERACTS_WITH]->(r2:Repo)
WHERE id(r1) < id(r2)
RETURN id(r1) AS source, id(r2) AS target, count(*) AS weight
''',
{ relationshipProperties: 'weight' }
);

// 2. 运行 Louvain 聚类算法，并将聚类结果写入 repo_community 属性
CALL gds.louvain.write({
  graphName: 'repoGraph',
  writeProperty: 'repo_community'
  })
  YIELD communityCount, modularity;
  
// 3. 输出每个聚类的仓库数量（查看分布）
  MATCH (r:Repo)
  RETURN r.repo_community AS community, count(*) AS repo_count
   ORDER BY repo_count DESC
  LIMIT 20;
  
// 4. 导出每个仓库所属社区
  MATCH (r:Repo)
  RETURN r.repo_name AS repo, r.repo_community AS community
   ORDER BY community, repo
