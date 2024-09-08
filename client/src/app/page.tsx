import DirectedGraph from "./components/DirectedGraph";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-100">SIH</h1>

        <div className="w-full h-[700px] bg-black shadow-lg rounded-lg p-4">
          <DirectedGraph />
        </div>
      </main>
    </div>
  );
}
