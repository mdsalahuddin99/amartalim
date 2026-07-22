import { redirect } from "next/navigation";

export default function DashboardBlogsRedirect() {
  redirect("/author/blogs");
}
