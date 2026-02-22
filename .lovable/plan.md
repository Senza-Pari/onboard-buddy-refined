

# Voice Mode for Buddy (ElevenLabs TTS)

## Overview

Add a "read aloud" button to each of Buddy's chat responses. When tapped, the message is sent to ElevenLabs TTS via a backend function, and the audio plays back in the browser.

## Steps

### 1. Store the ElevenLabs API Key
- Securely store your API key as a backend secret (`ELEVENLABS_API_KEY`)
- You'll be prompted with a secure input field to paste it in

### 2. Create Backend Function: `elevenlabs-tts`
- Receives `{ text, voiceId }` from the client
- Calls the ElevenLabs TTS API (`/v1/text-to-speech/{voiceId}`)
- Uses `eleven_turbo_v2_5` model for low-latency playback
- Returns raw MP3 audio bytes to the client
- Handles errors (rate limits, invalid key, etc.)

### 3. Update `BuddyChatDrawer.tsx`
- Add a small speaker/volume icon button on each assistant message bubble
- When clicked:
  - Icon changes to a loading spinner
  - Fetches audio from the `elevenlabs-tts` function
  - Plays audio using the browser's `Audio` API
  - Icon changes to a "stop" icon while playing (click to stop)
  - Returns to speaker icon when done
- Only one message plays at a time (clicking another stops the current one)

### 4. Voice Selection
- Default voice: **George** (`JBFqnCBsd6RMkjVDRZzb`) -- a friendly, clear male voice suitable for an assistant
- No voice picker in this first version (can be added later)

## UI Preview

Each assistant message will look like:

```
+------------------------------------------+
| Buddy's response text here...            |
|                                    [speaker icon] |
+------------------------------------------+
```

The speaker icon sits at the bottom-right of the assistant bubble. States:
- Default: Volume2 icon (muted gray)
- Loading: Loader2 spinner
- Playing: Square "stop" icon (primary color)

## Technical Details

- Voice: George (JBFqnCBsd6RMkjVDRZzb), model: eleven_turbo_v2_5
- Output format: mp3_44100_128 (passed as query parameter, not body)
- Audio fetched via `fetch()` with `.blob()` (not the SDK, to avoid JSON parsing of binary data)
- `URL.createObjectURL()` for playback, revoked after use
- Markdown is stripped from text before sending to TTS (plain text only)
- Messages over 5000 characters are truncated with a notice

## Files Changed/Created

| File | Action |
|------|--------|
| `supabase/functions/elevenlabs-tts/index.ts` | Create |
| `src/components/BuddyChatDrawer.tsx` | Update (add speaker button per assistant message) |

