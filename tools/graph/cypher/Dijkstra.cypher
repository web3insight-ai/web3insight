// 这里的 "some_repo_name" 和 "central_repo_name" 需要替换为实际的仓库名称
// 计算从某个仓库到中心仓库的最短路径距离
// 假设 "central_repo_name" 是之前通过 PageRank 识别的中心仓库
MATCH (start:Repo { repo_name: "some_repo_name" }),
(target:Repo { repo_name: "central_repo_name" })
CALL gds.shortestPath.dijkstra.stream({
  sourceNode: start,
  targetNode: target,
  relationshipWeightProperty: 'distance',
  relationshipQuery: 'CO_DEVELOPED_WITH',
  nodeProjection: 'Repo',
  relationshipProjection: {
    CO_DEVELOPED_WITH: {
      type: 'CO_DEVELOPED_WITH',
      properties: 'distance'
    }
  }
  })
  YIELD totalCost
  RETURN totalCost
