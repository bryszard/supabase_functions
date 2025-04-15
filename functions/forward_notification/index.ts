import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  try {
    const rawBody = await req.text();

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return new Response(JSON.stringify({ error: "Invalid JSON format", details: parseError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!body.app_name || !body.title || !body.content) {
      return new Response(JSON.stringify({ error: "Missing required fields: app_name, title, or content" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Received notification:", body);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);

    console.log("Supabase client:", supabase);

    const { data, error } = await supabase.from("notifications").insert([
      {
        app_name: body.app_name,
        title: body.title,
        content: body.content,
      },
    ]);

    console.log("Inserted notification:", body, data);

    return new Response(JSON.stringify({ data, error }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
