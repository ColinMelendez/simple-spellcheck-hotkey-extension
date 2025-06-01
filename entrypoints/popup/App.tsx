import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-screen-xl mx-auto p-8 text-center">
      <div className="flex justify-center">
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="h-24 p-6 transition-all duration-300 ease-linear hover:drop-shadow-[0_0_2em_#54bc4ae0]" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-24 p-6 transition-all duration-300 ease-linear motion-safe:animate-spin-slow hover:drop-shadow-[0_0_2em_#61dafbaa]" alt="React logo" />
        </a>
      </div>
      <h1 className="text-5xl leading-tight">WXT + React</h1>
      <div className="p-8">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="rounded-lg border border-transparent px-5 py-3 text-base font-medium font-inherit bg-[#1a1a1a] cursor-pointer transition-colors duration-300 hover:border-[#646cff] focus:outline-4 focus:outline-auto focus:outline-[-webkit-focus-ring-color] dark:bg-[#f9f9f9]"
        >
          count is {count}
        </button>
        <p className="mt-4">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-[#888]">
        Click on the WXT and React logos to learn more
      </p>
    </div>
  );
}

export default App;
