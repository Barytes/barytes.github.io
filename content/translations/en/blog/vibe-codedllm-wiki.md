---
title: "I vibe coded an entry app for llm-wiki in a week"
description: "I built gogo to put a local llm-wiki browser and a Pi agent in one workspace, then reflected on its design and the product I actually wanted to make."
---

## 🐶 gogo

I use [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) as my second brain. One pain point is having to open both Obsidian and Codex and switch between them. With only one screen, that gets especially annoying. I also cannot be bothered to install Obsidian plugins, and existing plugins require configuration, such as [acp](https://github.com/RAIT-09/obsidian-agent-client).

A second pain point is introducing llm-wiki to friends without an IT background. They need to download and install a coding agent, configure a runtime, and set up an LLM. That barrier is enough to discourage many people.

So I made an entry app for llm-wiki myself—100% AI, no manual coding—called **gogo**. It bundles a Markdown browser with a [Pi agent](https://pi.dev), the same agent used by OpenClaw, so it works out of the box with no setup apart from configuring your own API key.

I now use gogo as my daily entry point for llm-wiki. It is far from perfect, but I think it basically meets my needs. If you have similar pain points, I hope it can help you too.

The project is open source at [Barytes/gogo](https://github.com/Barytes/gogo). Installers for Windows x64 and macOS on Apple Silicon are available from GitHub Releases.

![A demonstration of the gogo knowledge browser and agent workspace](/blog/44a58521-e999-4e2c-9aed-d9d02ddfe37a_1470x956.gif)

## Design principles and reflections

These were the principles I considered when designing gogo:

- **📦 Works out of the box.** The goal is to let people use llm-wiki with as little environment setup as possible.
- **💁 gogo serves the local llm-wiki knowledge base.** It provides a better entry point without locking knowledge and workflows inside the app. You lose none of your knowledge base if you stop using gogo.
- **🤝 A unified Wiki + Agent workspace.** Knowledge browsing and AI conversation share a workspace, reducing the cost of switching between tools.
- **🔍 Focus on llm-wiki rather than a general knowledge manager.** Making this workflow convenient comes before sacrificing clarity and usability for more general scenarios.
- **👑 The user is the primary owner of the knowledge base.** Users should always be able to see, modify, migrate, and replace its structure, skills, schemas, and ways of working, rather than accepting the defaults of a closed system.
- **🤖 Avoid turning the agent into a black box.** gogo does not package the agent as invisible “magic.” It tries to keep model configuration, slash commands, diagnostics, context, and permission boundaries transparent.
- **🧠 No web search.** I did not give the agent web search. First, it should answer faithfully from the knowledge base, rather than improvising or searching the internet for “consensus” content. If its answers are poor, that signals a need to find new material for the knowledge base. Second, I think people should at least find new materials themselves and understand what their knowledge base contains. If the agent does everything, people tend to give up trying to understand.

Looking back, I made quite a few mistakes:

- **Was it necessary?** I initially wanted to build a [shared knowledge base](https://www.superlinear.academy/c/q-a?message_id=2099190673#message_2099012264) for my research group, but I had not defined the product’s boundaries. I wanted a comprehensive product covering wiki browsing, AI conversation, and knowledge sharing. After some thought, I split browsing and conversation from sharing and made the first two into gogo. Now I feel this product was not necessary: I spent a lot of effort getting a byproduct, without really making what I wanted to make.
- **It is just a wrapper app.** Under the [six levels of AI products](https://www.superlinear.academy/c/ai-resources/ai-product), gogo probably falls between L2 and L4. Although I stitched in an agent loop, it cannot be called an Agentic Core or AI-native Product. The agent mainly retrieves knowledge, and llm-wiki workflows such as ingest, write-back, and lint still need manual triggers. There is room for more frictionless interaction, contextual intelligence, and proactive intelligence.
