---
title: "Designing systems for compounding information: Karpathy’s LLM Wiki and Yage’s context infrastructure"
description: "Both llm-wiki and context-infrastructure distill reusable signals from data. Their designs suggest making those signals the default starting point for future work."
---

## TL;DR

- llm-wiki and context-infrastructure are both systems for compounding information. The former distills knowledge into structures AI can reuse, creating a wiki knowledge index; the latter distills personal characteristics from life records, creating patterns of behavior and principles for action.
- By organizing external knowledge into a wiki and having AI answer questions over it, llm-wiki compounds knowledge structures. It also saves the mental effort of maintaining a knowledge base, allowing that effort to compound elsewhere.
- context-infrastructure distills a person’s behavioral patterns and principles from extensive life records accumulated over time. AI can work from those principles, producing another kind of compounding.
- The key is to distill signals that future work will use repeatedly and make them the default working surface in advance.

## 1. Introduction

I recently noticed similarities between Andrej Karpathy’s llm-wiki and Yage’s context-infrastructure. Analyzing their designs led me to some lessons about how data can compound.

llm-wiki is a pattern proposed by Andrej Karpathy; see the [karpathy/llm-wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). It inserts a wiki maintained continuously by an LLM between raw materials and the final question and answer. New material is read, synthesized, cross-linked, and gradually compiled into knowledge structures that can be reused over time, rather than simply indexed.

