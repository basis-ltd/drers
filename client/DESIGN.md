# DESIGN.md

> Canonical design and implementation guide for all contributors and coding agents working on this codebase.
>
> **Status:** Draft v1  
> **Applies to:** Product design, frontend implementation, dashboard work, component design, UX writing, data visualization, accessibility, and QA  
> **Primary brand color:** `#021b2f`  
> **Base background:** `#FCFCFF`

---

## 1. Purpose of this document

This file defines the **non-negotiable design system and implementation standards** for the platform moving forward. Every human contributor and every coding agent must use this document as the source of truth when designing or implementing user-facing experiences.

The goal is to ensure that the product feels:

- Academic
- Trustworthy
- Calm
- Minimal
- Structured
- Review-oriented
- Consistent across all pages and flows

This product supports research proposal submission and review. The interface must therefore communicate **rigor, clarity, safety, and professionalism**, not consumer-app excitement or startup-style visual noise.

---

## 2. Product design philosophy

### 2.1 Core product personality

The platform should feel like:

- a serious institutional tool
- built for researchers, reviewers, administrators, and committee members
- quiet in tone
- confident in hierarchy
- rich in information without feeling dense
- modern, but never trendy
- elegant, but never decorative

### 2.2 Design keywords

All work should be optimized for the following qualities:

- **Institutional**
- **Precise**
- **Readable**
- **Calm**
- **Minimal**
- **Layered**
- **Accessible**
- **Data-forward**
- **Low-cognitive-load**

### 2.3 What this product is not

Do **not** make the platform feel like:

- a fintech dashboard
- a gaming UI
- a crypto product
- a social app
- a glossy startup landing page
- a neon “AI tool”
- a highly animated SaaS admin panel

Avoid visual overstatement, excessive gradients, loud shadows, shiny glassmorphism, or decorative illustrations inside core workflows.

---

## 3. Brand foundation

## 3.1 Primary colors

These values are the core of the system.

- **Primary / Brand Ink:** `#021b2f`
- **Secondary Accent:** `#0d314b`
- **Background / Canvas:** `#FCFCFF`

These colors should define the overall tone of the application.

## 3.2 Recommended supporting palette

The implementation should derive supporting tokens from the primary and background colors rather than introducing unrelated hues.

### Core neutrals

- `--bg-canvas: #FCFCFF`
- `--bg-surface: #FFFFFF`
- `--bg-surface-muted: #F7F8FC`
- `--bg-surface-subtle: #F2F4F8`
- `--border-soft: #E6EAF0`
- `--border-strong: #D7DDE7`
- `--text-primary: #0F172A`
- `--text-secondary: #475569`
- `--text-muted: #64748B`
- `--text-disabled: #94A3B8`

### Brand scale

Derived from `#021b2f`:

- `--brand-950: #021b2f`
- `--brand-900: #03253f`
- `--brand-800: #0b3351`
- `--brand-700: #134566`
- `--brand-600: #1A5678`
- `--brand-500: #2D6A8C`
- `--brand-400: #4C87A8`
- `--brand-300: #84B3CF`
- `--brand-200: #BDD8E8`
- `--brand-100: #E8F2F8`

### Secondary accent

- `--secondary-accent: #0d314b` — used for interactive highlights, hover states, and complementary brand treatments

### Semantic colors

Use semantic colors sparingly and in muted forms that fit the academic tone.

#### Success
- text: `#0F6B46`
- bg: `#EAF7F0`
- border: `#B7E2C8`

#### Warning
- text: `#8A5A00`
- bg: `#FFF6E5`
- border: `#F3D89B`

#### Danger
- text: `#A33232`
- bg: `#FDEEEE`
- border: `#F0C5C5`

#### Info
- text: `#1D4E89`
- bg: `#EAF2FC`
- border: `#C8DAF2`

### Chart colors

Charts must stay restrained and readable. Recommended sequence:

1. `#0A3150`
2. `#2D6A8C`
3. `#5B6CFF`
4. `#3D8D6D`
5. `#E39B2D`
6. `#A855F7`
7. `#D96C4E`

