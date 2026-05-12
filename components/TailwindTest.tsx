export default function TailwindTest() {
  return (
    <div className="p-4 bg-red-500 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Tailwind Test</h2>
      <p className="text-sm">If you can see this styled correctly, Tailwind is working!</p>
      <div className="mt-4 space-y-2">
        <div className="bg-blue-500 p-2 rounded">Blue background</div>
        <div className="bg-green-500 p-2 rounded">Green background</div>
        <div className="bg-yellow-500 text-black p-2 rounded">Yellow background</div>
      </div>
    </div>
  );
}