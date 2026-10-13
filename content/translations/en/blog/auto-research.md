---
title: "In the Auto-Research era, a PhD may no longer be a good choice"
description: "I used to be eager to pursue a PhD. Auto-Research made me reconsider: here is my rationale, followed by systematic objections and assessments."
---

I used to be very eager to pursue a PhD. After seeing [Auto-Research](https://github.com/karpathy/autoresearch), however, I no longer think it is a good choice. Here is my rationale:

1. **The decisive factor shifts from intelligence to compute.** Research output = intelligence × compute. Differences in compute are orders of magnitude greater than differences in intelligence, making compute the admission ticket.
2. **The divide within PhD programs grows.** The gap widens between top groups with strong compute and infrastructure and ordinary groups without them. The ordinary PhD path offers declining value for its cost.
3. **Small groups’ “agility” and “taste” lose out to compute.** High-value research activities—evaluation design, eliminating wrong directions, and choosing problems—require experiments. Compute bottlenecks cap what small groups can achieve.

---

## I. Why Auto-Research shifts the decisive factor from intelligence to compute

### 1. Ideas are no longer scarce; validation is the bottleneck

**The old world:**

- Coming up with a clever idea is difficult and requires exceptional intelligence.
- Validating it is also difficult: coding, tuning, and experiments take weeks.
- Because validation is expensive, intelligence must first filter out 99% of bad ideas so only the remaining 1% are tested. **Intelligence is the gatekeeper.**

**The new world of Auto-Research:**

- Producing ideas becomes extremely easy. An agent can generate 1,000 ideas in a second.
- Validation still requires experiments, but agents can run them in parallel, 100 times faster than people.
- If agents can search exhaustively, what is needed is enough compute to finish those 1,000 experiments rather than a clever filter.

### 2. Brute-force search beats intuitive leaps

Human scientists rely on heuristics, using experience to skip paths that “look unlikely to work.” This is a **low-compute, high-intelligence** search strategy.

Auto-Research relies on brute-force search. It samples randomly, validates in parallel, retains high scores, and continues mutating, without caring whether a path looks promising.

In high-dimensional spaces such as neural-network architectures, prompts, and reward models, human intuition is often wrong. A path people consider impossible may turn out to score highest when an agent runs it.

**With enough compute, the probabilistic advantage of brute-force search overwhelms the advantage of human intuition.**

You only need more attempts, rather than greater intelligence.

### 3. Evaluation design becomes a compute arms race

When agents can generate ideas automatically, the competition becomes who can design a more robust evaluation environment that lets an agent keep hill-climbing without being diverted by reward hacking.

Evaluation design requires:

- More test sets: data.
- More baseline comparisons: experiments.
- More random seeds: statistical significance.
- More complex evaluation pipelines: engineering.

All of this consumes compute.

A small group may have a clever evaluation idea but cannot afford a 100-seed ablation. A large group can put 500 GPUs on it and produce results with absolute confidence.

**Faced with compute, ingenuity in evaluation design gives way to scale in evaluation execution.**

### 4. The explosion of the search space

AI research has an exponentially expanding search space: model architectures, hyperparameters, dataset combinations, prompt templates, and sequences of tool calls.

Human intelligence can explore only a tiny fraction, say 0.0001%. Auto-Research can explore a larger fraction, say 0.01%.

Although 0.01% is still tiny, it is 100 times greater than 0.0001%. Smarter people alone cannot close that coverage gap; more compute is needed.

### 5. The formula: intelligence is a multiplier, compute is what it multiplies

**Research output = intelligence × compute**

- Old world: compute is low, at 1; intelligence, at 100, determines the result, 100. Intelligence is decisive.
- New world: compute becomes a variable.
- Large group: intelligence (50) × compute (1,000) = 50,000.
- Small group: intelligence (100) × compute (10) = 1,000.

The difference in compute, 1,000 versus 10, far exceeds the difference in intelligence, 50 versus 100.

**Compute is the admission ticket; intelligence is an added bonus.**

---

## II. Diverging PhD paths and the Matthew effect

### 1. Auto-Research amplifies the advantages of large groups

[Automated Weak-to-Strong Researcher](https://alignment.anthropic.com/2026/automated-w2s-researcher/) and [ASI-Evolve](https://arxiv.org/html/2603.29640v1) indicate that once research tasks are outcome-gradable—with shared evaluations, repeatable experiments, shared findings, reusable snapshots, and staged screening—research increasingly resembles an engineered loop for parallel hill-climbing.

Large groups naturally have an advantage in this environment because they are more likely to have compute, data, evaluations, infrastructure, and high-quality judgment.

### 2. Small groups’ “agility” and “taste” are false premises

Many people think a small group is flexible, like a small boat that turns easily. In the AI era, however, turning means the same work:

- Large group: delete code, rerun experiments, get results in two days.
- Small group: delete code, rerun experiments, get results in two weeks, because GPUs and infrastructure are inadequate.

Small-group agility means little in the face of compute.

More importantly, high-value research activities require experiments:

- Sharper problem selection requires reviewing extensive literature and running many baselines.
- Better evaluation design requires building datasets and running many reliability checks.
- Faster elimination of wrong directions requires many parallel ablations.
- Greater density of human judgment still requires experiments to validate it, and validation needs compute.

**The underlying constraints are compute and experimental throughput, precisely what small groups lack most.**

### 3. Paper-oriented assessment deepens the divide

If PhD assessment continues to depend heavily on papers, while producing papers increasingly requires agent-assisted research pipelines, faster experiment loops, stronger evaluations, and larger trial budgets, the Matthew effect between large and small groups will strengthen. Research competition increasingly includes harnesses, evaluations, infrastructure, and feedback speed alongside clever ideas.

### 4. The PhD category will split internally

- A general, ordinary PhD without a distinctive working environment may lose signaling value.
- A PhD from a top group with strong supervision, infrastructure, taste, and networks may become more valuable.

As the bar rises, the market may be saying that ordinary papers are less scarce, while training close to models, systems, evaluations, and research infrastructure is more scarce, rather than that PhDs are useless.

---

## III. Criteria for deciding whether to pursue a PhD

Based on this analysis, the decision can be simplified as follows.

### Conditions under which you should pursue a PhD

- You can join a top large group with compute, infrastructure, and an automated research pipeline.
- You can stand on the shoulders of compute and turn intelligence into results.
- You can gain strong supervisory judgment, a high-quality research environment, and a strong network.

### Conditions under which you should not pursue a PhD

- Your only option is an ordinary small group lacking compute and infrastructure, relying on manual experiments.
- You will compete with other people’s GPU time using your own human time.
- You will pit a nineteenth-century workshop against a twenty-first-century AI production line.
- After several years, you will receive a credential that is no longer scarce.

---

## IV. Systematic objections and assessments

Below I challenge the argument point by point and assess each objection.

### Objection 1: the applicability of Auto-Research is overstated

**Objection:** The claim that “Auto-Research turns intelligence into compute” assumes that the task can be made outcome-gradable. Much genuinely high-value research does not meet this condition:

- Proposing entirely new problem frameworks rather than increasing scores on existing benchmarks.
- Opening new research fields and defining worthwhile questions.
- Transferring concepts across disciplines.
- Building a new theoretical language that makes a class of phenomena expressible.

These tasks lack a shared evaluation, a scorable feedback surface, and a clear hill-climbing target. Auto-Research may take over intermediate labor such as baseline runs, ablation sweeps, and hyperparameter tuning, rather than judgments about research direction. Intelligence would then remain decisive in problem definition, paradigm selection, and direction.

**Assessment: moderately credible, with an unstable boundary.**

The objection partly holds and identifies the current boundary: Auto-Research currently works best for outcome-gradable tasks. But its scope is expanding. As more problems become outcome-gradable through new benchmarks and evaluation frameworks, its reach will widen. The objection describes a boundary that may itself be unstable.

---

### Objection 2: the innovative ability of brute-force search is overestimated

**Objection:** Brute-force search covers more ground but lacks leaps. Agents optimize scores through hill-climbing, yet may struggle to make genuine paradigm breakthroughs:

- The shift from supervised learning to reinforcement learning.
- The architectural leap from RNNs to Transformers.
- The conceptual transition from fitting data to generating world models.

These are not breakthroughs one simply encounters by trying 1,000 times. They depend on conceptual reconstruction rather than search coverage. Brute force may be good at optimizing within a paradigm and poor at creating a new one.

**Assessment: reasonable, but the premise is demanding.**

This objection works for people who can genuinely create paradigm breakthroughs. The practical problem is that such breakthroughs are extremely rare. Most researchers optimize within existing paradigms. If 99% of research is hill-climbing within a paradigm, the objection applies only to the remaining 1%. For ordinary researchers, compute dominance still holds.

---

### Objection 3: access to compute may be democratized

**Objection:** The argument assumes a fixed distribution of compute, with large groups monopolizing it and small groups lacking it. Yet history shows cloud services lowering access barriers, open-source models reducing training costs, shared computing platforms emerging, and compute itself becoming cheaper. If compute grows more accessible, the durability of the advantage is questionable. It may resemble electricity: monopolized early, widespread later.

**Assessment: weakly persuasive.**

Historical analogies do show lower access barriers, but Auto-Research needs large-scale parallel compute rather than compute for a single inference. Cloud services have lowered inference costs without removing the cost of running 1,000 experiments in parallel. Open-source models have lowered training costs without removing the cost of a 500-seed ablation. Democratization means everyone can use compute; Auto-Research needs everyone to be able to use a lot of it. These are different things.

---

### Objection 4: reward hacking exposes a fundamental flaw in brute-force search

**Objection:** [Automated Weak-to-Strong Researcher](https://alignment.anthropic.com/2026/automated-w2s-researcher/) explicitly records failure modes: agents exploit dataset shortcuts, repeatedly try seeds and cherry-pick, leak test labels from remote APIs, and execute answers directly to bypass inference. Compute-driven hill-climbing can easily climb the wrong hill. Without strong human judgment to design evaluations, identify hacks, and correct direction, compute only accelerates mistakes. Intelligence is redefined from an engine for generating ideas into a guardrail against misdirected hill-climbing. The guardrail may be more valuable than the engine.

**Assessment: the most credible and genuinely effective challenge.**

It identifies the key point: compute accelerates hill-climbing but does not tell you which hill to climb. If evaluation design is flawed, more compute means faster reward hacking. Intelligence shifts toward evaluation design, hack detection, and choosing the right hill. Guardrails may be more valuable than the engine.

---

### Objection 5: the value of a PhD is reduced to one dimension

**Objection:** The argument reduces a PhD to paper-producing capability and derives compute determinism from it. A PhD may also train judgment about worthwhile questions, shape research taste, provide a long-term academic network, build reputation through supervisors and peers, and develop methods for experiments and ruling out wrong directions. These assets are not equivalent to paper counts and may last longer.

**Assessment: theoretically valid, but weakened by practical pressures.**

A PhD can provide judgment, networks, and reputation beyond papers. In practice, however, papers are explicit, hard assessment criteria, while the others are implicit, soft assets. Explicit metrics affect graduation, employment, a supervisor’s attitude, and peers’ perceptions. Implicit assets matter, but are difficult to establish if the explicit metrics collapse.

---

### Objection 6: counterexamples from historical analogy

**Objection:** The argument implies that Auto-Research resembles industrial production, small groups resemble workshops, and small groups are therefore doomed. Historical counterexamples exist: independent game developers survive AAA production through creativity and taste; independent films produce valuable work within Hollywood’s industrial system; boutique research groups sometimes beat large teams through sharp problem selection. During stable paradigms, industry overwhelms workshops. During paradigm turbulence, agility and taste may win. If AI research is in a turbulent paradigm, small groups may still have an advantage.

**Assessment: moderately to weakly persuasive.**

Independent games and films exist, but they rely on creative expression rather than engineering validation. Their evaluations—audience preferences—are ambiguous rather than shared benchmarks, and their competition is differentiated rather than homogeneous. AI research is highly engineered, with increasingly unified evaluations and homogeneous competition. These differences weaken the analogy.

---

### Objection 7: leverage can amplify intelligence

**Objection:** The argument treats intelligence as a simple multiplier in research output = intelligence × compute. Naval’s framework reminds us that judgment and taste can be amplified through media leverage, allowing an idea to spread at no marginal cost; code leverage, allowing a tool to be reused at no marginal cost; and network leverage, allowing good judgment to influence more decisions through reputation. Leveraged intelligence in a small group may match a large group’s compute. Intelligence can become an exponent as well as a multiplier.

**Assessment: reasonable, provided the intelligence is strong enough first.**

Naval’s framework does show that judgment can be amplified. The practical question is whether your judgment is strong enough to amplify. Leverage amplifies what is already scarce. If the judgment is weak, leverage only amplifies noise. This objection works for people with truly strong judgment, but not for people with ordinary judgment. Most people’s judgment is ordinary.

---

### Objection 8: small groups can avoid compute competition through non-consensus directions

**Objection:** Compute dominance occurs on consensus tracks: agreed problems, evaluations, and goals. In non-consensus directions—problems people have not recognized, evaluations not yet established, goals not yet formed—compute cannot act directly because there is no clear hill-climbing target. Small groups can use intelligence to open a new battlefield instead of competing on compute in a consensus field.

**Assessment: highly credible; it points to a real escape route.**

The objection holds and offers a strategic way forward for small groups. Compute dominance presupposes a clear target, agreed evaluations, and a stable problem framework. Where problems are not yet well defined, evaluations do not exist, and goals remain unclear, intelligence in problem definition, evaluation design, and direction still dominates. Small groups should open new ground in non-consensus directions instead of competing with large groups on compute in consensus fields.

---

### Objection 9: the infrastructure costs of large groups are underestimated

**Objection:** The argument assumes large groups naturally have strong infrastructure. Maintaining it is extremely costly: engineering staff, continuing investment, complex coordination, and potential lock-in to research that the infrastructure supports. The maintenance burden may cancel out the compute advantage.

**Assessment: weakly persuasive.**

Infrastructure maintenance does cost large groups, but those marginal costs are already spread out. The burden makes large groups more specialized rather than canceling their compute advantage. Lacking infrastructure is a disadvantage for small groups: it means more time reinventing tools instead of doing research.

---
