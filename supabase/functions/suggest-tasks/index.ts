import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert HR onboarding specialist. Generate role-specific onboarding tasks for new employees based on their role and company. Each task should be actionable, specific, and help the new hire succeed in their first two weeks.

Return tasks using the suggest_tasks function. Each task should have:
- title: Clear, actionable task name (2-8 words)
- description: Brief explanation of why this matters (1-2 sentences)
- priority: "high" for first-week essentials, "medium" for second-week items, "low" for nice-to-haves
- department: Who owns this task ("HR", "IT", or "Manager")
- tags: 1-3 relevant tags like "admin", "setup", "training", "team", "compliance"
- daysFromStart: When this should be due (1-14)

Focus on practical, universally applicable tasks while customizing for the role. Include a mix of administrative, technical setup, team integration, and role-specific learning tasks.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { role, company, existingTaskTitles } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Generate 5-8 onboarding tasks for a new ${role || 'employee'} at ${company || 'the company'}.

${existingTaskTitles?.length ? `The user already has these tasks, so suggest different ones:\n${existingTaskTitles.join('\n')}` : ''}

Focus on tasks that would genuinely help someone in this role succeed in their first two weeks.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_tasks",
                description: "Return suggested onboarding tasks",
                parameters: {
                  type: "object",
                  properties: {
                    tasks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                          priority: { type: "string", enum: ["high", "medium", "low"] },
                          department: { type: "string", enum: ["HR", "IT", "Manager"] },
                          tags: { type: "array", items: { type: "string" } },
                          daysFromStart: { type: "number" },
                        },
                        required: ["title", "description", "priority", "department", "tags", "daysFromStart"],
                      },
                    },
                  },
                  required: ["tasks"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "suggest_tasks" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI is busy right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits have been used up. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Failed to generate suggestions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "No suggestions generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { tasks } = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ tasks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("suggest-tasks error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
