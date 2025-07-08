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
  ChartNoAxesGantt
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



interface ToolProps {

  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function AnnotationToolbar({ onZoomIn, onZoomOut, onZoomReset }: ToolProps) {
  return (
    <div className="fixed bottom-5 right-150 z-50 flex flex-row space-x-1.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm ">
      <TooltipProvider>
      <Tooltip>
          <TooltipTrigger asChild>
            {/*<Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomReset}
              aria-label="Reset zoom"
            >
              <Circle className="h-8 w-8 fill-blue-600 stroke-blue-600"/>
            </Button>*/}
                <Select

      onValueChange={(value) => {
        console.log(value)
      }}
      >
        <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue placeholder={<div className='flex flex-row items-center'>
              <Circle className="h-8 w-8 fill-blue-400 stroke-blue-400 mr-2"/>
              Blue
            </div>} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">
              <Circle className="h-8 w-8 fill-blue-400 stroke-blue-400"/>
              Blue
            </SelectItem>
            <SelectItem value="yellow">
              <Circle className="h-8 w-8 fill-yellow-200 stroke-yellow-200"/>
              Yellow
            </SelectItem>
            <SelectItem value="orange">
              <Circle className="h-8 w-8 fill-orange-300 stroke-orange-300"/>
              Orange
            </SelectItem>
            <SelectItem value="red">
              <Circle className="h-8 w-8 fill-red-400 stroke-red-400"/>
              Red
            </SelectItem>
          </SelectContent>
    </Select>
          </TooltipTrigger>
          <TooltipContent>Color</TooltipContent>
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
              <ChartNoAxesGantt className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stroke</TooltipContent>
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
              <CornerUpRight className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edge</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}