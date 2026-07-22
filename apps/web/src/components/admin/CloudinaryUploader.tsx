import { useRef, useState } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

import SmartImage from "@/components/shared/SmartImage";
interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string | undefined;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD || !PRESET) {
    throw new Error("Cloudinary সেট আপ নেই — NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ও NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET .env এ দিন");
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "আপলোড ব্যর্থ");
  return data.secure_url as string;
}

export const CloudinaryUploader = ({ value, onChange, label = "কভার ইমেজ", className }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
      toast({ title: "আপলোড হয়েছে" });
    } catch (e: any) {
      toast({ title: "আপলোড ব্যর্থ", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <div className="text-sm font-medium mb-1.5">{label}</div>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border/60">
          <SmartImage src={value} alt="" className="w-full h-44 object-cover" />
          <Button
            type="button" variant="destructive" size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-90"
            onClick={() => onChange("")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full h-44 rounded-xl border-2 border-dashed border-border/70 hover:border-primary/50 hover:bg-secondary/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
          <span className="text-xs">{busy ? "আপলোড হচ্ছে..." : "ক্লিক করে ইমেজ আপলোড করুন (Cloudinary)"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-2 mt-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="অথবা URL পেস্ট করুন"
          className="text-xs"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          <Upload className="h-3.5 w-3.5" />
        </Button>
      </div>
      {(!CLOUD || !PRESET) && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
          ⚠ .env এ <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> ও <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> (unsigned) সেট করুন।
        </p>
      )}
    </div>
  );
};

export default CloudinaryUploader;
