// components/ZoomControls.tsx
'use client'
import { useState, useEffect } from 'react';
import {  FileText} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import EditorToolbar from './EditorToolbar';

import Image from 'next/image';
import Logo from "@/public/yfilesLogo.png"

export function LeftPanel() {
  const [selectedProject, setSelectedProject] = useState('api-integration');
  const [openTextEditor, setTextEditorOpen ] = useState<boolean>(false)
  const [editorHeight, setEditorHeight] = useState('400px');
  useEffect(() => {
    const updateHeight = () => {
      const buffer = 10;
      const availableHeight = window.innerHeight - 140 - buffer;
      setEditorHeight(`${Math.max(availableHeight, 100)}px`); // Ensure minimum height of 100px
    };

    updateHeight();
  
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
    editorProps: {
      attributes: {
        class:  'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  if(!editor){
    return null
  }
  return (

    <div className="fixed top-5 left-5 z-50" >
      <div className="flex flex-row space-x-2">
      <Image src={Logo} alt="Image" className="rounded-md h-12 w-11.5 pt-0.5" />
      <div className="flex flex-row space-x-2 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm ">
      <Select value={selectedProject} onValueChange={setSelectedProject}>
        <SelectTrigger className="w-[220px] border-none shadow-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800">
          <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api-integration">API Integration</SelectItem>
                <SelectItem value="user-flow">User Flow Diagram</SelectItem>
                <SelectItem value="system-architecture">System Architecture</SelectItem>
                <SelectItem value="database-schema">Database Schema</SelectItem>
              </SelectContent>
            </Select>
      <div>
        <Separator orientation="vertical" className="h-6" />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setTextEditorOpen(!openTextEditor)}
              aria-label="Reset zoom"
            >
              <FileText className="h-5 w-5" />  
            </Button>
          </TooltipTrigger>
          <TooltipContent>Text Editor</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      </div>
      </div>
      {openTextEditor && 
        <div className=" w-[342px] bg-white/90 border border-gray-200 rounded-lg shadow-sm mt-3">
          {editor && <EditorToolbar editor={editor} />}
          <div style={{ height: editorHeight }} className="bg-white/90 ">
            <EditorContent editor={editor} />
        </div>
      </div>}
    </div>
  );
}