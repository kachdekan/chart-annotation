// components/ZoomControls.tsx
'use client'

import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }: ZoomControlsProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-row space-x-2 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-sm ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomIn}
              disabled={zoom >= 200}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>

      <div className="text-center" >
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {zoom}%
        </span>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomOut}
              disabled={zoom <= 25}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onZoomReset}
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}