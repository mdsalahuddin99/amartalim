"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Check, X, Search, ChevronLeft, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { fadeUp } from "@/lib/animations";
import { Link } from "@/lib/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { approveApplication, rejectApplication, deleteApplication, editApplication } from "@/server/actions/admin.application.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PageClient({ initialApplications }: { initialApplications: any[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // For reject note
  const [showRejectNote, setShowRejectNote] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  
  // For edit
  const [editAppId, setEditAppId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

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
      toast.error(res.error);
    } else {
      toast.success("আবেদনটি অ্যাপ্রুভ করা হয়েছে!");
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "APPROVED" } : a));
      setSelectedApp(null);
    }
  };

  const handleRejectClick = () => {
    setShowRejectNote(true);
  };

  const handleRejectConfirm = async (id: string) => {
    setIsProcessing(true);
    const res = await rejectApplication(id, adminNote);
    setIsProcessing(false);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("আবেদনটি বাতিল করা হয়েছে!");
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "REJECTED", adminNote } : a));
      setSelectedApp(null);
      setShowRejectNote(false);
      setAdminNote("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই আবেদনটি মুছে ফেলতে চান?")) return;
    
    const res = await deleteApplication(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("আবেদনটি মুছে ফেলা হয়েছে!");
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };
  
  const handleEditOpen = (app: any) => {
    setEditAppId(app.id);
    setEditData({ name: app.name, phone: app.phone || "", bio: app.bio });
  };
  
  const handleEditSubmit = async () => {
    if (!editAppId) return;
    setIsProcessing(true);
    const res = await editApplication(editAppId, editData);
    setIsProcessing(false);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("আবেদনটি এডিট করা হয়েছে!");
      setApplications(prev => prev.map(a => a.id === editAppId ? { ...a, ...editData } : a));
      setEditAppId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "INSTRUCTOR": return <Badge className="bg-blue-500/10 text-blue-500">ইন্সট্রাক্টর</Badge>;
      case "AUTHOR": return <Badge className="bg-purple-500/10 text-purple-500">লেখক</Badge>;
      case "MUFTI": return <Badge className="bg-orange-500/10 text-orange-500">মুফতি</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PENDING") return <Badge variant="secondary" className="bg-warning/10 text-warning">পর্যালোচনায় আছে</Badge>;
    if (status === "APPROVED") return <Badge variant="secondary" className="bg-success/10 text-success">অনুমোদিত</Badge>;
    if (status === "REJECTED") return <Badge variant="destructive">বাতিলকৃত</Badge>;
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> অ্যাডমিন ড্যাশবোর্ড
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">আবেদনসমূহ (Applications)</h1>
          <p className="text-muted-foreground mt-1 text-sm">স্টুডেন্টদের নতুন ভূমিকা (ইন্সট্রাক্টর/লেখক/মুফতি) পাওয়ার আবেদনগুলো পরিচালনা করুন।</p>
        </div>
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
                <TableHead>ভূমিকা (Role)</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    কোনো আবেদন পাওয়া যায়নি।
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedApp(app)} className="h-8 w-8 text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditOpen(app)} className="h-8 w-8 text-blue-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedApp} onOpenChange={(open) => { if (!open) { setSelectedApp(null); setShowRejectNote(false); } }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>আবেদনের বিস্তারিত</DialogTitle>
            <DialogDescription>
              আবেদনটি মনোযোগ দিয়ে পড়ে সিদ্ধান্ত নিন।
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4 my-2 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">নাম</span>
                  <span className="font-medium">{selectedApp.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">ভূমিকা (Role)</span>
                  {getRoleBadge(selectedApp.role)}
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">ইমেইল</span>
                  <span className="font-medium">{selectedApp.user?.email || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">ফোন নম্বর</span>
                  <span className="font-medium">{selectedApp.phone || "-"}</span>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground text-sm block mb-1.5">পারদর্শিতার বিষয় (Expertise)</span>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.expertise.map((exp: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-primary/5">{exp}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm block mb-1.5">নিজের সম্পর্কে (Bio)</span>
                <div className="p-3 bg-secondary/30 rounded-xl text-sm whitespace-pre-wrap">
                  {selectedApp.bio}
                </div>
              </div>

              {selectedApp.adminNote && (
                <div>
                  <span className="text-muted-foreground text-sm block mb-1.5">অ্যাডমিন নোট</span>
                  <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm whitespace-pre-wrap">
                    {selectedApp.adminNote}
                  </div>
                </div>
              )}

              {selectedApp.status === "PENDING" && !showRejectNote && (
                <div className="flex gap-3 pt-4 border-t mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    onClick={handleRejectClick}
                    disabled={isProcessing}
                  >
                    <X className="mr-2 h-4 w-4" /> বাতিল করুন
                  </Button>
                  <Button 
                    className="w-full rounded-xl bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => handleApprove(selectedApp.id)}
                    disabled={isProcessing}
                  >
                    <Check className="mr-2 h-4 w-4" /> অনুমোদন দিন
                  </Button>
                </div>
              )}

              {showRejectNote && (
                <div className="pt-4 border-t mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">বাতিল বা পেন্ডিং রাখার কারণ (ঐচ্ছিক)</label>
                    <Textarea 
                      placeholder="যেমন: আপনার পোর্টফোলিও লিংক কাজ করছে না..." 
                      className="rounded-xl"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowRejectNote(false)}>ফিরে যান</Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleRejectConfirm(selectedApp.id)}
                      disabled={isProcessing}
                    >
                      নিশ্চিত করুন
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={!!editAppId} onOpenChange={(open) => !open && setEditAppId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>আবেদন এডিট করুন</DialogTitle>
            <DialogDescription>
              ইউজারের দেওয়া ভুল তথ্য ঠিক করুন।
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div>
              <label className="text-sm font-medium mb-1 block">নাম</label>
              <Input 
                value={editData.name || ""} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">ফোন নম্বর</label>
              <Input 
                value={editData.phone || ""} 
                onChange={(e) => setEditData({...editData, phone: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">বায়ো</label>
              <Textarea 
                value={editData.bio || ""} 
                onChange={(e) => setEditData({...editData, bio: e.target.value})} 
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditAppId(null)}>বাতিল</Button>
              <Button onClick={handleEditSubmit} disabled={isProcessing}>সেভ করুন</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
