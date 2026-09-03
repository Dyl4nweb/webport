import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const contactEmail = process.env.CONTACT_EMAIL || "kurtdylanviray@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Dylan Ramos Portfolio <hello@dylanramos.site>";

    await resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    // Best-effort: store the inquiry for the Admin Dashboard.
    // Never blocks or fails the public form — email delivery above
    // is the source of truth if the DB write hiccups.
    try {
      const { error: dbError } = await getSupabase()
        .from("inquiries")
        .insert({ name, email, message });

      if (dbError) {
        console.error("[contact] inquiry insert failed:", dbError.message);
      }
    } catch (dbErr) {
      console.error("[contact] inquiry insert threw:", dbErr);
    }

    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
