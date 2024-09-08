import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    nodes: [
      { id: "Master", type: "master" },
      { id: "Input 1", type: "input" },
      { id: "Input 2", type: "input" },
      { id: "Input 3", type: "input" },
      { id: "Input 4", type: "input" },
      { id: "Input 5", type: "input" },
      { id: "Output 1", type: "output" },
      { id: "Output 2", type: "output" },
      { id: "Output 3", type: "output" },
      { id: "Output 4", type: "output" },
    ],
    links: [
      { source: "Input 1", target: "Master" },
      { source: "Input 2", target: "Master" },
      { source: "Input 3", target: "Master" },
      { source: "Input 4", target: "Master" },
      { source: "Input 5", target: "Master" },
      { source: "Master", target: "Output 1" },
      { source: "Master", target: "Output 2" },
      { source: "Master", target: "Output 3" },
      { source: "Master", target: "Output 4" },
    ],
  };

  return NextResponse.json(data);
}
