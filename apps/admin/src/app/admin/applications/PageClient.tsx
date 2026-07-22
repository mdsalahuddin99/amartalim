"use client";

import { useState } from "react";
import { Check, X, Search, Eye, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { approveApplication, rejectApplication, deleteApplication, updateApplication } from "@/server/actions/application.actions";
import AdminLayout from "@/components/admin/AdminLayout";

export default function PageClient({ initialApplications }: { initialApplications: any[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [rejectingApp, setRejectingApp] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredApps = applications.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.role.toLowerCase().includes(search.toLowerCase()) ||
    (app.user?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    const res = await approveApplication(id);
    setIsProcessing(false);
    if (res?.error) {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "অনুমোদন দেওয়া হয়েছে!" });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "APPROVED" } : a));
      setSelectedApp(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectingApp) return;
    setIsProcessing(true);
    const res = await rejectApplication(rejectingApp.id, reviewNote);
    setIsProcessing(false);
    if (res?.error) {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "আবেদনটি বাতিল করা হয়েছে!" });
      setApplications(prev => prev.map(a => a.id === rejectingApp.id ? { ...a, status: "REJECTED", adminNote: reviewNote } : a));
      setRejectingApp(null);
      setReviewNote("");
      setSelectedApp(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই আবেদন মুছে ফেলতে চান?")) return;
    setIsProcessing(true);
    const res = await deleteApplication(id);
    setIsProcessing(false);
    if (res?.error) {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "আবেদনটি মুছে ফেলা হয়েছে!" });
      setApplications(prev => prev.filter(a => a.id !== id));
      if (selectedApp?.id === id) setSelectedApp(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;
    setIsProcessing(true);
    const expertiseArray = typeof editForm.expertise === "string" 
      ? editForm.expertise.split(",").map((s: string) => s.trim()).filter(Boolean)
      : editForm.expertise;

    const data = {
      name: editForm.name,
      phone: editForm.phone,
      bio: editForm.bio,
      expertise: expertiseArray,
      meta: {
        shortBio: editForm.shortBio,
        portfolio: editForm.portfolio,
        facebook: editForm.facebook,
        twitter: editForm.twitter,
        website: editForm.website,
      }
    };

    const res = await updateApplication(editingApp.id, data);
    setIsProcessing(false);
    if (res?.error) {
      toast({ title: "ত্রুটি", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "আবেদন আপডেট করা হয়েছে!" });
      setApplications(prev => prev.map(a => a.id === editingApp.id ? { ...a, ...data } : a));
      if (selectedApp?.id === editingApp.id) {
        setSelectedApp({ ...selectedApp, ...data });
      }
      setEditingApp(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "INSTRUCTOR": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">ইন্সট্রাক্টর</Badge>;
      case "AUTHOR": return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">লেখক</Badge>;
      case "MUFTI": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">মুফতি</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PENDING") return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">অপেক্ষমাণ</Badge>;
    if (status === "APPROVED") return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">অনুমোদিত</Badge>;
    if (status === "REJECTED") return <Badge variant="destructive">বাতিলকৃত</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ইউজার আবেদন</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            ইন্সট্রাক্টর, লেখক ও মুফতি হিসেবে নতুন আবেদনগুলো পর্যালোচনা ও অনুমোদন করুন।
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center max-w-sm mb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="নাম, ইমেইল বা রোল খুঁজুন..."
                className="pl-9 rounded-xl bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead>আবেদনকারী</TableHead>
                  <TableHead>ভূমিকা</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      কোনো আবেদন পাওয়া যায়নি।
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-muted-foreground">{app.user?.email}</div>
                      </TableCell>
                      <TableCell>{getRoleBadge(app.role)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(app.createdAt).toLocaleDateString("bn-BD")}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)} className="h-8">
                          <Eye className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">দেখুন</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingApp(app);
                          setEditForm({
                            name: app.name,
                            phone: app.phone || "",
                            bio: app.bio || "",
                            expertise: (app.expertise || []).join(", "),
                            shortBio: app.meta?.shortBio || "",
                            portfolio: app.meta?.portfolio || "",
                            facebook: app.meta?.facebook || "",
                            twitter: app.meta?.twitter || "",
                            website: app.meta?.website || ""
                          });
                        }} className="h-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(app.id)} className="h-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* View Details Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
          <DialogContent className="sm:max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>আবেদনের বিস্তারিত</DialogTitle>
              <DialogDescription>আবেদনটি পড়ে সিদ্ধান্ত নিন।</DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4 my-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">নাম</span>
                    <span className="font-medium">{selectedApp.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">ভূমিকা</span>
                    {getRoleBadge(selectedApp.role)}
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">ইমেইল</span>
                    <span className="font-medium">{selectedApp.user?.email || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">ফোন</span>
                    <span className="font-medium">{selectedApp.phone || "-"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-sm block mb-1.5">বিশেষজ্ঞতা</span>
                  <div className="flex flex-wrap gap-2">
                    {(selectedApp.expertise || []).map((exp: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-primary/5">{exp}</Badge>
                    ))}
                  </div>
                </div>

                {selectedApp.meta && (
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                    {selectedApp.meta.shortBio && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block mb-1">সংক্ষিপ্ত পরিচিতি</span>
                        <span className="font-medium">{selectedApp.meta.shortBio}</span>
                      </div>
                    )}
                    {selectedApp.meta.portfolio && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block mb-1">পোর্টফোলিও / পূর্বের লেখা</span>
                        <a href={selectedApp.meta.portfolio} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                          {selectedApp.meta.portfolio}
                        </a>
                      </div>
                    )}
                    {selectedApp.meta.facebook && (
                      <div>
                        <span className="text-muted-foreground block mb-1">ফেসবুক</span>
                        <a href={selectedApp.meta.facebook} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">লিংক</a>
                      </div>
                    )}
                    {selectedApp.meta.twitter && (
                      <div>
                        <span className="text-muted-foreground block mb-1">টুইটার</span>
                        <a href={selectedApp.meta.twitter} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">লিংক</a>
                      </div>
                    )}
                    {selectedApp.meta.website && (
                      <div>
                        <span className="text-muted-foreground block mb-1">ওয়েবসাইট</span>
                        <a href={selectedApp.meta.website} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">লিংক</a>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground text-sm block mb-1.5 mt-4">নিজের সম্পর্কে বিস্তারিত (Bio)</span>
                  <div className="p-3 bg-secondary/30 rounded-xl text-sm whitespace-pre-wrap">
                    {selectedApp.bio}
                  </div>
                </div>

                {selectedApp.adminNote && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
                    <span className="font-semibold block mb-1">অ্যাডমিন নোট:</span>
                    {selectedApp.adminNote}
                  </div>
                )}

                {selectedApp.status === "PENDING" && (
                  <div className="flex gap-3 pt-4 border-t mt-4">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      onClick={() => {
                        setRejectingApp(selectedApp);
                        setReviewNote("");
                      }}
                      disabled={isProcessing}
                    >
                      <X className="mr-2 h-4 w-4" /> বাতিল করুন
                    </Button>
                    <Button
                      className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={isProcessing}
                    >
                      <Check className="mr-2 h-4 w-4" /> অনুমোদন দিন
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Application Dialog */}
        <Dialog open={!!rejectingApp} onOpenChange={(open) => !open && setRejectingApp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>আবেদন বাতিল করুন</DialogTitle>
              <DialogDescription>
                আপনি চাইলে একটি মেসেজ দিতে পারেন যা ইউজার দেখতে পারবে (যেমন কী সমস্যা ছিল)।
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>বাতিল করার কারণ (ইউজার দেখতে পাবে)</Label>
                <Textarea 
                  rows={4} 
                  placeholder="যেমন: আপনার পোর্টফোলিও লিংক কাজ করছে না..." 
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingApp(null)}>বন্ধ করুন</Button>
              <Button variant="destructive" onClick={confirmReject} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                বাতিল নিশ্চিত করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Application Dialog */}
        <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>আবেদন এডিট করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>নাম</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>ফোন</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>বিশেষজ্ঞতা (কমা দিয়ে আলাদা করুন)</Label>
                <Input value={editForm.expertise} onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>সংক্ষিপ্ত পরিচিতি</Label>
                <Input value={editForm.shortBio} onChange={(e) => setEditForm({ ...editForm, shortBio: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>নিজের সম্পর্কে বিস্তারিত</Label>
                <Textarea rows={4} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>পোর্টফোলিও</Label>
                  <Input value={editForm.portfolio} onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>ওয়েবসাইট</Label>
                  <Input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>ফেসবুক</Label>
                  <Input value={editForm.facebook} onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>টুইটার</Label>
                  <Input value={editForm.twitter} onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingApp(null)}>বাতিল</Button>
              <Button onClick={handleSaveEdit} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                সংরক্ষণ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
