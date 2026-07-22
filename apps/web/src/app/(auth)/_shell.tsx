import { ReactNode } from "react";
import { Link } from "@/lib/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, GraduationCap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared two-column shell for all auth screens.
 * Keeps visual identity consistent with /login.
 */
const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => (
  <div className="min-h-screen flex bg-background">
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-mesh relative overflow-hidden items-center justify-center p-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-primary-foreground/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-md text-primary-foreground">
        <h2 className="text-3xl font-bold mb-6">Amar Talim একাডেমিতে স্বাগতম</h2>
        <p className="text-primary-foreground/80 mb-10 leading-relaxed">
          বাংলায় সেরা ইসলামিক ও প্রযুক্তি শিক্ষা প্ল্যাটফর্ম।
        </p>
        <div className="space-y-5">
          {[
            { icon: BookOpen, text: "১০০+ প্রিমিয়াম কোর্স" },
            { icon: GraduationCap, text: "সার্টিফিকেট অর্জন করুন" },
            { icon: Shield, text: "নিরাপদ ও বিশ্বস্ত" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 relative">
      <Link to="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:hidden">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> পেছনে
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-6 premium-card p-6 sm:p-8 rounded-3xl"
      >
        <div className="text-center">
          <Link to="/" className="inline-block text-xl font-bold tracking-tight mb-5">
            <span className="text-gradient">Amar</span> Talim
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
      </motion.div>
    </div>
  </div>
);

export default AuthShell;
