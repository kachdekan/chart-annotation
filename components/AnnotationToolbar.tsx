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
  position?: { x: number; y: number };
  selectedColor?: string;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export function AnnotationToolbar({ position, selectedColor = 'blue', onColorChange, onDelete, onClose }: ToolProps) {
  if (!position) return null;

  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -100%)',
  };

  return (
    <div 
      className="fixed z-50 flex flex-row space-x-1.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm"
      style={style}
    >
      <TooltipProvider>
      <Tooltip>
          <TooltipTrigger asChild>
                <Select
      value={selectedColor}
      onValueChange={onColorChange}
      >
        <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">
              <div className='flex flex-row items-center'>
              <Circle className="h-8 w-8 fill-blue-400 stroke-blue-400"/>
              Blue
              </div>
            </SelectItem>
            <SelectItem value="yellow">
              <div className='flex flex-row items-center'>
              <Circle className="h-8 w-8 fill-yellow-200 stroke-yellow-200"/>
              Yellow
              </div>
            </SelectItem>
            <SelectItem value="orange">
              <div className='flex flex-row items-center'>
              <Circle className="h-8 w-8 fill-orange-300 stroke-orange-300"/>
              Orange
              </div>
            </SelectItem>
            <SelectItem value="red">
              <div className='flex flex-row items-center'>
              <Circle className="h-8 w-8 fill-red-400 stroke-red-400"/>
              Red
              </div>
            </SelectItem>
            <SelectItem value="green">
              <div className='flex flex-row items-center'>
              <Circle className="h-8 w-8 fill-green-400 stroke-green-400"/>
              Green
              </div>
            </SelectItem>
            <SelectItem value="purple">
              <div className='flex flex-row items-center'>
              <Circle className="h-8 w-8 fill-purple-400 stroke-purple-400"/>
              Purple
              </div>
            </SelectItem>
          </SelectContent>
    </Select>
          </TooltipTrigger>
          <TooltipContent>Color</TooltipContent>
        </Tooltip>
        
        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                onClick={onDelete}
                aria-label="Delete arrow"
              >
                <ChartNoAxesGantt className="h-8 w-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}
        
        {onClose && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={onClose}
                aria-label="Close"
              >
                <Diamond className="h-8 w-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        )}
        
        {/*<Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {}}
              aria-label="Zoom in"
            >
              <ChartNoAxesGantt className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stroke</TooltipContent>
        </Tooltip>*/}
        {/*<Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {}}
              
              aria-label="Zoom out"
            >
              <Diamond className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Diamond</TooltipContent>
        </Tooltip>*/}
       
        {/*<Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {}}
              aria-label="Reset zoom"
            >
              <CornerUpRight className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edge</TooltipContent>
        </Tooltip>*/}
      </TooltipProvider>
    </div>
  );
}