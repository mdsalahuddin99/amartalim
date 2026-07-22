"use client";

import { useState } from "react";
import PageShell from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { submitContactMessage } from "@/server/actions/contact.actions";

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL: ContactFormState = { name: "", email: "", subject: "", message: "" };

const ContactPage = () => {
  const [form, setForm] = useState<ContactFormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const update =
    <K extends keyof ContactFormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitContactMessage(form);
      if (res.ok) {
        toast({ title: "বার্তা পাঠানো হয়েছে", description: "আমরা শীঘ্রই উত্তর দেব।" });
        setForm(INITIAL);
      } else {
        toast({ title: "ত্রুটি", description: res.error || "বার্তা পাঠানো সম্ভব হয়নি।", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-serif-bn font-extrabold">যোগাযোগ</h1>
        <p className="mt-3 text-muted-foreground">
          প্রশ্ন, পরামর্শ বা সহযোগিতার জন্য আমাদের জানান।
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info */}
        <aside className="lg:col-span-2 space-y-4">
          <ContactInfo icon={Mail} label="ইমেইল" value="hello@amartalim.com" href="mailto:hello@amartalim.com" />
          <ContactInfo icon={Phone} label="ফোন" value="+880 1XXX-XXXXXX" href="tel:+8801000000000" />
          <ContactInfo icon={MapPin} label="ঠিকানা" value="ঢাকা, বাংলাদেশ" />
        </aside>

        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4 rounded-xl border border-foreground/10 p-6 bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="name" label="নাম" value={form.name} onChange={update("name")} required />
            <Field id="email" label="ইমেইল" type="email" value={form.email} onChange={update("email")} required />
          </div>
          <Field id="subject" label="বিষয়" value={form.subject} onChange={update("subject")} required />

          <div className="space-y-1.5">
            <Label htmlFor="message">বার্তা</Label>
            <Textarea
              id="message"
              rows={6}
              value={form.message}
              onChange={update("message")}
              required
              placeholder="আপনার বার্তা লিখুন..."
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
};

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

const Field = ({ id, label, value, onChange, type = "text", required }: FieldProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} value={value} onChange={onChange} required={required} />
  </div>
);

interface ContactInfoProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}

const ContactInfo = ({ icon: Icon, label, value, href }: ContactInfoProps) => {
  const body = (
    <div className="flex items-start gap-3 rounded-xl border border-foreground/10 p-4 bg-card hover:border-primary/40 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{body}</a> : body;
};

export default ContactPage;
