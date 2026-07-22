"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase, ChevronLeft, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import SharedNavbar from "@/components/shared/navbar";
import { fadeUp } from "@/lib/animations";
import { submitRoleApplication } from "@/server/actions/application.actions";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
  phone: z.string().optional(),
  expertise: z.string().min(2, "আপনার ফতওয়া বা বিশেষায়িত বিভাগ উল্লেখ করুন।"),
  institution: z.string().min(2, "বর্তমান কর্মস্থল বা মাদ্রাসার নাম দিন।"),
  bio: z.string().min(10, "আপনার ইফতা ব্যাকগ্রাউন্ড সম্পর্কে কমপক্ষে ১০ অক্ষরে লিখুন।"),
});

export default function PageClient({ initialApplications }: { initialApplications: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      expertise: "",
      institution: "",
      bio: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const expertiseArray = values.expertise.split(",").map(s => s.trim()).filter(Boolean);
    
    // Combine custom fields into the bio field for database storage
    const combinedBio = `[কর্মস্থল / মাদ্রাসা]: ${values.institution}\n\n[ইফতা ব্যাকগ্রাউন্ড]: ${values.bio}`;

    const result = await submitRoleApplication({
      role: "MUFTI",
      name: values.name,
      phone: values.phone,
      bio: combinedBio,
      expertise: expertiseArray,
    });

    setIsSubmitting(false);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("মুফতি আবেদন সফলভাবে জমা দেওয়া হয়েছে!");
      setSubmitted(true);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PENDING") return <Badge variant="secondary" className="bg-warning/10 text-warning">পর্যালোচনায় আছে</Badge>;
    if (status === "APPROVED") return <Badge variant="secondary" className="bg-success/10 text-success">অনুমোদিত</Badge>;
    if (status === "REJECTED") return <Badge variant="destructive">বাতিলকৃত</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar />
      
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> ড্যাশবোর্ডে ফিরে যান
        </Link>
        
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">মুফতি হিসেবে যুক্ত হোন</h1>
            <p className="text-muted-foreground">আপনার জ্ঞান দিয়ে দ্বীনি জিজ্ঞাসা ও ফতওয়ার সমাধান দিন</p>
          </div>

          {/* Existing Applications */}
          {initialApplications.length > 0 && !submitted && (
            <div className="mb-10 space-y-4">
              <h2 className="font-semibold text-lg">আপনার বর্তমান আবেদন</h2>
              <div className="grid gap-3">
                {initialApplications.map(app => (
                  <div key={app.id}>
                    <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center justify-between">
                      <div>
                        <div className="font-medium">মুফতি হিসেবে আবেদন</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          জমা দেওয়ার তারিখ: {new Date(app.createdAt).toLocaleDateString("bn-BD")}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                    {app.adminNote && (
                      <div className="p-3 mt-2 text-sm bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                        <span className="font-semibold block mb-1">অ্যাডমিন নোট:</span>
                        {app.adminNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Form */}
          {submitted ? (
            <div className="p-8 sm:p-12 text-center border rounded-3xl bg-card shadow-sm">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">আবেদন জমা হয়েছে!</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                ধন্যবাদ! আপনার মুফতি আবেদনটি সফলভাবে আমাদের কাছে পৌঁছেছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
              </p>
              <Button onClick={() => router.push("/dashboard")} className="rounded-xl">
                ড্যাশবোর্ডে ফিরে যান
              </Button>
            </div>
          ) : (
            <div className="border rounded-3xl bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="font-semibold text-xl mb-6">নতুন আবেদন ফর্ম (মুফতি)</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>পুরো নাম</FormLabel>
                          <FormControl>
                            <Input placeholder="মুফতি আব্দুর রহমান" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ফোন নম্বর (ঐচ্ছিক)</FormLabel>
                          <FormControl>
                            <Input placeholder="01XXX-XXXXXX" className="rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ফতওয়া বা বিশেষায়িত বিভাগ</FormLabel>
                        <FormControl>
                          <Input placeholder="যেমন: ফিকহুল বুয়ূ, ফিকহুল উসরাহ (কমা দিয়ে লিখুন)" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormDescription>
                          আপনি যেসব বিষয়ে প্রশ্নের উত্তর দিতে চান।
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>বর্তমান কর্মস্থল বা মাদ্রাসার নাম</FormLabel>
                        <FormControl>
                          <Input placeholder="যেমন: জামিয়া ইসলামিয়া দারুল উলুম..." className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>আপনার ইফতা ব্যাকগ্রাউন্ড (Bio)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="কোথা থেকে ইফতা সম্পন্ন করেছেন এবং আপনার পড়াশোনার বিস্তারিত লিখুন..." 
                            className="min-h-[120px] rounded-xl resize-y" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full rounded-xl py-6 text-base" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> সাবমিট হচ্ছে...</>
                    ) : (
                      "আবেদন জমা দিন"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
