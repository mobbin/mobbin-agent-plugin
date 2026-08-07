---
name: mobbin-design-research
description: Use Mobbin for visual design research when a user asks for UI inspiration, screen references, flow examples, website sections, competitive patterns, or app-specific design examples. Choose the right Mobbin search tool, phrase focused queries, inspect returned images, and cite every screen recommendation.
license: MIT
---

# Mobbin design research

Use Mobbin when the task needs real-world UI references rather than generic design advice.

## Choose the search

- Use `search_screens` for one screen or UI state, such as a login screen, checkout screen, or
  empty state.
- Use `search_flows` for one multi-step journey, such as onboarding or checkout. Search separate
  journeys in separate calls.
- Use `search_sections` for one website section, such as a pricing page, hero section, footer, or
  signup form.

## Write the query

Describe one intent in plain language: what the user sees and how the elements relate. Be specific;
detail helps. Name a specific app when the user wants examples from that app. Use the tool's
dedicated parameters for platform and other filters instead of putting them in the query.

Keep queries focused. Search separate intents separately. Prefer concrete UI elements, content, and
actions over vague style words or disconnected keyword lists.

## Set the parameters

- `search_screens.platform` and `search_flows.platform` are required: use `ios` or `web`.
- `search_screens.mode` defaults to `deep`, an AI pipeline that interprets intent and re-scores
  candidates. Drop to `standard` when latency matters more than precision, and to `fast` for
  keyword-style lookups.
- Keep result limits low enough to inspect every returned image.
- Paginate `search_screens` with `exclude_screen_ids`, passing the IDs from earlier results.
- Paginate `search_flows` and `search_sections` with their `page` parameter.

## Evaluate and cite

Inspect the returned images before drawing conclusions or recommending a result. Use metadata to
filter and organize results, not as a substitute for visual inspection.

Every screen you mention must be a Markdown link to its returned `mobbin_url`. Cite flows and
sections with their returned Mobbin links when presenting them as references.
