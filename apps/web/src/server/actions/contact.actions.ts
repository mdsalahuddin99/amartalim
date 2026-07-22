"use server";

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    // Basic validation
    if (!input.name || !input.email || !input.subject || !input.message) {
      return { ok: false, error: "সব ফিল্ড পূরণ করা আবশ্যক।" };
    }

    // Mock server delay
    await new Promise((r) => setTimeout(r, 600));

    // TODO: In the future, send an email or save to DB here.
    console.log("Contact Message Received:", input);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: "বার্তা পাঠানো সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন।" };
  }
}
