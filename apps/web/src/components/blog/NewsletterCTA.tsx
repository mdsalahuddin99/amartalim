import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const NewsletterCTA = ({ compact = false }: { compact?: boolean }) => {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "সঠিক ইমেইল দিন", variant: "destructive" });
      return;
    }
    toast({ title: "ধন্যবাদ!", description: "আপনি সফলভাবে সাবস্ক্রাইব করেছেন।" });
    setEmail("");
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base sm:text-lg leading-tight">
            সপ্তাহিক নিউজলেটার
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            আরবী শিক্ষা ও AI টিপস — প্রতি শুক্রবার সরাসরি ইনবক্সে।
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <Input
          type="email"
          placeholder="আপনার ইমেইল"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-10"
        />
        <Button type="submit" className="h-10 shrink-0">
          <Send className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">সাবস্ক্রাইব</span>
        </Button>
      </form>
    </div>
  );
};

export default NewsletterCTA;
