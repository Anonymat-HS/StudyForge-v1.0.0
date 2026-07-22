import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get("Authorization")!
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const titre = formData.get("titre") as string | null

    if (!file || !titre) {
      return new Response(
        JSON.stringify({ error: "Missing file or titre" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    let texteExtrait = ""

    const fileName = file.name.toLowerCase()

    if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      texteExtrait = new TextDecoder().decode(uint8Array)
    } else if (fileName.endsWith(".pdf")) {
      const pdfModule = await import("https://esm.sh/pdf-parse@1.1.1")
      const pdfParse = pdfModule.default
      const buffer = Buffer.from(uint8Array)
      const pdfData = await pdfParse(buffer)
      texteExtrait = pdfData.text
    } else {
      texteExtrait = new TextDecoder().decode(uint8Array)
    }

    if (!texteExtrait.trim()) {
      return new Response(
        JSON.stringify({ error: "Could not extract text from file" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: course, error: dbError } = await supabase
      .from("courses")
      .insert({
        user_id: user.id,
        titre,
        texte_extrait: texteExtrait,
      })
      .select()
      .single()

    if (dbError) {
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ course }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
