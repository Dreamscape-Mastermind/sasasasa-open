import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";

import { Button } from "./button";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

export function Editor({ content = "", onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b pb-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          data-active={editor?.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          data-active={editor?.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          data-active={editor?.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          data-active={editor?.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          data-active={editor?.isActive("link")}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[300px] prose dark:prose-invert max-w-none"
      />
    </div>
  );
}
