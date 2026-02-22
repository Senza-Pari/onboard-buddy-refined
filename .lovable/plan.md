

# Welcome Screen: Superhero Makeover

## What Changes

All changes are in a single file: `src/pages/Welcome.tsx`

### 1. Uncover Her Face
- Background position: `bg-center` changes to `bg-top` so her face stays visible at the top
- Overlay: flat `bg-black/60` becomes a bottom gradient (`bg-gradient-to-t from-black/80 via-black/40 to-transparent`) -- clear at the top where her face is, dark at the bottom where the text sits

### 2. Push Text to Bottom Third
- Content container: `items-center` becomes `items-end` with `pb-16 md:pb-20`
- This puts all copy and buttons in the lower third, leaving the hero image clean above

### 3. Updated Copy
- **Headline**: "Your Superpower Starts Here"
- **Subtitle**: "Every hero has a first day. Track your missions, meet your team, and own your onboarding journey from day one."
- **CTA button**: "Begin Your Origin Story"
- **Sub-CTA**: "No sign-up required -- 2 minute tour" (unchanged)

### What Stays the Same
- All animations (framer-motion fade-in)
- Sign Up Free and Sign In buttons
- Guest login behavior
- Green primary button styling

