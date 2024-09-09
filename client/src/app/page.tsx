"use client";
import { useQuery } from "react-query";
import DirectedGraph, { Link, Node } from "./components/DirectedGraph";
import { useEffect, useState } from "react";

type GraphTransaction = {
  hash: string;
  to: string;
  value: string;
};

type Graph = Record<string, Array<GraphTransaction>>;

function processQueryData(data: Graph) {
  const links = new Array<Link>();
  const nodes = new Array<Node>();
  // const nodeHashes = new Set<string>();

  for (const [hash, txns] of Object.entries(data)) {
    // nodeHashes.add(hash);
    nodes.push({
      id: hash,
      type: "source",
    });
    for (const txn of txns) {
      nodes.push({
        id: txn.to,
        type: "child",
      });

      links.push({
        source: hash,
        target: txn.to,
      });
    }
  }

  return { links, nodes };
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [depth, setDepth] = useState("3");

  const nodesQuery = useQuery({
    queryKey: ["query", walletAddress, depth],
    queryFn: async (q) => {
      const [, walletAddress, depth] = q.queryKey as [string, string, string];
      if (walletAddress === "") throw new Error("wallet address empty");

      // call the backend code
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/info/${walletAddress}?depth=${depth}`
      );
      if (!resp.ok) {
        throw new Error("Someting went wrong");
      }

      const data = await resp.json();
      return processQueryData(data as Graph);
    },
    enabled: walletAddress != "",
  });

  useEffect(() => {
    console.log(nodesQuery.data);
  }, [nodesQuery.data]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />

      <input
        type="number"
        value={depth}
        onChange={(e) => setDepth(e.target.value)}
      />

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-100">SIH</h1>

        <div className="w-full h-[700px] bg-black shadow-lg rounded-lg p-4">
          <DirectedGraph
            nodes={nodesQuery.data?.nodes ?? []}
            links={nodesQuery.data?.links ?? []}
          />
        </div>
      </main>
    </div>
  );
}
