# partnerquiz — Project Context

## What This Is
A relationship self-reflection web app. Users answer 10 open-ended questions 
about how they experience love, conflict, and connection. The app sends their 
answers to Claude, which returns a structured JSON report. The user gets a 
shareable link they can send to their partner.

The goal is to help couples understand how to love and support each other better.

## Core User Flow
1. User lands on the home page
2. User clicks through to the quiz (/quiz)
3. User answers 10 open-ended questions one at a time
4. User submits — answers are sent to POST /api/generate
5. API calls Claude (mocked for now) and returns a structured report
6. Report is saved to Supabase with a UUID as the share token
7. User is redirected to /report/[id]
8. User copies the link and sends it to their partner

## The Report Structure
The AI extracts the following from the user's answers:

- Attachment tendency: secure | anxious | fearful-avoidant | dismissive-avoidant
- Primary love language: quality_time | words_of_affirmation | acts_of_service | physical_touch | receiving_gifts
- Energy style: introverted | extroverted | ambiverted
- Conflict pattern: pursuer | withdrawer | disorganized | collaborative
- Confidence levels for each label: low | medium | high
- Narrative sections: whenStressed, whenDistant, whatMakesThemFeelLoved, inConflict, emotionalSafety, culturalContext
- Partner cheat sheet: doThis[], avoidThis[], inConflictDo, toShowLoveDo
- Caveats[]

## The 10 Questions
1. When you're upset or stressed in a relationship, what do you usually need from your partner?
2. How do you typically respond when you feel like your partner is pulling away or becoming distant?
3. Describe a moment you felt truly loved by a partner or someone close to you. What made it feel that way?
4. What's something small a partner can do consistently that makes a big difference to how loved you feel?
5. After a difficult or draining day, what does recharging look like for you — and how much does your partner factor into that?
6. Think of a recurring conflict or tension you've experienced in relationships. How does it usually start and how do you typically respond?
7. When you and a partner disagree, what does resolution actually need to look like for you to feel okay again?
8. What does feeling emotionally safe and secure in a relationship look like to you — both day to day and long term?
9. What's something you wish partners understood about you that they often get wrong?
10. What's something you're still learning about yourself in relationships?

## Tech Stack
- Next.js 14 app router
- Tailwind CSS
- TypeScript
- Supabase (storing finished reports only, no raw answers)
- Anthropic API via @anthropic-ai/sdk (mocked until API key is added)
- Zod for validating AI JSON output

## Supabase Schema
One table only:
- reports: id (uuid, primary key), report_json (jsonb), created_at (timestamp)
- The id is used as the share token in the URL — /report/[id]
- Raw answers are never stored

## AI Pipeline (mocked for now, real later)
1. Receive 10 answers from the frontend
2. Send to Claude with system prompt (see lib/prompt.ts)
3. Claude returns structured JSON
4. Validate with Zod schema (see lib/schema.ts)
5. Save to Supabase
6. Return the UUID to the frontend

## Language Rules (important for AI prompt)
- Always use probabilistic language: "your responses suggest", "you may tend toward"
- Never use clinical terms: disorder, trauma, diagnosis, pathology
- Never shame or frame traits negatively
- The report is written for the partner to read, not the person who answered

## What Is Mocked vs Real
- API route is mocked — returns hardcoded report JSON
- Supabase save is real — report gets stored and retrieved by UUID
- Frontend flow is real — full end to end works with mock data

## Design
- Styling is intentionally minimal for now
- Custom design will be applied manually later
- No component libraries — plain Tailwind only