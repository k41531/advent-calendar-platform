"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  UnderlineIcon,
  Link2,
  ImageIcon,
  Upload,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { uploadImage as uploadImageAction } from "@/lib/actions/articles";

interface ArticleEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

export function ArticleEditor({
  content = "",
  onChange,
}: ArticleEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    // If file is already small enough, return as is
    if (file.size <= 1024 * 1024) {
      // 1MB
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (max 1920px width)
          const maxWidth = 1920;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to WebP with quality adjustment
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
                  type: "image/webp",
                });
                resolve(compressedFile);
              } else {
                reject(new Error("画像の圧縮に失敗しました"));
              }
            },
            "image/webp",
            0.85 // Quality: 85%
          );
        };
        img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
      };
      reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    });
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルのみアップロード可能です");
      return;
    }

    setIsUploading(true);

    try {
      // Compress image before uploading
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressedFile);

      const result = await uploadImageAction(formData);

      if (!result.success || !result.url) {
        throw new Error(result.error || "アップロードに失敗しました");
      }

      // Insert image at current cursor position
      editor?.chain().focus().setImage({ src: result.url }).run();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadImage(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              const file = items[i].getAsFile();
              if (file) {
                event.preventDefault();
                uploadImage(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("URL を入力してください");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bubble Menu - appears on text selection */}
      <BubbleMenu
        editor={editor}
        options={{ placement: 'top' }}
        className="bg-background border border-border rounded-lg shadow-lg p-1 flex gap-1"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-muted" : ""}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-muted" : ""}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "bg-muted" : ""}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border my-auto mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </BubbleMenu>

      {/* Floating Menu - appears at cursor position on empty lines */}
      <FloatingMenu
         className="floating-menu" editor={editor}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
          className="h-8 w-8 p-0 rounded-full bg-white hover:bg-muted -ml-16"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {isFloatingMenuOpen && (
          <div className="bg-background border border-border rounded-lg shadow-lg p-1 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleBold().run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("bold") ? "bg-muted" : ""}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleItalic().run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("italic") ? "bg-muted" : ""}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleUnderline().run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("underline") ? "bg-muted" : ""}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleStrike().run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("strike") ? "bg-muted" : ""}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleCode().run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("code") ? "bg-muted" : ""}
            >
              <Code className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border my-auto mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setIsFloatingMenuOpen(false);
              }}
              className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
             <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-muted" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border my-auto mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive("link") ? "bg-muted" : ""}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          disabled={isUploading}
        >
          {isUploading ? (
            <Upload className="h-4 w-4 animate-pulse" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
          </div>
        )}
      </FloatingMenu>
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}
