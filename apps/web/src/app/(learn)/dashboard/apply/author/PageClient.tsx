"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase, ChevronLeft, PenTool, CheckCircle2, Loader2 } from "lucide-react";
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
  expertise: z.string().min(2, "আপনার লেখার বিষয়গুলো উল্লেখ করুন।"),
  portfolio: z.string().optional(),
  shortBio: z.string().min(5, "সংক্ষিপ্ত পরিচিতি দিন (১-২ লাইন)।").max(100, "১০০ অক্ষরের মধ্যে রাখুন।"),
  bio: z.string().min(10, "আপনার সম্পর্কে কমপক্ষে ১০ অক্ষরে লিখুন।"),
  facebook: z.string().url("সঠিক URL দিন").or(z.literal("")).optional(),
  twitter: z.string().url("সঠিক URL দিন").or(z.literal("")).optional(),
  website: z.string().url("সঠিক URL দিন").or(z.literal("")).optional(),
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
      portfolio: "",
      shortBio: "",
      bio: "",
      facebook: "",
      twitter: "",
      website: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const expertiseArray = values.expertise.split(",").map(s => s.trim()).filter(Boolean);
    
    const metaData = {
      shortBio: values.shortBio,
      portfolio: values.portfolio || "",
      facebook: values.facebook || "",
      twitter: values.twitter || "",
      website: values.website || ""
    };

    const result = await submitRoleApplication({
      role: "AUTHOR",
      name: values.name,
      phone: values.phone,
      bio: values.bio, // only pure detailed bio
      expertise: expertiseArray,
      meta: metaData,
    });

    setIsSubmitting(false);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("লেখক আবেদন সফলভাবে জমা দেওয়া হয়েছে!");
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
              <PenTool className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">লেখক হিসেবে যুক্ত হোন</h1>
            <p className="text-muted-foreground">আপনার জ্ঞান ও চিন্তাধারা সবার মাঝে শেয়ার করুন</p>
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
                        <div className="font-medium">লেখক হিসেবে আবেদন</div>
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
                ধন্যবাদ! আপনার লেখক আবেদনটি সফলভাবে আমাদের কাছে পৌঁছেছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
              </p>
              <Button onClick={() => router.push("/dashboard")} className="rounded-xl">
                ড্যাশবোর্ডে ফিরে যান
              </Button>
            </div>
          ) : (
            <div className="border rounded-3xl bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="font-semibold text-xl mb-6">নতুন আবেদন ফর্ম (লেখক)</h2>
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
                            <Input placeholder="মো. আব্দুর রহমান" className="rounded-xl" {...field} />
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
                        <FormLabel>লেখার বিষয়সমূহ</FormLabel>
                        <FormControl>
                          <Input placeholder="যেমন: ইসলামি ইতিহাস, ফিকহ, সমসাময়িক বিষয় (কমা দিয়ে লিখুন)" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormDescription>
                          আপনি যেসব বিষয়ে ব্লগ বা আর্টিকেল লিখতে চান।
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>সংক্ষিপ্ত পরিচিতি (Short Bio)</FormLabel>
                        <FormControl>
                          <Input placeholder="উদা: শিক্ষক ও গবেষক, আরবি সাহিত্য" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormDescription>এটি আপনার প্রোফাইল কার্ডে নামের নিচে দেখাবে (১-২ লাইনে)।</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>আপনার সম্পর্কে বিস্তারিত (Detailed Bio)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="আপনার শিক্ষাগত যোগ্যতা এবং বিস্তারিত পরিচিতি লিখুন..." 
                            className="min-h-[120px] rounded-xl resize-y" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold text-lg mb-4">সোশ্যাল ও অন্যান্য লিংক (ঐচ্ছিক)</h3>
                    <div className="grid sm:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="portfolio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>পোর্টফোলিও বা পূর্বের লেখা</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." className="rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ব্যক্তিগত ওয়েবসাইট</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." className="rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ফেসবুক প্রোফাইল</FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/..." className="rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>টুইটার (X) প্রোফাইল</FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/..." className="rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

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
