import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl sm:text-8xl font-bold text-gradient">৪০৪</h1>
        <p className="text-lg sm:text-xl text-muted-foreground">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরানো হয়েছে বা অস্তিত্বহীন।</p>
        <Link to="/">
          <Button className="rounded-xl bg-gradient-hero mt-2">
            <Home className="mr-2 h-4 w-4" /> হোমে ফিরে যান
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
