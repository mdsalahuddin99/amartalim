import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Youtube from "@tiptap/extension-youtube";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { DirParagraph, DirHeading, FontSize } from "./extensions";

type Options = {
  value: string;
  onChange: (html: string) => void;
  onHtmlSync?: (html: string) => void;
  placeholder?: string;
};

export const useRichEditor = ({ value, onChange, onHtmlSync, placeholder }: Options) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, paragraph: false }),
      DirParagraph,
      DirHeading.configure({ levels: [1, 2, 3, 4] }),
      Underline,
      TextStyle,
      Color,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "tiptap-table" } }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: "rounded-lg my-4 w-full aspect-video" },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "rounded-lg my-4 max-w-full h-auto" },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === "heading" ? "শিরোনাম লিখুন..." : (placeholder || "লিখতে শুরু করুন..."),
        showOnlyCurrent: true,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "wp-editor prose prose-sm sm:prose-base max-w-none dark:prose-invert focus:outline-none min-h-[480px] px-8 sm:px-12 py-6",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
      onHtmlSync?.(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      onHtmlSync?.(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  return editor;
};
