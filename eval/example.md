# Worked example — plain Claude vs latticework

One judgment call, answered two ways. The question is a second-order trap with a
one-way door — the kind of decision the ladder is built for.

> **Should we cut our free tier to push more users to paid?**

---

## Plain Claude

Cutting the free tier is a significant lever with real trade-offs.

**Pros:** higher revenue per user, lower infrastructure and support cost for
non-paying accounts, sharper focus on paying customers, and potentially higher
perceived value of the product.

**Cons:** free tiers often drive top-of-funnel acquisition and word-of-mouth, so
removing one can shrink your lead pipeline; existing free users may churn or move
to a competitor; and there's brand and community goodwill risk.

It really depends on what role the free tier plays for you. If it's mostly a cost
center with low conversion, limiting or cutting it makes sense. If it's a major
acquisition channel, cutting it could hurt growth. I'd recommend looking at your
free-to-paid conversion rate and the acquisition attributable to free users, and
running a limited paywall test before committing to a full cut. A freemium-to-trial
model could be a middle path worth considering.

---

## Latticework

The stated question is "should we cut the free tier?" The real one hiding inside
it: *is the free tier a cost we're subsidizing, or the acquisition engine we're
about to amputate?* "Cut it" smuggles in the assumption that free users are a
drain. Until we know what share of paid conversions and referrals originate as
free users, the question isn't answerable.

General SaaS funnel dynamics are solid ground. Your specific conversion and
attribution numbers — I don't have them, and I'll flag that the whole call hinges
on them rather than guess.

Cut free → signups fall immediately. First-order, that looks fine if those users
weren't converting. And then what? If free→paid is a meaningful share of new paid
customers, paid signups decline **on a lag of one sales cycle** — you feel it
next quarter, not this one. Fewer free users → less word-of-mouth, weaker
community/SEO/integration footprint → acquisition cost rises across *every*
channel as the organic top of funnel dries up. The revenue bump is immediate and
visible; the pipeline damage is delayed and gets blamed on "the market," not the
cut.

Assume it's two quarters out and this failed. Why? Paid signups quietly fell
because a large share of them used to start free. CAC on paid channels rose
because the free base had been feeding referrals and organic discovery. And we
can't walk it back cheaply — the free users who left went to a competitor and
won't return. The killer: the free tier *was* the acquisition channel, mislabeled
as a cost line.

**Don't cut the free tier wholesale** — it's a likely one-way door with a delayed
failure mode, which is the worst combination. Measure first: free→paid conversion
and the share of paid/organic acquisition attributable to free users. Gate cost,
not access — cap the expensive parts rather than removing the tier. Test
downstream, not just upstream — paywall one cohort and watch paid signups over a
full sales cycle.

I'd change my mind if free→paid conversion *and* free-attributed acquisition both
turn out negligible — then cutting is clean.

---

## What changed

| Dimension | Plain | Latticework |
|-----------|-------|-------------|
| Reframes the real question | Accepts "cut vs keep" | "Cost sink or acquisition engine?" |
| Consequence depth | Names funnel risk as one bullet | Traces the lagged pipeline collapse and CAC rise |
| Failure-mode specificity | Generic "could hurt growth" | Names the specific killer and timeline |
| Committed call + tripwire | "It depends, run a test" | "Limit, don't kill" + the data that flips it |
| Honest uncertainty | Implies a test would help | Flags missing numbers as the hinge point |

The plain answer is competent and balanced. The latticework answer finds the
hidden assumption, traces the delayed damage, names the specific failure mode,
commits to a call, and states what would change it.

## When this doesn't apply

The same discipline applied to "what's the difference between TCP and UDP?" or
"rename this variable" would be pure overhead. The ladder's first instruction is
"judgment calls only; for lookups, answer directly." This example shows the
upside on a genuine judgment call. The guardrail prevents the downside on
everything else.