Do not use oversaturated neon chart colors.

---

## 4. Visual rules

## 4.1 Minimalism standard

Minimalism here means:

- fewer visual ideas per screen
- clean grouping
- soft borders
- restrained color
- strong typography hierarchy
- meaningful whitespace
- consistent component rhythm

Minimalism does **not** mean:

- empty screens
- weak hierarchy
- tiny text
- hidden actions
- oversimplified workflows
- no labels
- excessive icon reliance

## 4.2 Surface model

Use a layered surface system:

1. **Canvas** — app background (`#FCFCFF`)
2. **Surface** — cards/panels (`#FFFFFF`)
3. **Subsurface** — inputs, row hovers, muted sections (`#F7F8FC`)
4. **Accent surface** — selected nav, status chips, informative banners

Cards should usually separate from the page through:

- subtle border
- low elevation
- moderate radius
- spacing

Do not rely on strong shadow alone.

## 4.3 Border strategy

Borders are preferred over heavy shadows.

Use:
- 1px soft borders on cards and panels
- stronger border only for selected/active/focus/error states
- row separators in dense tables

Avoid:
- thick strokes
- dark borders on light surfaces unless needed for accessibility
- stacked borders that create visual noise

## 4.4 Corner radius

Use a restrained radius system:

- `6px` for pills, badges, small controls
- `10px` for inputs and buttons
- `14px` for cards
- `18px` only for high-level containers if necessary

Do not mix too many radii.

## 4.5 Shadow system

Use soft, low-contrast shadows only.

Recommended:
- cards: very soft elevation
- floating menus/dialogs: moderate elevation
- sticky elements: soft shadow + border

Avoid:
- dark blurred dropshadows
- layered glows
- dramatic hover shadows

---

## 5. Typography

## 5.1 Tone of typography

Typography should feel:

- disciplined
- editorial
- serious
- clear
- neutral

## 5.2 Recommended font approach

Preferred stack if available:

- `Inter`
- `Geist`
- `IBM Plex Sans`
- system sans-serif fallback

For data-heavy areas, tabular numerals should be enabled where possible.

## 5.3 Type scale

Recommended sizes:

- Display / page hero: `32px / 40px`
- Page title: `28px / 36px`
- Section title: `20px / 28px`
- Card title: `16px / 24px`
- Body default: `14px / 22px`
- Dense body/table: `13px / 20px`
- Caption/meta: `12px / 18px`
- Overline/eyebrow: `11px / 16px`

## 5.4 Weight usage

Use weight intentionally:

- 600–700 for page titles
- 600 for section and card headings
- 500 for labels and tabs
- 400–500 for body copy
- avoid overusing bold inside tables

## 5.5 Text color rules

- Primary text: for headings, values, important labels
- Secondary text: for descriptions and metadata
- Muted text: timestamps, helper text, low-priority details
- Never reduce contrast so far that text becomes faint or decorative

---

## 6. Spacing system

Use an 8px grid.

Core scale:
- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`
- `48`
- `64`

### Rules
- Inner card padding should usually be `20–24px`
- Page section spacing should be `24–32px`
- Tight related elements should sit at `8–12px`
- Avoid random spacing values unless justified

Consistency in spacing matters more than perfect visual experimentation.

---

## 7. Layout principles

## 7.1 Overall shell

Default app shell should use:

- fixed or sticky left sidebar
- top utility/header zone where relevant
- main content constrained by max width
- generous breathing room on desktop

## 7.2 Desktop structure

For dashboard pages, preferred pattern:

- top summary header
- row of KPI cards
- primary analytics section
- secondary supporting panels
- recent activity or records table
- sidebar insights / highlights section

## 7.3 Content width

Recommended:
- max content width between `1280px` and `1440px`
- internal panels aligned to a shared grid
- wide tables can expand, but should remain contained and readable

## 7.4 Grid

Use a disciplined 12-column layout where appropriate.

Typical dashboard split:
- main content: 8 columns
- side insights: 4 columns

Alternative:
- main: 9
- side: 3

Avoid awkward uneven layouts without a clear reason.

---

## 8. Sidebar design guidelines

The sidebar must be improved and standardized across the codebase.

## 8.1 Sidebar role

The sidebar is for:

- primary navigation
- role context
- user context
- session/account actions

It is not for excessive badges, noise, or marketing.

## 8.2 Sidebar visual style

Recommended sidebar rules:

- background based on `#021b2f`
- slightly lighter inner states for hover/active
- crisp but subtle divider lines
- icons should be simple outline icons
- active item should use a filled or tinted brand treatment
- typography must remain readable against dark background