context-infrastructure is Yage’s public personal-agent working system. See the background essay, [“Why AI only says correct but empty things, and how to push it out of its comfort zone”](https://yage.ai/context-infrastructure.html), and the [grapeot/context-infrastructure repository](https://github.com/grapeot/context-infrastructure). It puts rules, memories, skills, periodic observations, and reflection tasks in one workspace. Its goal is to let an agent gradually inherit someone’s preferences, style, boundaries, and ways of judging through long-term collaboration, beyond merely knowing more.

Their shared theme is **distilling valuable information from data so it can compound and be reused**. Both challenge a default way of working: start again from raw materials for every question, have the model retrieve, assemble, and organize on the fly, then retain almost no lasting gain beyond the current answer. That is convenient, but does not accumulate understanding. What matters is extracting information that will remain useful and building it into an intermediate layer that compounds, rather than having the model understand everything again and again.

From this perspective, llm-wiki and context-infrastructure can be classified as “information-compounding systems.” One works on external knowledge, the other on life records. Both distill information, but their inputs, noise structures, and optimization goals differ, leading to different architectures.

## 2. The design of llm-wiki

Start with llm-wiki. Its raw materials are typically external knowledge: papers, articles, reports, books, and team documents. These are usually already expressions with high signal density. Authors know what they are discussing, topic boundaries are relatively clear, and the material has already undergone human organization. Its main challenge is to keep compiling valuable but scattered knowledge into an intermediate layer that can be navigated, maintained, and reused.

Its design rests on an insight about traditional RAG: when knowledge search and synthesis happen during question answering, the system keeps paying the cost of understanding without accumulating it. Moving that work ahead of question answering saves search costs, and the resulting synthesis can compound. A traditional RAG + LLM system may answer a complex question, but a similar question next time requires the same journey again. That cost grows with the materials. Doing structural organization, cross-linking, summary updates, and conflict recording in advance lets later queries start from an already compiled knowledge layer. Each search costs less, leaving tokens for better answers. Writing those high-quality answers back into the layer creates a flywheel.

Another kind of compounding comes from directing human mental effort toward more valuable work. The LLM takes on the heavy maintenance work, leaving the user’s attention for questions, analysis, and choosing a direction. The mental effort saved can further improve the user’s own work.

This leads to a simpler two-layer architecture, raw data and wiki, with a workflow that relies more on open-ended agentic exploration. Because the data is structured and information-rich, direct LLM synthesis can work well. To produce both knowledge and mental-effort compounding, llm-wiki can search raw data again in response to a user question, rewrite wiki pages, and save valuable questions and answers back into the wiki. The pages retain structured entry points from which the agent explores: returning to raw data, synthesizing across pages, or writing new questions and answers back. The intermediate layer gives exploration a better foothold.

## 3. The design of context-infrastructure

Where llm-wiki handles scattered but high-signal knowledge, context-infrastructure handles a different difficult input: noisy personal traces that may be extremely valuable. These inputs are closer to chat logs, email, meeting notes, casual notes, workspace traces, and clues from everyday behavior. They are continuous over time, vary in information density, often contain incomplete expressions, and include substantial noise irrelevant to the future.

Its core insight is that behind apparently chaotic life traces there may be a smaller set of stable preferences and judgment structures. This resembles the generative-AI idea that high-dimensional data contains lower-dimensional latent structure. The valuable part is the preferences, boundaries, style, ways of judging, and non-consensus tendencies that emerge across many accumulated fragments, beyond the literal content of one sentence.

That explains why context-infrastructure cannot simply be a thin “raw data → wiki” structure. Its main problem is sparse signal. It needs to identify and retain a small amount of stable personal signal in extensive noisy traces, then turn it into behavioral infrastructure an agent can inherit.

It uses several levels of information distillation. As new raw data arrives, it extracts observations about personal behavior. With enough observations, it extracts patterns. From accumulated patterns, it distills axioms: personal principles for behavior. Raw data → observation → pattern → axiom forms a necessary multilayer denoising mechanism. The noise and sparsity of the original records call for several stages of filtering. Unlike llm-wiki’s agentic exploration, the workflow is closer to a simple recurring loop. Because raw data has little value individually, it aims for everyday tasks to depend less and less on raw traces, with the useful personal signals already distilled above them.

Life data also accumulates slowly over time. Gathering enough data to extract patterns and axioms therefore requires a regularly recurring workflow. context-infrastructure uses cron tasks to run summarization and distillation periodically. It resembles online learning: new records arrive, new observations change later judgments, signals are promoted, and noise stays below or is forgotten. The system gradually converges through long-term interaction with the person.

## 4. Design insights for information-compounding systems

Abstracting from these two systems yields a more general insight:

> The key to compounding information is to distill signals that future work will use repeatedly and make them the default working surface in advance.

This sounds simple, but it almost redefines how to design a memory system. What matters is the layer on which future work takes place. If future tasks always return to raw data to retrieve, assemble, and judge again, the system has storage without compounding. Compounding begins when the distilled intermediate layer becomes the default working surface.

### 4.1. Why the default working surface matters more than storage

Many systems retain historical data, add tags, write summaries, and build indexes. These may look more advanced than one-off question answering, but they are insufficient on their own to create compounding.

Storage keeps information. Compounding requires future work to continue directly from what has already been distilled. If a system stores more and more raw data while every future question must reconstruct an understanding of it, it keeps paying the same cost.

That is why the “default working surface” matters more.

It is the layer that most future tasks first encounter, first rely on, and use to continue reasoning and acting. It need not be the lowest or most complete layer, but it must be the most frequently used, accessible layer, and the one best able to reduce future understanding costs.

Whether a system compounds depends on whether it moves high-value signals to the starting point of future work in advance, rather than how much data it stores.

### 4.2. How this explains llm-wiki

The key to llm-wiki is making the wiki the default working surface.

Most future questions should begin with this continuously maintained wiki rather than return directly to the original papers, articles, and reports. The wiki is a compiled knowledge layer, beyond a collection of summaries. Cross-links, topic structures, comparisons, and existing syntheses keep later work from rebuilding its scaffolding from raw sources every time.

What llm-wiki does is compile knowledge into the default starting point for future reasoning.

Seen this way, its difference from traditional RAG becomes clear. Traditional RAG’s main working surface is closer to retrieved raw data. llm-wiki tries to move work onto an organized, structured, continuously maintained intermediate layer. Raw data remains important, but serves more as verification and supplementation than as the default starting point.

### 4.3. How this explains context-infrastructure

context-infrastructure tries to make distilled personal signals the agent’s default working surface.

Recurring future tasks should not have to infer a person’s preferences, style, and boundaries anew from chat logs, meeting traces, and workspace fragments. Repeating that judgment every time would mean there is no compounding.

This is why it needs observations, patterns, and axioms. These layers refine the personal signals that will repeatedly inform future judgments. The agent can then work from them for most tasks instead of returning to noisy raw traces.

Here the working surface becomes a personalized control surface rather than a set of knowledge pages. It answers how a person typically judges, expresses themselves, and makes tradeoffs, rather than what exists in the world.

### 4.4. How the design questions change

Once an information-compounding system is understood as distilling reusable signals into a default working surface, its central design questions become more fundamental than “how do we store everything?”

First, what signals will future work repeatedly use?

Only some information deserves to become part of that surface. Usually it is structures that will repeatedly inform reasoning, decisions, expression, collaboration, or execution: knowledge, rules, patterns, preferences, constraints, or templates for judgment.

Second, how far is the raw data from those signals?

For high-signal raw data with clear topics, the distillation path can be short and the working surface relatively thin. For noisy, temporal, incomplete data, the path must be longer, or noise will contaminate that surface.

Third, does future work actually default to that layer?

This is easy to overlook. Many systems produce an intermediate layer that future work never really uses, or treats only as reading material rather than a starting point for execution and judgment. The layer then exists without creating compounding.

The real design question is therefore which layer can become the default starting point for future work.

### 4.6. An example of a new information-compounding system

Here is a different example, drawn from a pain point in my own graduate research.

I worked on mechanism design in edge computing and network economics. We often had to start from a system model and an optimization goal, construct a mechanism, do extensive theoretical derivations, prove properties, and move into experiments, only to discover that the mechanism was not worth pursuing. The largest waste was often paying a high theoretical cost too early for a conjecture that had not been effectively screened.

Through the default-working-surface idea, the signals worth distilling would be higher-level research judgments: which problem structures tend to fit which mechanism templates, which mechanisms are unlikely to work under which constraints, which models make a mechanism irrelevant, which designs deserve a small simulation first, and which deserve theoretical effort first.

Until these signals have been distilled reliably, theoretical derivation keeps acting as the first filter. Every new problem sends researchers almost back to the original model, designing a mechanism again, deciding again whether it is worth proving, and spending time again on a potentially ineffective direction. Once these research judgments become a default working surface, the loop can accelerate. A new problem first calls on an accumulated layer of experience. What begins to compound is the judgment of what is worth doing, rather than the number of papers.

## 5. Conclusion

llm-wiki and context-infrastructure show how different data and work objectives lead to different designs for compounding information. The main insight is to give a system a better default working surface. “Better” means closer to the signals future work repeatedly needs.

The central question remains:

> On which layer should future high-value work take place by default?

If the answer is still raw data, genuine compounding is difficult regardless of system size.

If the answer is an intermediate layer distilled in advance that can be called on, updated, and corrected continuously, compounding begins.

The key design move is to bring signals that will repeatedly inform judgment onto the default working surface ahead of time, rather than collect more information alone.

In this sense, designing an information-compounding system ultimately means designing where future work begins.

**A final note:** Thank you to Yage for open-sourcing context-infrastructure. AI helped polish this article, using the relevant writing-style prompts directly from Yage’s context-infrastructure.
