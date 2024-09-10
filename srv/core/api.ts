import instance from "./etherscan-instance"

type ApiTransaction = {
  blockNumber: string
  hash: string
  from: string
  to: string
  value: string
}

type ApiTransactionResponse = {
  status: number
  message: string
  result: ApiTransaction[]
}

type GraphTransaction = {
  hash: string
  to: string
  value: string
}

type Graph = Record<string, Array<GraphTransaction>>

const MAX_DEPTH = 3
const MAX_TXS_PER = 100

const getAccountGraph = async (
  address: string,
  startBlock: number = 0,
  maxDepth: number = MAX_DEPTH,
  depth: number = 0,
  graph: Graph = {},
  visited = new Set<string>()
) => {
  if (depth === Math.min(maxDepth, MAX_DEPTH)) {
    return graph
  }

  visited.add(address)

  const resp = await instance.get<ApiTransactionResponse>("/", {
    params: {
      module: "account",
      action: "txlist",
      sort: "desc",
      page: 1,
      offset: MAX_TXS_PER,
      startblock: startBlock,
      endblock: 999999999,
      address,
    },
  })

  if (resp.data.message !== "OK") {
    throw new Error(
      `Error getting txlist for ${address} (status ${resp.data.status}): ${resp.data.message} ${resp.data.result}`
    )
  }

  const neighborPromises: Array<Promise<Graph>> = []
  for (const tx of resp.data.result) {
    if (tx.from === address && tx.to.length > 0) {
      if (!(address in graph)) {
        graph[address] = []
      }
      graph[address].push({ to: tx.to, hash: tx.hash, value: tx.value })

      if (!visited.has(tx.to)) {
        neighborPromises.push(
          getAccountGraph(
            tx.to,
            Number(tx.blockNumber),
            maxDepth,
            depth + 1,
            graph,
            visited
          )
        )
      }
    }
  }
  await Promise.all(neighborPromises)

  return graph
}

export default getAccountGraph