## 8.3 Sidebar layout structure

Preferred order:
1. brand block / product identity
2. primary nav
3. optional workspace switcher or role context
4. utility nav if needed
5. user card
6. logout / account action

## 8.4 Sidebar state styling

### Default item
- transparent background
- high-contrast text
- muted icon

### Hover
- subtle tinted surface
- slightly brighter icon/text

### Active
- stronger surface fill
- left accent or inset highlight optional
- icon and label clearly elevated

### Do not
- use glowing active states
- use bright gradients
- use thick pills for every nav item
- collapse hierarchy into ambiguous icon-only nav without tooltip support

---

## 9. Header and page intro

Each major page should begin with a clear header that may include:

- eyebrow / section label
- page title
- short supporting description
- contextual status pill if needed
- top-right actions

### The page intro must answer:
- where am I?
- what am I looking at?
- what actions matter most?
- what context or role is active?

---

## 10. KPI card system

## 10.1 Purpose

KPI cards are for high-level, scannable status. They should never become cluttered mini-pages.

## 10.2 KPI card anatomy

A good KPI card includes:

- icon or small visual marker
- label
- primary number
- short support line
- trend delta or comparison pill
- optional timeframe

## 10.3 Card design rules

- use white surface
- soft border
- consistent padding
- restrained icon background
- large value with strong hierarchy
- trend indicator should be readable but not loud

## 10.4 Trend treatment

Trend examples:
- `+20% vs last 30 days`
- `-10% vs previous review cycle`

Display rules:
- positive: success semantic styling
- negative: danger or warning depending on meaning
- neutral: muted text
- always provide context for the change

Do not show meaningless percentages without baseline or timeframe.

---

## 11. Charts and data visualization

## 11.1 General chart philosophy

Charts exist to support decisions, not decoration.

Every chart must answer a question.

Examples:
- Are submissions increasing?
- Where are records bottlenecking?
- Which statuses dominate?
- Are review cycles improving over time?

## 11.2 Chart styling rules

- minimize visual clutter
- keep gridlines soft
- keep labels readable
- use 2–4 series max per chart where possible
- use direct legends or clear labels
- avoid overanimation
- never use 3D charts

## 11.3 Line charts

For line charts:
- use clean strokes
- use distinct but muted colors
- use subtle markers only if needed
- allow comparison across time without crowding

Recommended usage:
- submissions over time
- review velocity
- average decision cycle
- weekly or monthly proposal movement

## 11.4 Donut / distribution charts

Use donut charts sparingly.

Only use when:
- category count is small
- part-to-whole view is meaningful
- labels can remain legible

When there are many statuses, consider bar charts instead.

## 11.5 Chart container anatomy

A chart panel should include:
- title
- timeframe selector if needed
- chart
- summary metrics underneath or alongside
- optional insight sentence

## 11.6 Empty and low-data charts

If data is insufficient:
- do not fake density
- show a useful empty state
- explain what will populate the chart

---

## 12. Tables and records

Research systems are table-heavy. The table system must be exceptionally clean.

## 12.1 Table principles

Tables should feel:
- structured
- readable
- sortable
- consistent
- not cramped

## 12.2 Table styling rules

- clear header row
- subtle dividers
- consistent row height
- enough padding for scanability
- numeric columns aligned consistently
- status columns visually distinct but not loud

## 12.3 Recommended row content

