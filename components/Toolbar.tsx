// components/Toolbar.tsx
'use client'


import {
  MousePointer2, 
  Hand, 
  Diamond, 
  Square, 
  Circle, 
  CornerUpRight, 
  MoveUpRight, 
  Type,
  StickyNote,
  MessageCircle,
  AppWindow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback,
  AvatarImage, } from '@/components/ui/avatar';
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,

} from '@/components/ui/tooltip';



interface ToolProps {
  isArrowMode: boolean;
  onArrowModeToggle: () => void;

  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function Toolbar({ isArrowMode, onArrowModeToggle, onZoomIn, onZoomOut, onZoomReset }: ToolProps) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-row space-x-1.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 ${isArrowMode ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              onClick={onZoomIn}
              aria-label="Zoom in"
            >
              <MousePointer2 className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pointer</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomIn}
              aria-label="Zoom in"
            >
              <Hand className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hand</TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
              onClick={onZoomIn}
              aria-label="Zoom in"
            >
              <Square className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Square</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomOut}
              
              aria-label="Zoom out"
            >
              <Diamond className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Diamond</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomReset}
              aria-label="Reset zoom"
            >
              <Circle className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Circle</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 ${isArrowMode ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              onClick={onArrowModeToggle}
              aria-label="Reset zoom"
            >
              <CornerUpRight className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isArrowMode ? 'Exit Arrow Mode' : 'Arrow Tool'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
              onClick={onZoomReset}
              aria-label="Reset zoom"
            >
              <MoveUpRight className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Arrow</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomIn} 
              aria-label="Zoom in"
            >
              <Type className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Text</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomOut}
              
              aria-label="Zoom out"
            >
              <AppWindow className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Section</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomReset}
              aria-label="Reset zoom"
            >
              <StickyNote className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sticky Note</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomReset}
              aria-label="Reset zoom"
            >
              <MessageCircle className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Comment</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div>
        <Separator orientation="vertical" className="h-6" />
      </div>
      <Button
              variant="default"
              size="sm"
              className="h-9 w-auto px-3 hover:bg-black/70 dark:hover:bg-slate-800"
              onClick={onZoomOut}
              aria-label="Share"
            >
              Share
            </Button>
            <Avatar className='h-9 w-9'>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>

      </Avatar>
    </div>
  );
}