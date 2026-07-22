import { Metadata } from "next";
import PageClient from "./PageClient";
import { redirect } from "next/navigation";

export default function ApplyPage() {
  redirect("/dashboard");
}