For proposal tables, useful fields may include:
- reference
- title
- principal investigator / unit
- type
- pathway
- status
- assigned reviewer
- submitted date
- updated date

## 12.4 Row interaction

Use:
- subtle hover
- clear click target when rows are interactive
- optional kebab menu for row actions
- selection checkbox only when bulk actions exist

Avoid:
- hidden primary action
- overloaded action columns
- too many status badges

## 12.5 Dense information handling

If titles are long:
- allow 2-line wrap where needed
- preserve scanability
- keep metadata smaller and secondary

---

## 13. Status system

Statuses are critical in a review workflow. They must be consistent everywhere.

## 13.1 Status style

Each status should have:
- consistent label text
- consistent semantic meaning
- consistent color treatment
- soft tinted background
- medium-contrast text
- rounded badge or pill

## 13.2 Suggested status examples

- Draft
- Submitted
- Screening
- Under Review
- Query Raised
- Applicant Responded
- Meeting Scheduled
- Approved
- Conditionally Approved
- Rejected
- Archived

## 13.3 Rules

- do not invent new labels casually
- do not use two labels for the same meaning
- define all statuses centrally in code
- status color mappings must be token-based

---

## 14. Forms and workflow pages

Proposal submission and review flows must feel clear, calm, and reliable.

## 14.1 Form principles

- one clear purpose per screen
- obvious progress indication for multi-step flows
- concise labels
- helpful helper text
- validation should be immediate where useful, but not intrusive

## 14.2 Input styles

Inputs should use:
- white or near-white surface
- soft border
- 10px radius
- clear focus ring
- readable text size
- sufficient vertical padding

## 14.3 Focus styling

Focus must be unmistakable.

Recommended:
- border-color from brand scale
- soft outer ring from `--brand-200` or equivalent
- maintain high visibility without harsh neon

## 14.4 Validation

Error state should include:
- field-level message
- clear border change
- icon optional
- constructive copy

Example:
- Bad: “Invalid”
- Better: “Enter a valid ethics approval number.”

## 14.5 Multi-step forms

Use a visible stepper when a form is broken into stages. Each step should have:
- short label
- state indicator
- current step emphasis

Users should always know:
- where they are
- what remains
- what is required before submission

---

## 15. Buttons and actions

## 15.1 Button hierarchy

Define only a few button levels.

### Primary
For the main action on a screen.  
Use brand background and high contrast text.

### Secondary
For important but non-primary actions.  
Use white/tinted background with border.

### Tertiary / Ghost
For quiet actions.  
Use text-only or very light surface.

### Destructive
Reserved for dangerous actions only.

## 15.2 Rules

- one primary action per region if possible
- avoid multiple competing primaries
- keep labels action-oriented
- never rely on icon-only buttons unless universally obvious and accessible

## 15.3 Button copy

Good:
- Submit proposal
- Save draft
- Assign reviewer
- Send query
- View application

Bad:
- Continue
- Proceed
- Click here
- Do action

---

## 16. Icons

Use icons as support, not as the primary communication method.

Rules:
- simple stroke-based icon set
- consistent size
- pair icons with labels in navigation and complex actions
- avoid decorative icon backgrounds unless they help grouping
- do not mix icon styles

---

## 17. Motion and animation

Motion should be restrained and purposeful.

## 17.1 Allowed motion

- subtle hover transitions
- accordion expand/collapse
- modal fade/scale
- chart draw-in if minimal
- skeleton to content transition

## 17.2 Avoid

- bouncing cards
- excessive slide-ins
- animated counters everywhere
- rotating loaders as decorative features
- motion that slows workflow

## 17.3 Timing

Recommended motion durations:
- micro interactions: `120–180ms`
- panel transitions: `180–240ms`
- overlays: `200–260ms`

Use easing that feels calm, not springy.

---

## 18. Accessibility requirements

Accessibility is mandatory.

## 18.1 Contrast

All text, controls, and chart elements must meet contrast requirements appropriate to their size and role.

## 18.2 Keyboard support

