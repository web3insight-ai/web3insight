// 创建每个聚类子图 + 计算 PageRank
CALL gds.graph.project.cypher(
'repo_subgraph',
'MATCH (r:Repo) RETURN id(r) AS id, r.repo_community AS community',
'''
MATCH (a:Actor)-[:INTERACTS_WITH]->(r1:Repo),
(a)-[:INTERACTS_WITH]->(r2:Repo)
WHERE id(r1) < id(r2)
RETURN id(r1) AS source, id(r2) AS target, count(*) AS weight
''',
{ relationshipProperties: 'weight' }
);

// 使用 PageRank 识别每个聚类中的中心
CALL gds.pageRank.stream('repo_subgraph')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS repo, score
RETURN repo.repo_community AS community, repo.repo_name AS repo, score
 ORDER BY community, score DESC
LIMIT 50;
