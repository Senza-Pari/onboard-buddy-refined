

# AI Onboarding Assistant -- "Buddy"

## What We're Building

A floating chat assistant called **Buddy** that lives inside the app and knows everything about the new hire's onboarding state. It can answer questions, mark tasks complete, look up contacts, summarize progress, and give encouragement -- all through natural conversation. Powered by Lovable AI (no extra API keys needed).

## How It Works

The new hire clicks a chat bubble (bottom-right corner, above the mobile nav). A chat drawer slides up. They type things like:

- "What should I do next?"
- "Mark the W-4 task as done"
- "Who's my manager meeting with?"
- "How am I doing on my missions?"
- "I'm feeling overwhelmed, what do you suggest?"

Buddy reads the current state of tasks, missions, people, and journal entries, then responds with context-aware answers.

## Architecture

```text
+------------------+       +---------------------+       +--------------------+
|   Chat Drawer    | ----> |  Edge Function      | ----> |  Lovable AI        |
|   (React UI)     |       |  /onboarding-buddy  |       |  (Gemini Flash)    |
|                  | <---- |                     | <---- |                    |
+------------------+       +---------------------+       +--------------------+
        |
        | reads from
        v
+------------------+
|  Zustand Stores  |
|  (tasks, missions|
|   people, journal)|
+------------------+
```

The frontend gathers the user's current onboarding context (task list, mission progress, people, recent journal entries) and sends it alongside the chat message. The edge function injects a system prompt that makes Buddy an onboarding expert, then streams the response back token-by-token.

## What Gets Built

### 1. Edge Function: `supabase/functions/onboarding-buddy/index.ts`

- Receives `{ messages, context }` from the client
- `context` contains: tasks (with completion status), missions (with progress %), people list, recent journal titles
- System prompt tells the AI it is "Buddy", an onboarding assistant for a new hire. It knows the user's tasks, missions, contacts, and journal. It should be encouraging, concise, and action-oriented.
- Streams response via SSE using Lovable AI gateway
- Handles 429/402 errors gracefully

### 2. Component: `src/components/BuddyChat.tsx`

- Floating action button (bottom-right, green, chat icon)
- On mobile: positioned above the bottom nav bar
- Click opens a slide-up chat drawer (not full screen -- about 60% height)
- Message list with user/assistant bubbles
- Text input with send button
- Streams AI responses token-by-token
- Markdown rendering for AI responses
- Loading indicator while streaming

### 3. Component: `src/components/BuddyChatDrawer.tsx`

- The drawer/panel UI itself
- Header with "Buddy" title and close button
- Scrollable message area
- Auto-scrolls to latest message
- Suggested quick-action chips on first open: "What's next?", "My progress", "Who should I meet?"

### 4. Hook: `src/hooks/useBuddyContext.ts`

- Gathers current state from all stores into a compact context object:
  - Tasks: title, completed, department, priority (no descriptions to save tokens)
  - Missions: title, progress %, completed
  - People: name, role, department, meeting date
  - Journal: last 5 entry titles and dates
- Returns a serialized string ready to inject into the system prompt

### 5. Integration into `AppLayout.tsx`

- Add `<BuddyChat />` component inside the layout (visible on all authenticated pages)
- Positioned to not conflict with the existing Sparkles FAB for guest tour replay

## System Prompt (for the edge function)

```
You are Buddy, a friendly onboarding assistant. You help new hires navigate
their first days at work. You have access to the user's current onboarding
data provided below.

Be encouraging, concise, and specific. Reference actual task names, people,
and mission titles. If someone asks what to do next, look at incomplete
tasks sorted by priority. If they ask about progress, summarize completion
percentages. If they seem stressed, be supportive and break things into
small steps.

Keep responses under 150 words unless the user asks for detail.
```

## UI Design

- **FAB**: 56px green circle with a `MessageCircle` icon, matches the app's primary-500 color
- **Drawer**: White background, rounded top corners, shadow-medium, max-height 60vh
- **Messages**: User messages right-aligned with primary-100 background, Buddy messages left-aligned with neutral-100 background
- **Input**: Sticky at bottom of drawer, matches existing input styling (rounded-lg, border-neutral-200)
- **Quick chips**: Small pill buttons in primary-100/primary-700 colors, shown when chat is empty

## Files Changed/Created

| File | Action |
|------|--------|
| `supabase/functions/onboarding-buddy/index.ts` | Create |
| `supabase/config.toml` | Update (add function config) |
| `src/components/BuddyChat.tsx` | Create |
| `src/components/BuddyChatDrawer.tsx` | Create |
| `src/hooks/useBuddyContext.ts` | Create |
| `src/layouts/AppLayout.tsx` | Update (add BuddyChat) |

## Technical Details

- Uses `google/gemini-3-flash-preview` for fast, cost-effective responses
- SSE streaming for real-time token rendering
- Context window kept small by sending only essential fields (titles, statuses, names)
- No database tables needed -- chat is ephemeral (in-memory via React state). Conversation resets when the user navigates away. This keeps it simple and avoids storing potentially sensitive onboarding conversations.
- `verify_jwt = false` in config.toml for the function (auth handled via anon key header)

## Follow-Up Opportunities (not in this build)

- Voice mode with ElevenLabs TTS (read Buddy's responses aloud)
- Persistent chat history in the database
- Buddy proactively suggesting tasks based on time of day
- "Complete task" tool calling where Buddy can actually toggle tasks done via the AI's tool-use capability

