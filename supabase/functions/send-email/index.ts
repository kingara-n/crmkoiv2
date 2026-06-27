// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { email, subject, message } = await req.json()

    if (!email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, subject, or message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Koi Travel CRM <notifications@koitravel.com>",
        to: [email],
        subject: subject,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Koi Travel CRM Notification</h2>
            <p>${message}</p>
            <br/>
            <p style="color: gray; font-size: 12px;">This is an automated message. Please do not reply.</p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
