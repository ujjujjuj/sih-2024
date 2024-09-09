"use client";
import { useQuery } from "react-query";
import DirectedGraph from "./components/DirectedGraph";
import { useEffect, useState } from "react";

// function processQueryData(data) {}

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
      return data;
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
          <DirectedGraph />
        </div>
      </main>
    </div>
  );
}
