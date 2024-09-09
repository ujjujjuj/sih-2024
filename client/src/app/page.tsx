"use client";
import { useMutation } from "react-query";
import DirectedGraph, { Link, Node } from "./components/DirectedGraph";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type GraphTransaction = {
  hash: string;
  to: string;
  value: string;
};

type Graph = Record<string, Array<GraphTransaction>>;

function processQueryData(data: Graph) {
  const links = new Array<Link>();
  const nodes = new Array<Node>();
  const nodeHashes = new Set<string>();

  for (const [hash, txns] of Object.entries(data)) {
    // nodeHashes.add(hash);
    if (!nodeHashes.has(hash)) {
      nodes.push({
        id: hash,
        type: "source",
      });
      nodeHashes.add(hash);
    }

    for (const txn of txns) {
      if (!nodeHashes.has(txn.to)) {
        nodes.push({
          id: txn.to,
          type: "child",
        });
        nodeHashes.add(txn.to);
      }

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

  const nodesQuery = useMutation({
    mutationKey: ["query", walletAddress, depth],
    mutationFn: async ({
      walletAddress,
      depth,
    }: {
      walletAddress: string;
      depth: string;
    }) => {
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
  });

  useEffect(() => {
    console.log(nodesQuery.data);
  }, [nodesQuery.data]);

  return (
    <div className="flex flex-col min-h-screen bg-primary text-primary">
      <header className="bg-primary py-4 px-6 border-b">
        <h1 className="text-2xl text-white font-bold">Yuvbharat</h1>
      </header>
      <main className="flex-1  ">
        <div className="grid grid-cols-2 w-full">
          <div className="bg-primary text-card rounded-lg shadow-md p-6 flex-1">
            <h2 className="text-lg font-semibold mb-4">Wallet Address</h2>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Enter wallet address"
                className="flex-1"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
          </div>
          <div className=" bg-primary text-card rounded-lg shadow-md p-6  flex-1">
            <h2 className="text-lg font-semibold mb-4">Max Depth</h2>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                min="1"
                max="10"
                defaultValue="3"
                className="flex-1"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-4 ">
          <Button
            variant={"secondary"}
            className="mx-auto w-32 text-base flex-shrink-0"
            onClick={() => {
              nodesQuery.mutate({
                walletAddress,
                depth,
              });
            }}
          >
            Compute
          </Button>
        </div>
        <hr />
        <div className="col-span-1 md:col-span-2  rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Nodes</h2>
          <DirectedGraph
            nodes={nodesQuery.data?.nodes ?? []}
            links={nodesQuery.data?.links ?? []}
          />
        </div>
      </main>
    </div>
  );
}
