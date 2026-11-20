---
name: prd-generator
description: 'Produces production-ready Product Requirements Documents (PRDs) for software systems and AI-powered features: problem framing, measurable outcomes, scoped functionality, testable requirements, explicit risks and assumptions. Use when turning a vague product idea into an implementation-ready specification, aligning stakeholders before development, or documenting requirements for AI/ML-enabled systems. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 📄 PRD Generator

Produces PRDs that serve as a single source of truth for product, design, engineering, QA, and leadership. Supports traditional software and AI-driven products. The PRD is a living, versioned artifact — and it is never generated immediately from a single prompt.

## 🎯 When to Use

- "write a PRD", "define requirements", "plan a feature"
- turning a vague idea into an implementation-ready specification
- aligning multiple stakeholders before development
- documenting requirements for AI/ML-enabled systems

## 🔄 Operational Workflow

### Phase 0: Strategy selection

Classify the PRD before discovery to adapt structure and rigor: product stage (MVP / Growth / Scale), risk level (Low / Medium / High), AI criticality (None / Supporting / Core), primary audience (Engineering / Product / Exec / External).

### Phase 1: Discovery — structured elicitation

Ask clarifying questions (Who / What / Why / When / How), only where the answer would change the PRD:

1. **Problem & context** — what problem, and why now?
2. **Users & value** — primary users and the outcome they care about
3. **Success & measurement** — how success is measured; what "good" looks like
4. **Constraints** — deadlines, budget, stack, compliance
5. **Stakeholders** — who needs alignment or approval

When answers are unavailable, record gaps as explicit **Assumptions** entries and proceed.

### Phase 2: Draft the PRD

Mandatory section order: title/metadata (version, status, owner, date) → problem statement & why now → goals and success metrics → users and personas → scope (in/out, non-goals) → functional requirements with IDs → non-functional requirements (performance, security, a11y, observability) → acceptance criteria per requirement (testable, Given/When/Then where useful) → AI/ML section when AI is supporting or core (evals, guardrails, data, model, monitoring) → UX/flow notes → risks with mitigations → open questions → appendix (glossary, references).

### Phase 3: Self-review

- [ ] all success metrics measurable
- [ ] assumptions explicitly listed
- [ ] non-goals clearly stated
- [ ] risks include mitigations
- [ ] requirements testable
- [ ] no undefined terms

## ⭐ Quality Standards

- **Measurable requirements** — never "fast", "easy to use", "high quality". Instead: "P95 latency ≤ 200ms for 10k records", "≥90% precision on benchmark queries".
- **Testability by design** — every major requirement states how it will be validated, what can be automated, what signals indicate failure. AI systems must define offline evaluation and runtime monitoring.
- **Iteration rules** — version the PRD, incorporate feedback from product/engineering/QA/stakeholders, revisit assumptions as new information emerges.

## ✅ Definition of Done

- the PRD follows the mandatory schema, in order
- every requirement is measurable and testable
- assumptions, risks (with mitigations), and non-goals are explicit
- AI/ML sections present when AI is a supporting or core capability
- the self-review checklist passes

## 🔗 Related Skills

- `requirements-traceability` — map the finished PRD to test coverage
- `test-planning` — expand the PRD into concrete test scenarios
- `quality-gates` — acceptance criteria become release evidence