All key workflows must support keyboard access:
- navigation
- menus
- dialogs
- form completion
- table interaction where relevant

## 18.3 Focus order

Focus order must be logical and follow the visual flow.

## 18.4 Labels

Every interactive control must have:
- accessible name
- visible label or equivalent aria label
- clear state when selected/disabled

## 18.5 Charts accessibility

Charts should provide:
- accessible summary text
- visible legend or labels
- table alternative when appropriate

## 18.6 Error accessibility

Validation messages must be programmatically associated with fields.

---

## 19. Responsive behavior

The platform is desktop-first, but responsive behavior must remain disciplined.

## 19.1 Breakpoint strategy

Suggested breakpoints:
- mobile: `< 640px`
- tablet: `640–1023px`
- desktop: `1024px+`
- wide desktop: `1440px+`

## 19.2 Dashboard adaptation

On narrower widths:
- KPI cards wrap
- side panels stack below main content
- wide tables become horizontally scrollable or adapt with progressive disclosure
- sidebar may collapse to icon rail or drawer

## 19.3 Mobile rules

Do not simply shrink desktop screens. Recompose them.

Prioritize:
- page title
- status
- primary actions
- compact summary
- key records

---

## 20. Content and UX writing

The voice of the product should be:

- professional
- direct
- respectful
- precise
- unembellished

## 20.1 Writing rules

- prefer short sentences
- avoid hype language
- use institutional vocabulary only when useful
- explain workflow states clearly
- avoid slang and marketing tone

## 20.2 Examples

Good:
- “2 proposals require response.”
- “Your application is under review.”
- “Review meeting scheduled for 24 May.”

Bad:
- “Great news! Your journey is progressing.”
- “Awesome, you’re all set!”
- “Let’s get started!”

---

## 21. Empty states, loading states, and errors

## 21.1 Empty states

Each empty state should answer:
- what is missing
- why it is empty
- what the user can do next

## 21.2 Loading states

Use skeletons for:
- cards
- tables
- charts
- detail sidebars

Skeletons should resemble final layout and avoid excessive shimmer.

## 21.3 Error states

Errors should be:
- specific
- actionable
- calm
- non-alarming unless severe

Example:
- “We couldn’t load reviewer assignments. Try again.”
- not “Something went wrong.”

---

## 22. Implementation rules for coding agents

This section is mandatory.

## 22.1 Agents must not freestyle the UI

Do not invent:
- new spacing systems
- new color palettes
- new chart styles
- new border radii
- new status colors
- new button hierarchy
- new card patterns

Unless explicitly requested and approved, use this document.

## 22.2 Before implementing a new page

Every agent should identify:

1. page type
2. user role
3. primary task
4. information hierarchy
5. whether a known pattern already exists
6. which components can be reused

## 22.3 When implementing a component

Agents must define:
- purpose
- props
- states
- accessibility requirements
- responsive behavior
- loading behavior
- empty/error behavior

## 22.4 Component-first policy

Build reusable components before page-specific one-offs when patterns are likely to recur.

Examples:
- KPI card
- status badge
- chart panel
- detail section
- data table shell
- empty state
- sidebar nav item
- info banner
- stat summary block

## 22.5 Token-first styling

All visual implementation should use tokens or variables.

Never hardcode colors repeatedly inside components.

Required categories:
- color tokens
- spacing tokens
- typography tokens
- radius tokens
- shadow tokens
- z-index layers
- motion durations

## 22.6 One source of truth

Create and maintain centralized definitions for:
- statuses
- chart colors
- spacing scale
- nav item states
- button variants
- table row sizes

---

## 23. Recommended design tokens

