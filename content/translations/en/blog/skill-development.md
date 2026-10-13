---
title: "How I split one interview-preparation Skill into six Skills"
description: "An ongoing Skill development account: teaching that drifted during real use, separating responsibilities, sharing learning records, and saving feedback and traces."
---

After reading Zhenzi Zaifaguang’s account of her job search, [“Every company I interviewed with gave me an offer: the secret to a 100% success rate, Part 1”](https://www.superlinear.academy/c/connections/offer-100), I was struck by how she used ChatGPT and Cursor to build a world and a working context for a role, then went through the actual work herself. I wondered: could I learn this ability? Could more people gain it too?

So I tried turning that process into a set of skills to help me prepare for interviews: [interview-prep-like-a-builder](https://github.com/Barytes/interview-prep-like-a-builder). It began as one skill, `builder-interview`, and eventually became six.

The design behind that split was **separating responsibilities, reusing shared conventions, and collaborating toward a common goal**. Each skill handles a clear kind of task and can improve independently. Teaching and project collaboration share learning records, while feedback and conversation archives serve their own purposes. That keeps the learning process connected as tasks change.

## What I wanted to solve initially

As Zhenzi put it, “preparing for interviews with a Builder mindset” means reconstructing the context of a job as fully as possible: “standing in the team’s place and looking from their perspective, thinking about what they might be doing and the problems and context they face every day.” In an interview, OpenAI’s Jiayi Weng also emphasized [the importance of context at work](https://www.bilibili.com/video/BV1darmBcE4A/): doing a job well depends heavily on understanding the project’s background. I had previously asked Yage a question, and his [advice](https://www.superlinear.academy/c/q-a?message_id=2158863221#message_2158383162) pointed to the same idea. While AI speeds up implementation, people need to understand the situation, users, and goals, supply key context, and participate in choosing approaches and accepting results. Learning and building with this understanding, then revising expectations through conversations with practitioners, can gradually bring interview preparation closer to how people think and work in the real job.

Zhenzi began by talking to ChatGPT. She first clarified what advertising demand and inventory meant, then narrowed the problem to a video platform such as Netflix: what information a forecast depends on and what decisions it affects. Next, she reasoned through the relationships among supply, prices, and advertisers’ purchases, adding scenarios such as major sporting events and advance ad sales to test whether the earlier explanation still held. When designing the forecasting system, she brought in the needs of different teams: they needed to explain business changes and understand what actions they could take. The context of the job emerged through these concrete questions and revisions. She then used Cursor to generate data with simulated distributions and granularity, and built models and forecasts from that data.

I lack work experience in some roles I am interested in. A job description introduces plenty of terms: harnesses, evaluation, failure reproduction, model integration, and trajectory collection. But putting those terms together does not tell me how work would reach me after joining a team, whom I would collaborate with, what judgments I would need to make, or who would receive my deliverable.

I wanted AI to help me quickly understand the job, then simulate a representative piece of work based on that understanding. Along the way, I should be able to participate in choosing requirements and approaches, inspect results, and explain my reasoning in an interview.

Initially I drew on the teaching approach in Matt Pocock’s [`teach` skill](https://github.com/mattpocock/skills/blob/main/docs/productivity/teach.md). Through explanations, exercises, and feedback, I hoped to help someone without relevant experience gradually form their own judgment. Real interviews, blogs, and accounts from practitioners, along with recent product updates, open-source projects, and technical progress from the target team, could all serve as teaching materials.

The original `builder-interview` therefore had an ambitious goal: help me build a mental world model close to the real work. I also gave it two success criteria: explain the reasoning and principles behind the target team’s latest progress, and participate in frontier discussions in the field while making a small contribution.

Those statements sounded complete at the time. Only after trying the skill did I discover how many unexpected paths they left open for AI.

## How the first trial drifted

I tried it with OpenAI’s Applied AI Engineer role on the Codex Core Agent team. The most obvious problem was how easily AI could start from a real case or recent commit and dive into technical details.

Each individual explanation might be useful: a tool execution, an introduction to harnesses, or an analysis of a fix. But after several rounds, I knew more about one small area while still lacking an understanding of the whole job. I had wanted to cover the main responsibilities first; instead, we kept drilling into one corner.

That also exposed a problem with the success criteria. Understanding a commit deeply might indeed let me explain recent progress or discuss an improvement. It still would not necessarily tell me the role’s other responsibilities or let me combine the knowledge to complete a piece of work.

Another problem occurred within individual answers. AI would pack the role definition, product strategy, several examples, an execution process, and exercises into one response. It also spent space describing what it had researched, how it had assessed things, and how it intended to proceed. Before I could connect one concept to a work situation, the next concept had arrived.

I gave very direct feedback:

> Why emphasize “what I would do”? We are not testing how you solve the problem. The goal is for the user to develop a correct mental model and understanding.

We gradually changed the teaching starting point to “you have joined the target team”: first explain where tasks come from, how collaboration works, what judgments are needed, and what gets delivered. Then introduce technology through those work needs. Practitioner interviews and accounts should illustrate these relationships too.

But further use showed that explaining the role’s background at the start did not keep the rest of the learning centered on it. A single case could still pull the whole conversation deep into one topic. I began reconsidering what kinds of help this skill should provide.

## Separate teaching from building a project together

During the discussion, I proposed separating two things: explaining the knowledge and skills needed for the work, and setting up a simulation project close to the real job.

They can alternate, but they progress differently.

For example, if I do not understand how tool results enter model input, I need an explanation, examples, and practice. AI should decide how to continue teaching based on my understanding.

If I want to build an agent project, we first need to establish the problem, users, scope, and acceptance requirements, then implement it, run it, and inspect the results. We can address knowledge gaps along the way, but should return to the project afterward.

The original large skill was therefore split into `teach-me` and `build-with-me`. The first helps me understand a role, learn, and practice. The second works with me on selecting a project, defining requirements, implementing it, and accepting the result.

The near-term goal also became more concrete: first help me build a role-relevant project that I can demonstrate, put on my résumé, and discuss in an interview in terms of decisions and personal contribution. Understanding recent progress and participating in frontier discussions can remain further goals.

This change made it easier to judge what the next conversation should do. If we are explaining a mechanism, the question is whether I can use it. If we are building a project, the question is whether we have advanced the agreed deliverable.

## Where shared conventions should live after the split

Splitting the skill immediately created a maintenance problem: both skills needed to know my goals, current understanding, and project progress, and both needed to follow the same teaching conventions.

In the first reorganization, some active conventions and record instructions went into `history/`. I pointed out that if a current skill still depends on something, it should have a clear current home. We then discussed keeping two copies of the shared content. My question was: what happens when the copies fall out of sync?

Eventually, we extracted reading and saving learning records, along with providing shared teaching conventions, into `track-progress`.

When continuing the same round of role preparation, `teach-me` and `build-with-me` use the same learning-record directory. If project work calls for a lesson, we record what needs to be learned and the task to return to, and pass along that same directory. Switching teaching modes therefore preserves an understanding of the work in progress.

![Teaching and project work share one learning notebook, with the orange character turning the same notebook between the two activities](/blog/skill-development-learning-record.png)

We kept three existing filenames, but clarified their meanings:

| File | What it stores |
| --- | --- |
| `MISSION.md` | Preparation goals and arrangements: target role, desired outcomes, deadline, and effort |
| `WORLD_MODEL.md` | Role and project description: work relationships, learning checklist, project requirements, constraints, and approach |
| `PROGRESS.md` | Learning performance and progress: my explanations and actions, teaching judgments, project results, and next steps |

Naming was part of this iteration too. Terms such as “learning context” and “evidence of understanding” seemed broad enough to hold many things, but were unclear when it came to reading and writing records. We began using `CONTEXT.md` to unify terminology: what counts as learning performance, a teaching judgment, a round of role preparation, and a learning record.

Once those terms were clear, prompts could become shorter. Each skill states what it owns. Shared conventions and record formats have one maintained copy, with detailed formats in reference files.

## Save real feedback before talking about scores

With several skills, I naturally wanted to know what changed in the next use after revising a version. Could we accumulate runs, form a dataset, and compare effectiveness?

The discussion quickly moved toward versioned test sets, controlled runs, scoring, and experiment tracking. Then I realized that the most important immediate step was still unresolved: I was still exploring what kind of teaching actually helped me.

I said at the time:

> Effectiveness can only be determined by the user—currently me—and it depends on my repeated interactions.

I did not yet have stable, reusable teaching metrics, and I did not want to build a platform that programmatically runs an agent, has an LLM play the student, and assigns scores. At this stage, specific feedback from my actual use was more useful for deciding what to change next.

This led to `note-feedback`. It saves my evaluations of teaching methods, preferences, and suggestions for improvement, such as “you asked me to explain before giving an example, so I could not answer.” It can also record an effective method.

Here a distinction matters: “I still do not understand the difference between a model and a harness” reveals a knowledge gap, so teaching should continue and learning records should be updated. “You described many components, but I still do not know the first step” points to a teaching problem worth saving as feedback.

Feedback lives in the repository-wide `docs/feedback.md`, retaining the role, conversation, and situation it came from. The skills will be used for different roles. Centralizing feedback makes similar problems easier to find in future development, while the specific context determines where a suggestion applies.

Improvement items have three states: **Pending → Awaiting trial → Confirmed**. A change enters “Awaiting trial” when it has been written into a skill. It becomes “Confirmed” only when, in later actual use, I explicitly judge that it helped. This gives “we changed it” and “the change worked” their own places.

## Save conversation records and teaching feedback separately

Feedback summaries alone still cannot reconstruct a trial. I wanted to revisit the conversation, tool calls, model, harness, and skill versions later, so we added `save-trace`.

Its action is simple: when I explicitly invoke it, it archives the records already written to disk for the current test conversation into the target role’s `runs/`. It exports from existing Codex JSONL logs; there is no need to write another agent-running program.

One run corresponds to one Codex session ID. A conversation can switch skills, take a lesson, and return to a project. Invoking the archive again updates the same run while preserving earlier archive information and skill snapshots.

This design encountered two concrete problems.

First, a conversation may switch models. Inspecting a development conversation revealed two models in the logs, so model information needs to be saved by turn.

Second, the Git commit at archive time does not automatically establish which skill version was used earlier. Files may have changed during the conversation, and there may be uncommitted edits. The archive saves a file snapshot labeled “version at archive time”; earlier versions are recorded according to the evidence available.

I also specifically reminded it:

> Keep trace and feedback distinct. Do not mix them up.

The three kinds of records now serve separate purposes. Learning records help preparation continue. Traces preserve conversations, tool events, and runtime information. Feedback preserves my evaluation of teaching methods and the progress of improvements. Feedback can refer to specific trace events.

`save-trace` runs only when I explicitly invoke it. Recording feedback, updating progress, or switching skills never automatically archives the whole conversation. I can keep using Codex normally and save a process when I want to retain it.

## How the six Skills work together

The everyday entry point is `prep-me`. I tell it what I want to learn, do, or continue, and it selects the relevant skill for the current task. It passes the necessary handoff information; the chosen skill takes over the teaching or project work.

The result is six skills:

| Skill | Responsibility |
| --- | --- |
| `prep-me` | Select and connect the current task |
| `teach-me` | Understand roles, explain, practice, and fill knowledge gaps |
| `build-with-me` | Project selection, requirements, approach, implementation, acceptance, and improvement |
| `track-progress` | Maintain learning records and provide shared teaching conventions |
| `note-feedback` | Save teaching feedback and track global improvement items |
| `save-trace` | Explicitly archive conversations and runtime information |

The project also moved out of my personal planning repository into its own directory. `skills/` holds the current skills, `tests/roles/` holds role materials and learning and trial records, `docs/` holds project documentation and feedback, and `docs/history/` preserves historical materials.

The root `AGENTS.md` distinguishes development from trial use. When I ask to change a skill, AI should understand the structure, read relevant feedback, and edit files. It performs teaching and project tasks when I am preparing for a role. The same repository can therefore support both developing these skills and trying them directly.

## The next step is still to use them

I raised a concern during the discussion: **I am building while using this, and have not yet completed a learning task that demonstrates the method’s effectiveness.** A clearly structured set of skills can easily feel like an achievement, but the outcome I originally wanted is still role capability and project experience I can explain.

My current understanding of skill development is to first write down how I want AI to help, use it, save specific failures and effective approaches, then decide which responsibilities should be separated and which conventions should be shared. Ideally, every requirement in a prompt should answer: “Which actual behavior will this change?”

Next, I want to choose a specific role and use these skills to take a small project far enough that I can demonstrate it, explain it, and continue changing it under new requirements. What helps and what drifts in that use will guide the next development round.
