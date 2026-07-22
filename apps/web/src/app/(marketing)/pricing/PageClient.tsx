"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import SharedNavbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fmt = (n: number) =>
  n.toLocaleString("bn-BD", { maximumFractionDigits: 0 });

const PricingPage = ({ initialContent }: { initialContent: any }) => {
  const content = initialContent;
  const [yearly, setYearly] = useState(false);
  const activePlans = content.plans?.filter((p: any) => p.active) || [];

  if (!content.enabled) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar showAuth />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">পেজটি সাময়িকভাবে বন্ধ রয়েছে</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <SharedNavbar showAuth />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Badge className="mb-4 bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent-foreground,var(--accent)))] hover:bg-[hsl(var(--accent))]/20">
            <Sparkles className="h-3 w-3 mr-1" /> মেম্বারশিপ প্ল্যান
          </Badge>
          <h1 className="font-serif-bn text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            {content.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.subtitle}
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-muted border border-foreground/10">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !yearly ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              মাসিক
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                yearly ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              বার্ষিক
              {content.yearlyDiscountNote && (
                <span className="text-[10px] bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] px-2 py-0.5 rounded-full">
                  ২ মাস ফ্রি
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {activePlans.map((plan, idx) => {
              const price = yearly ? plan.priceYearly : plan.priceMonthly;
              const isLifetime = plan.id === "lifetime";
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className={`relative rounded-2xl border bg-card p-6 sm:p-8 flex flex-col ${
                    plan.highlighted
                      ? "border-primary shadow-xl shadow-primary/10 md:-translate-y-2"
                      : "border-foreground/10"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1 shadow-md">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="text-center pb-6 border-b border-foreground/10">
                    <h3 className="font-serif-bn text-2xl font-extrabold text-foreground">
                      {plan.name}
                    </h3>
                    {plan.tagline && (
                      <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
                    )}
                    <div className="mt-5">
                      {price === 0 && !isLifetime ? (
                        <div className="text-4xl font-extrabold text-primary">ফ্রি</div>
                      ) : (
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-lg font-semibold text-muted-foreground">৳</span>
                          <span className="text-4xl sm:text-5xl font-extrabold text-foreground">
                            {fmt(price)}
                          </span>
                          {!isLifetime && (
                            <span className="text-sm text-muted-foreground">
                              /{yearly ? "বছর" : "মাস"}
                            </span>
                          )}
                          {isLifetime && (
                            <span className="text-sm text-muted-foreground">/একবার</span>
                          )}
                        </div>
                      )}
                      {yearly && plan.priceMonthly > 0 && !isLifetime && (
                        <p className="text-xs text-muted-foreground mt-2">
                          মাসিক ৳{fmt(Math.round(plan.priceYearly / 12))} সমতুল্য
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mt-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                            plan.highlighted
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={plan.ctaHref || "/register"} className="mt-8">
                    <Button
                      className={`w-full rounded-full font-semibold ${
                        plan.highlighted
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                          : ""
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.ctaLabel || "শুরু করুন"}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {content.guaranteeNote && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{content.guaranteeNote}</span>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      {content.faqs.length > 0 && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif-bn text-2xl sm:text-3xl font-extrabold text-center mb-8">
              সাধারণ জিজ্ঞাসা
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {content.faqs.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  className="bg-card border border-foreground/10 rounded-xl px-5"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default PricingPage;
