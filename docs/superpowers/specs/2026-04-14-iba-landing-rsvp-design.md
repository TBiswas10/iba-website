# IBA Landing and RSVP Design Spec

## Goal
Turn the site into a credible, premium front door for the Illawarra Bengali Association. The page should explain what the association is, prove that it is active, and drive people to upcoming events and the separate RSVP flow.

## Scope
- Redesign the landing page to feel premium, calm, and trustworthy, with selective festival energy.
- Keep RSVP on a separate page inside Events.
- Add full RSVP admin management.
- Keep the site focused on the association, not a full platform rewrite.

## Visual Direction
- Layout: split hero, with one side for the story and one side for proof or event focus.
- Tone: trust-first, then celebratory accents.
- Colors: ivory, deep ink, muted saffron, teal accents.
- Photography: real event photos first, not illustration-led visuals.
- Motion: subtle, polished motion only. No loud or gimmicky animation.

## Landing Page Structure
1. Hero
   - Clear headline about the association.
   - Short supporting copy that explains the mission.
   - Primary CTA toward Events and RSVP.
2. Trust strip
   - 5 years active.
   - 100+ average attendance.
   - 6 events per year.
   - 60+ families reached.
   - Volunteer-led community operations.
3. Mission section
   - What the association stands for.
   - How it serves Hindu families in Wollongong.
   - How it includes students, singles, young professionals, Bengali and Indian families, members, and volunteers.
4. How we do it
   - Community-led event planning.
   - Volunteer roles like decorating, cooking, hall booking, and puja operations.
5. Events preview
   - Feature the next upcoming event.
   - Janmastami should be visually emphasized when it is the next major event.
6. RSVP entry point
   - Link to the RSVP page inside Events.
   - Do not place the full form on the homepage.

## Events And RSVP Flow
- RSVP lives on a separate page inside Events.
- The RSVP page starts with an event dropdown.
- Fields required:
  - Name
  - Email
  - Phone
  - Number of attendees
  - Volunteer interest
- Optional fields:
  - Kids count
  - Dietary notes
  - Donation intent
  - Additional notes
- Submit behavior:
  - Save RSVP.
  - Show a success message.
  - Send a confirmation email.
- The form should support multiple upcoming events, not just one hardcoded event.

## RSVP Admin
- Add an admin table for RSVP submissions.
- Include search and filtering.
- Include basic export support if the implementation path stays simple.
- Admin should be able to review RSVPs without digging through raw data.

## Content And Proof
- Use photo placeholders for event photos until real assets are added.
- Make room for future partner or media proof if it becomes available.
- Keep the content centered on the association's real work, not generic community copy.

## Non-Goals
- No news system.
- No full community platform rewrite.
- No homepage RSVP form.

## Acceptance Criteria
- A first-time visitor can understand what the association does in under 10 seconds.
- The page feels more credible than a basic event flyer.
- The homepage clearly pushes people toward Events and RSVP.
- RSVP data is stored separately from events.
- Admin can manage RSVP submissions from a dedicated view.

## Open Decisions
- Final photo set.
- Final copy for the mission and volunteer sections.
- Email provider implementation details.