```css
:root {
  --color-brand-950: #021b2f;
  --color-brand-900: #03253f;
  --color-brand-800: #0b3351;
  --color-brand-700: #134566;
  --color-brand-600: #1A5678;
  --color-brand-500: #2D6A8C;
  --color-brand-200: #BDD8E8;
  --color-brand-100: #E8F2F8;

  --color-secondary-accent: #0d314b;

  --color-bg-canvas: #FCFCFF;
  --color-bg-surface: #FFFFFF;
  --color-bg-surface-muted: #F7F8FC;
  --color-bg-surface-subtle: #F2F4F8;

  --color-border-soft: #E6EAF0;
  --color-border-strong: #D7DDE7;

  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;
  --color-text-disabled: #94A3B8;

  --color-success-text: #0F6B46;
  --color-success-bg: #EAF7F0;
  --color-success-border: #B7E2C8;

  --color-warning-text: #8A5A00;
  --color-warning-bg: #FFF6E5;
  --color-warning-border: #F3D89B;

  --color-danger-text: #A33232;
  --color-danger-bg: #FDEEEE;
  --color-danger-border: #F0C5C5;

  --color-info-text: #1D4E89;
  --color-info-bg: #EAF2FC;
  --color-info-border: #C8DAF2;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 6px 18px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.08);
}
```

---

## 24. Dashboard reference standard

The dashboard should generally include these zones when relevant:

1. **Page intro**  
   Context, role, status, top actions

2. **KPI summary row**  
   Top-level metrics with trends

3. **Primary analytics**  
   Line chart or key trend panel

4. **Distribution / secondary summary**  
   Donut, bar chart, or categorical status split

5. **Recent records**  
   Latest applications, reviews, or updates

6. **Highlights / notices**  
   Key system notes, role issues, attention areas

7. **Supplementary trends**  
   Smaller sparkline cards or operational summaries

### Dashboard design rules

- Prioritize the line chart as the main analytics view
- Use the sidebar to reinforce navigation clarity
- Avoid overfilling the right-hand side with too many mini widgets
- Let one or two panels dominate, not five equal noisy boxes
- Each panel should have a clear title and reason to exist

---

## 25. Sidebar redesign standard

All future sidebar redesigns should follow these directives:

### Must include
- strong brand presence
- clean dark foundation using `#021b2f`
- well-spaced nav
- obvious active state
- user identity block
- session action near bottom

### Should include
- optional thin separators
- slightly elevated active nav background
- simple role label
- icon + text pairing
- comfortable click targets

### Must avoid
- overcrowding
- tiny icons
- arbitrary badges
- multi-color nav items
- overrounded pills for everything
- floating unrelated controls without context

---

## 26. Page-specific notes for research workflow products

Because this is a research and ethics context, design must actively support:

- document-heavy workflows
- decision transparency
- review accountability
- status clarity
- traceability
- administrative confidence

This means:
- timestamps matter
- status progression matters
- identity and assignment matter
- exact wording matters
- auditability matters

Design patterns should make these easy to inspect.

---

## 27. Component checklist

Every reusable component should document:

- name
- purpose
- when to use it
- when not to use it
- supported variants
- supported sizes
- required props
- optional props
- loading state
- empty state if applicable
- error state if applicable
- accessibility requirements
- examples

---

## 28. PR checklist for design-affecting changes

Any agent or contributor making UI work should verify:

- [ ] follows token system
- [ ] uses approved palette
- [ ] respects spacing scale
- [ ] matches typography hierarchy
- [ ] has accessible contrast
- [ ] has focus states
- [ ] has loading/empty/error handling
- [ ] supports responsive layout
- [ ] does not introduce one-off visual patterns
- [ ] reuses existing components where possible
- [ ] preserves academic minimalism
- [ ] keeps charts and tables readable
- [ ] includes semantic status usage
- [ ] does not add unnecessary motion

---

## 29. Anti-patterns

Agents must avoid the following:

- full-glassmorphism interfaces
- harsh drop shadows
- neon accent colors
- multi-gradient cards
- excessive border radii
- icon overload
- too many colored badges
- tiny light-gray text
- low-contrast charts
- crowded header controls
- equal emphasis on all content blocks
- fake metrics or decorative data
- oversaturated success/warning/danger colors
- generic CTA labels
- animated dashboards for no reason

---

## 30. Definition of done for UI implementation

A UI task is not complete unless:

