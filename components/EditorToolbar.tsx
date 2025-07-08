import { Button } from '@/components/ui/button';
import type { Editor } from '@tiptap/react';
import { 
  Bold, 
  Code, 
  MessageSquare,
  Undo,
  Redo
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EditorToolbar = ({ editor }: { editor: Editor }) => {


  return (
    <div className="flex items-center gap-1 p-1 border-b border-gray-200 bg-gray-50 rounded-t-lg" >
    <Button
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().undo().run()}
      disabled={!editor.can().chain().focus().undo().run()}
      className="h-8 w-8 p-0"
    >
      <Undo className="h-4 w-4" />
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().redo().run()}
      disabled={!editor.can().chain().focus().redo().run()}
      className="h-8 w-8 p-0"
    >
      <Redo className="h-4 w-4" />
    </Button>

    <div className="w-px h-6 bg-gray-300 mx-1" />

    {/* Heading Dropdown */}
    <Select
      value={
        editor.isActive('heading', { level: 1 }) ? 'h1' : 
        editor.isActive('heading', { level: 2 }) ? 'h2' : 
        editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
      onValueChange={(value) => {
        if (value === 'p') {
          editor.chain().focus().setParagraph().run();
        } else {
          
          const level = parseInt(value.replace('h', ''));
          console.log(level)
          editor.chain().focus().toggleHeading({ level }).run();
        }
      }}
      >
        <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
    </Select>

    <div className="w-px h-6 bg-gray-300 mx-1" />

    <Button
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().toggleBold().run()}
      className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
    >
      <Bold className="h-4 w-4" />
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().toggleCode().run()}
      className={`h-8 w-8 p-0 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
    >
      <Code className="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
    >
      <MessageSquare className="h-4 w-4" />
    </Button>
  </div>
  )
}

export default EditorToolbar
