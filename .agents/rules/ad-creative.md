# Project Rule: Ad Creative Skill Enforcement

## Mandatory Directive

Whenever this project or any agent session involves ANY of the following tasks:
- Creating an ad or ad copy
- Generating headlines, primary text, descriptions, or CTAs
- Creating ad variations or bulk ad copy
- Real estate marketing copy or property ad creative
- Meta / Facebook / Instagram / WhatsApp / Google / LinkedIn ad creative
- Iterating, scaling, reviewing, or testing advertising creative

The agent **MUST ALWAYS** load and apply the project-level `ad-creative` skill located at:
[`.agents/skills/ad-creative/SKILL.md`](file:///c:/Users/HP/OneDrive/Desktop/luxereality/.agents/skills/ad-creative/SKILL.md)

---

## Core Operational Rules

1. **Source of Truth for Creative Methodology**:
   - All ad copy generation, variation structuring, angle formulation, and platform character-limit validation MUST strictly adhere to `.agents/skills/ad-creative/SKILL.md` (v2.8.2).
   - Never rely on ungrounded generic ad copy patterns when generating marketing material.

2. **D1 Database as Source of Truth for Property Data**:
   - In Creative Studio and all real-estate ad generation pathways, Cloudflare D1 database is the single authoritative source of factual property data.
   - Grounding Rule: Never invent property prices, square footage, locations, amenities, possession dates, floor information, or developer claims.

3. **NVIDIA Nemotron AI Strategy Layer**:
   - Server-side ad generation prompts in `/api/ad-copy` use the `ad-creative` skill methodology as the strategy layer guiding the NVIDIA Nemotron 3 Super model.
