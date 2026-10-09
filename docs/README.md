# Planning documents (hackathon, April 2026)

These documents were written before and during the build and are kept as a record of the design process:

- `project_assumptions.md`: problem, actors, MVP scope, the 10 mandatory sections
- `user_stories.md`: MVP user stories
- `architecture.md`: single-page app, data flow, state, key technical decisions
- `analyst_instructions.md`: instructions of the role-requirements analyst (source of the 10 sections and the questions)
- `ai_prompt_strategy.md`: system prompt and example API call
- `claude_code_starter_prompt.md`: starter prompt used for AI-assisted development

**Plan vs implementation.** The plan assumed the Anthropic API (Claude). The implementation uses the OpenAI API (GPT-4o), see `brief-analyzer/src/App.jsx`. The rest of the design (no backend, stateless session, structured JSON output, 10 sections, follow-up questions) was implemented as planned.