1. it matches the design system
2. it is accessible
3. it is responsive
4. it handles real data states
5. it includes interaction states
6. it avoids one-off styling
7. it is consistent with existing product patterns
8. it supports the seriousness of the domain
9. it has been visually reviewed in context
10. it could be extended by another agent without confusion

---

## 31. Suggested next files to create in the codebase

To operationalize this document, the codebase should also maintain:

- `design-tokens.(ts|js|json|css)`
- `status-map.(ts|js)`
- `chart-theme.(ts|js)`
- `sidebar-config.(ts|js)`
- `components/`
  - `KpiCard`
  - `StatusBadge`
  - `ChartPanel`
  - `DataTable`
  - `PageHeader`
  - `EmptyState`
  - `InfoBanner`
  - `SidebarNav`
- `UX_COPY.md`
- `ACCESSIBILITY.md`

---

## 32. Final directive to all agents

When implementing anything visual in this repository:

- Start from clarity
- Use the token system
- Keep the academic tone
- Prefer restraint over novelty
- Design for trust and reviewability
- Make dense information feel calm
- Reuse patterns before inventing new ones
- Treat this document as the baseline unless a newer approved version replaces it

---

## 33. Open questions requiring product clarification

The following decisions should be clarified before locking v2 of this document:

1. What frontend stack is the product using for implementation?
   - React?
   - Next.js?
   - Tailwind?
   - CSS Modules?
   - MUI or another component library?

2. Should the design system support both **light mode only** or **light + dark mode**?

3. What are the exact product roles that the interface must support?
   - Applicant
   - Reviewer
   - Admin
   - Committee member
   - Secretariat
   - Super admin

4. Is there an official brand font or should the codebase standardize on Inter?

5. Should data tables optimize more for:
   - dense institutional review workflows
   - or more spacious modern readability?

6. Do you want the sidebar to remain permanently expanded on desktop, or support a collapsed rail state?

7. Should charts use a fixed brand theme everywhere, or can some pages use semantic chart palettes based on status?

8. Do you want a separate section in this file for:
   - component naming conventions
   - frontend folder structure
   - Tailwind utility rules
   - motion tokens
   - chart library implementation guidance

9. Should proposal detail pages follow a tabbed layout, sectioned long-form layout, or split-view review layout?

10. Do you want this document expanded into a full design system package with example components and implementation snippets?

---

## 34. Versioning

- v1: Initial extensive foundation based on current dashboard direction, requested academic minimalism, and approved palette direction.
- v2: Primary color updated to `#021b2f`, secondary accent added as `#0d314b`. Example prompts section added.
- Future revisions should be additive and documented clearly.

---

## 35. Example agent prompts

Use these prompts as templates when asking a coding agent to build UI for this product. They encode the correct colors, tokens, and constraints.

### Quick color reference

```
Background:  #FCFCFF
Text:        #0F172A
Primary:     #021b2f
Secondary:   #0d314b
Border:      #E6EAF0
```

### Example prompts

1. "Build a hero section with a `#FCFCFF` background, Work Sans heading in `#021b2f`, and a `#021b2f` CTA button with 10px radius."
2. "Create a pricing card using background `#FFFFFF`, border `#E6EAF0`, Work Sans body text, and 20px padding."
3. "Design a navigation sidebar — `#021b2f` background, `#f3f7fb` links, `#0d314b` tint for active/hover state."
4. "Build a feature grid with 3 columns, 12px gap, each card using white surface, soft border `#E6EAF0`, and 14px radius."
5. "Create a page header with `#FCFCFF` background, `#021b2f` heading, `#475569` supporting description, and `#021b2f` primary action button."
6. "Build a KPI card — white surface, `#E6EAF0` border, `#021b2f` value text, `#64748B` label, `#0d314b` trend highlight."
7. "Design a status badge pill — soft tinted background matching the status semantic color, 6px radius, medium-contrast text."
8. "Create a data table — `#FCFCFF` canvas, `#FFFFFF` row surface, `#E6EAF0` row dividers, `#0d314b` sorted-column indicator."

