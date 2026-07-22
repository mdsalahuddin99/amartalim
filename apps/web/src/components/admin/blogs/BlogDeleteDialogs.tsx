import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ManagedBlogPost } from "@/types/blog";

interface Props {
  confirmDelete: ManagedBlogPost | null;
  onConfirmDelete: (p: ManagedBlogPost | null) => void;
  onDeleteSingle: () => void;
  bulkOpen: boolean;
  bulkCount: number;
  onBulkOpenChange: (v: boolean) => void;
  onDeleteBulk: () => void;
}

export const BlogDeleteDialogs = ({
  confirmDelete, onConfirmDelete, onDeleteSingle,
  bulkOpen, bulkCount, onBulkOpenChange, onDeleteBulk,
}: Props) => (
  <>
    <AlertDialog open={bulkOpen} onOpenChange={onBulkOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{bulkCount} টি ব্লগ মুছবেন?</AlertDialogTitle>
          <AlertDialogDescription>নির্বাচিত পোস্টগুলো স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>বাতিল</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDeleteBulk}
          >মুছুন</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && onConfirmDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ব্লগ মুছবেন?</AlertDialogTitle>
          <AlertDialogDescription>"{confirmDelete?.title}" স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>বাতিল</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDeleteSingle}
          >মুছুন</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);
