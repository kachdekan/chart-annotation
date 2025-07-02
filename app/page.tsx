'use client'

import dynamic from 'next/dynamic';


const YFilesCanvas = dynamic(() => import('./canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-lg">Loading yFiles Canvas...</div>
    </div>
  )
});


export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden font-[family-name:var(--font-geist-sans)]">   
      <YFilesCanvas />
    </div>
  );
}
