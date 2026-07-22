import { Extension } from "@tiptap/core";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";

/** Paragraph with `dir` attribute for RTL Arabic blocks */
export const DirParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dir: {
        default: null,
        parseHTML: (el) => el.getAttribute("dir"),
        renderHTML: (attrs) =>
          attrs.dir ? { dir: attrs.dir, class: attrs.dir === "rtl" ? "rtl-block" : undefined } : {},
      },
    };
  },
});

/** Heading with `dir` attribute for RTL Arabic blocks */
export const DirHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dir: {
        default: null,
        parseHTML: (el) => el.getAttribute("dir"),
        renderHTML: (attrs) =>
          attrs.dir ? { dir: attrs.dir, class: attrs.dir === "rtl" ? "rtl-block" : undefined } : {},
      },
    };
  },
});

/** FontSize extension built on TextStyle (Tiptap v3 friendly) */
type FontSizeOptions = { types: string[] };
export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) =>
              (el as HTMLElement).style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});
