# Calendar Keeper

A weekly refresh ritual for the calendar at mind.curiosta.com/calendar. Run every Sunday evening, about twenty minutes. The calendar is a pointer to groups already running — not a booking platform. mind does not book, charge, or run sessions.

## The ritual

1. **Scan Gmail** for meetup notifications — Meetup, AllEvents, SoulUp, HappeningNext, Dharte, and any new sources that appear.
2. **Check known platforms directly** — SoulUp's Meetup page, Hugging Club of India, Vandrevala Foundation, MyndStories, Manotsava, Satarangisaathi.
3. **Verify each entry** — date, time, cost, format (online or in person), and that the link still works.
4. **Add new entries** in the one-line format with the right data attributes so the filters work.
5. **Move past entries to the archive** — never delete them. The archive proves the practice is recurring.
6. **Update the checked date** at the bottom of the page.

## Entry format

Date · emoji · bold name · format (online or place) · spell it connects to · link out.

Same shape as buildwith's Coming up list. No booking widget, no payment, no liability — just the pointer.

Example:

```html
<li class="cal-entry" data-spell="occlumency" data-cost="free" data-format="online"><span class="cal-date">Wed 14 Oct 2026</span> <span class="cal-emoji">🤗</span> <b>Weekly mental health session</b> — free, peer-led, volunteer psychiatrists and counsellors · <a href="https://huggingclubofindia.org/" rel="nofollow">Hugging Club of India</a></li>
```

## Data attributes

Every entry needs three attributes so the filters work:

- `data-spell` — one of: `patronus`, `occlumency`, `legilimency`, `priorincantatem`, `foundation`
- `data-cost` — `free` or `paid`
- `data-format` — `online` or `inperson`

## Spell mapping

- **Patronus** — memory work: processing avoided memories, grief, trauma
- **Occlumency** — emotional regulation: naming feelings, the pause before a spiral, anxiety, depression
- **Legilimency** — reading what's left out: abuse, manipulation, attachment, understanding others
- **Priori Incantatem** — tracing beliefs back to their source
- **The Foundation** — building understanding from observation: autism, ADHD, learning, identity

## Rules

- Never book or charge anything.
- Never invent a date you cannot verify.
- If a link is dead, mark it and drop it rather than guessing.
- If you cannot confirm a group's URL, use the platform's generic page and flag it.
- Keep the archive — a group that ran in March is still findable in October.
- One entry per meetup. Do not duplicate.

## Output

After the refresh: a short summary of what was added, what moved to the archive, and any dead links found. Then push to `main`.
