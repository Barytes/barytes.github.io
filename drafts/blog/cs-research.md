一个模糊的想法如何导向有价值的真工作？

学习-达到前沿-开始做真问题。

问题是什么？现有的解决方案是什么？然后挑战现有的解决方案（“No, let’s do it this way instead:”）

An implicit assumption: Industry and other researchers all thought one way about a problem

“No, let’s do it this way instead:” The researcher offered a new perspective that nobody had ever considered or made feasible before. They proved out their idea as the better approach.

[https://web.stanford.edu/class/cs197/](https://web.stanford.edu/class/cs197/)

Read paper、Research Log [https://web.stanford.edu/class/cs197c/assignments/a1.html](https://web.stanford.edu/class/cs197c/assignments/a1.html)

Read Paper

- Your outline should recompress the paper back into an outline format that explains the paper's argument. We suggest the following structure of one paragraph per bullet, with an example outline following the description:
  - **Title**: What paper did you read?
  - **Problem**: What problem is it solving? Why does this problem matter?
  - **Assumption in prior work**: What was the assumption that prior research made when solving this problem? Why was that assumption inadequate?
  - **Insight**: What is the novel idea that this paper introduces, breaking from that prior assumption?
  - **Technical overview**: How did the paper implement that insight? I.e., What did they build, or what did they prove, and how?
  - **Proof**: How did the paper evaluate or prove that its insight is correct, and is better than holding on to the old assumption?
  - **Impact**: What are the implications of this paper? How will it change how we think about the problem?

Research Log

- Research logs serve a variety of purposes, including (but not limited to!):
  - To help you plan and remember your goals for the week
  - To help you measure progress toward these goals, and get better at goal setting and time management
  - To communicate your activities and questions with me and with the other members of your group
  - To keep track of findings, ideas and results related to your research
- Every week you will be adding to your research log following the below guidelines (if you have any questions or want to add something, just let us know):
  - Every week you will add a header for the week (e.g. "Week 1" or "Week 7") with the dates. Our "Weeks" run Thurs to Wed. We'll be reading the logs before your small group meetings.
  - Entries are listed in reverse chronological order, with the most recent week and entry always at the top of the page.
  - Under that header, you will list the goals for the week.
  - Each day you work, you will enter the date of your work, and record your accomplishments. You may make additional notes as necessary.
  - Each day when you are done working, you should record the amount of time you spend working at the top of that day's entry.
  - You may also be prompted to put or link to reflections in your logs (this varies week-to-week).

Review：How do we get to the point where we know what has been done, and why our idea is different, new, and exciting? [https://web.stanford.edu/class/cs197/lectures/cs197-02-research-contribution.pdf](https://web.stanford.edu/class/cs197/lectures/cs197-02-research-contribution.pdf)

Research Contribution：

- research ideas arise as a reaction to the researcher’s understanding of how people think about the problem today
- **bit flip**: an inversion of an assumption that the world has about how the world is supposed to work.
  - Articulate an assumption, often left implicit in prior work: this is the bit
  - **“No, it should be this way instead:”** argue for an alternative to that assumption
  - **Single paper bit flip:** your **nearest neighbor paper**.
    - Your paper will be some sort of delta off of that paper: What assumption or limitation did it have, that you’re flipping?
  - **Literature-level bit flip**
    - Read the literature. (Which papers? Stay tuned…)
    - What assumptions underlie all of the papers? 
    - Which assumption are you changing? And why does it matter to the literature?
- **Performing a literature search: build the literature graph**
  - **Step one: nearest neighbor.**
    - Start with a seed paper that is the closest in the design space to yours. This is your **nearest neighbor** paper. Read this paper in depth. Understand it.
  - **Step two: expand your horizon**
    - What are the 3–5 most important citations to that nearest neighbor? Look at the papers that it cited visibly and carefully in the Introduction and Related Work. Look at which papers it is arguing a bit flip from. Are those most important citations staying in the neighborhood of your topic, or going somewhere else? Keep the ones that are staying in the neighborhood.
    - Backward influence: influential citations in the papers that you’ve read
    - Forward influence: papers citing the ones that you’ve read
    - Relatedness: contemporaneous but not citing
  - **Filtering your horizon: save the papers** from a reputable venue and from a reputable institution or author
  - **Asymptoting:** Keep track of **how much you’re learning about the design axes** as you consume the additional papers
  - Reading a paper in a literature search
    - **what is the main point** that this paper is making?
    - focus your reading and effort most closely on the parts of the paper that are supporting or evaluating that point.
- Writing Related Work Section
  - **Step 1: affinity mapping：**Group the papers by whatever makes sense to you.
  - **Step 2: regrouping:** aim for each group to have a shared thesis behind it, not just a noun. Regroup your post-its around shared theses.
  - **Step 3: outlining:** Each thesis then becomes the topic sentence of a paragraph of the Related Work section
  - **Step 4: writing** start with the thesis, and use the paragraph to prove the thesis. Once you’ve summarized the work, articulate the bit flip

Research Milestone Plan

a soft contract between you, your research mentor, and your collaborator

- Describes in 1-2 sentences the deliverable and
- 1-2 sentences why the deliverable is important for your project
- an estimate for how long you think you'll need to perform this deliverable (potentially broken into subgoals, if relevant)

Introduction

Michael Bernstein, an HCI faculty member in our department, tends to follow the following paragraph-by-paragraph outline for an Introduction:

- **Problem:** What's the problem you're solving? Cite other work that helps motivate the problem. Make the reader feel the urgency of the problem, so that by the end of the paragraph they care a lot that someone finds a solution. [Example topic sentence](https://hci.stanford.edu/publications/2016/ethan/augur-chi-2016.pdf):
  > We all want to build IoT applications that are responsive to our behaviors — for example, coffee machines that make coffee for us after we wake up, or phones that know not to ring while we're in meetings — but we lack the data to endow our algorithms with this information about our patterns and behaviors.
- **Set up the bit:** This paragraph usually answers the question, "Why isn't this problem solved yet?" by setting up the bit that you're going to flip. The topic sentence typically summarizes existing approaches to solving the problem by articulating the bit that they share, and points out why those approaches and the bit more broadly hasn't been able to solve the problem. So, it's a brief summary of the most important related work — but it's a summary, not a survey, meaning that its goal is to set up the bit, not to cover everything. Example topic sentence:
  > Existing solutions to this problem require manually authored rules (e.g., coffee is a morning drink, we drink morning drinks after we wake up), but the required manual effort results in incomplete data about human situations and behaviors.
- **Flip the bit:** Here you introduce your insight by flipping the bit. The topic sentence of this paragraph is the thesis statement for the entire paper. It should lay out the big idea that you'll be pursuing. Spend this paragraph explaining your insight clearly, why it flips the bit that you set up, and what the implications of flipping that bit will be for the problem at hand. For the purposes of this assignment, it's fine to assume that your bit flip will work out — we all know that research is iterative and projects will evolve. Example topic sentence:
  > In this paper, we suggest that data mining a large dataset of modern fiction offers a promising alternative to manual annotation.
- **Instantiate that bit flip in a solution:** At this point, the reader understands the idea that you're proposing, but it's still very high level. In this paragraph, map that idea onto a concrete instantiation. This is where you introduce the system you've built, the model you're creating, the study design, or whatever is the main artifact of your research, and how it instantiates that insight. Example topic sentence:
  > We introduce Augur, a knowledge base that relates human activities and the objects around them by mining 1.8 billion words of modern fiction from the online writing community Wattpad into a vector space model for predicting human activities.
- **Evaluate the solution:** We haven't discussed evaluation yet in the class, but a good introduction summarizes the evaluation that you performed to demonstrate that flipping the bit has the effects that you suspect. For the purposes of this assignment, ask yourself: how would you prove to a critical reader that flipping the bit has the effect you promised in solving the problem? We expect you to articulate what you will be manipulating and measuring, but we don't require any actual results right now and we won't hold you to this evaluation strategy — especially since sometimes your evaluation strategy evolves as your project evolves.
  > Example topic sentence: To evaluate Augur's ability to predict human behaviors, we first compared Augur's predictions to human estimates of behaviors given the same inputs, and second performed a field deployment to test Augur's precision and recall in a realistic application.
- **Implications:** If you're right about this bit flip being the right way for the field to go, what implications will there be for the field? Don't overplay your hand here by stating that all of computing will shift, but do be clear and forceful in pushing the case as hard as you feel that the case warrants.
  > Example topic sentence: This work demonstrates that fiction can provide deep insight into the minutiae of human behavior, and that modern NLP algorithms can structure those minutiae into useful hooks for IoT applications.

This outline will depend a bit on the kind of paper you're writing. For example, start by answering: are you an old problem / new solution paper, or a new problem / old solution paper? Old problem / new solution papers already have a warrant for the problem, so that part of the Introduction is easy, but they need to argue for the solution very carefully since there's no warrant there. Similarly, new problem / old solution papers need to be extra careful to argue the problem persuasively, but they can draw on existing warrants for the solution and only argue for how they're adapting it to the problem.

系统工程

[https://www.nasa.gov/reference/systems-engineering-handbook/](https://www.nasa.gov/reference/systems-engineering-handbook/)