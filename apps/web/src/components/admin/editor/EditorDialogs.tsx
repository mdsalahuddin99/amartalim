import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type LinkDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: string;
  onValueChange: (v: string) => void;
  onApply: () => void;
};

export const LinkDialog = ({ open, onOpenChange, value, onValueChange, onApply }: LinkDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm">
      <DialogHeader><DialogTitle>লিংক যোগ করুন</DialogTitle></DialogHeader>
      <Input
        autoFocus
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="https://example.com"
        onKeyDown={(e) => e.key === "Enter" && onApply()}
      />
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
        <Button onClick={onApply}>প্রয়োগ</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

type YoutubeDialogProps = LinkDialogProps;

export const YoutubeDialog = ({ open, onOpenChange, value, onValueChange, onApply }: YoutubeDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm">
      <DialogHeader><DialogTitle>YouTube ভিডিও যোগ করুন</DialogTitle></DialogHeader>
      <Input
        autoFocus
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        onKeyDown={(e) => e.key === "Enter" && onApply()}
      />
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
        <Button onClick={onApply}>Embed</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
