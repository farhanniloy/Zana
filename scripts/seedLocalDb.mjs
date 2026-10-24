import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/local-preview-client");
const databaseUrl =
  process.env.LOCAL_DATABASE_URL ||
  pathToFileURL(resolve("prisma/local.db")).href;
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

const categories = [
  { slug: "philosophy", title: "Philosophy" },
  { slug: "science", title: "Science" },
  { slug: "projects", title: "Projects" },
  { slug: "programs", title: "Programs" },
  { slug: "infiltration", title: "Infiltration" },
  { slug: "notebook", title: "Notebook" },
];

const posts = [
  {
    slug: "a-small-map-of-attention",
    title: "A Small Map of Attention",
    summary: "On noticing what quietly shapes the way we think.",
    desc: "<p>Attention is a kind of map. The things we return to become familiar landmarks; everything else fades into the edges.</p><p>Try following one ordinary moment all the way through: a sound, a reaction, a small decision. The route is rarely as simple as it first appears.</p><blockquote>Curiosity begins when we give the ordinary a second look.</blockquote><p>This is a note about slowing down—not to find a grand answer, but to see the actual shape of a question.</p>",
    img: "/night-window.svg",
    catSlug: "philosophy",
    categorySlugs: ["philosophy"],
    daysAgo: 1,
  },
  {
    slug: "the-useful-kind-of-uncertainty",
    title: "The Useful Kind of Uncertainty",
    summary: "Why a good question can be more valuable than a quick conclusion.",
    desc: "<p>Uncertainty is not always a gap to fill. In science, it can be a signal that the current model has reached its useful limit.</p><p>A careful experiment does not promise that we will be right. It gives us a way to notice exactly where our expectations stop matching the world.</p><h2>Keep the question open</h2><p>When an observation surprises you, write down what you expected first. That small record makes it easier to tell the difference between evidence and a story added afterward.</p>",
    img: "/field-notes.svg",
    catSlug: "science",
    categorySlugs: ["science", "philosophy"],
    daysAgo: 3,
  },
  {
    slug: "small-tools-for-long-projects",
    title: "Small Tools for Long Projects",
    summary: "A practical case for making the next step easy to begin.",
    desc: "<p>Large projects are made of small returns: opening the notes, running one test, writing down what changed.</p><p>Keep the setup close to the work. A short README, a repeatable command, and a visible list of open questions can save more time than an elaborate productivity system.</p><pre><code>observe → make one change → record the result</code></pre><p>The goal is not to remove all friction. It is to make the useful kind of effort easier to find again tomorrow.</p>",
    img: "/library-shelf.svg",
    catSlug: "projects",
    categorySlugs: ["projects", "programs"],
    daysAgo: 6,
  },
  {
    slug: "learning-by-building",
    title: "Learning by Building",
    summary: "A gentle loop for turning a curious idea into a working prototype.",
    desc: "<p>Choose a question small enough to test in an afternoon. Build the least complicated thing that can answer it, then keep the parts that taught you something.</p><ol><li>Write down the question.</li><li>Make a tiny, working version.</li><li>Try it, observe the surprise, and revise.</li></ol><p>A prototype is not a promise to finish. It is a way to replace vague possibilities with something you can inspect.</p>",
    img: "/field-notes.svg",
    catSlug: "programs",
    categorySlugs: ["programs", "projects"],
    daysAgo: 9,
  },
  {
    slug: "boundaries-make-systems-legible",
    title: "Boundaries Make Systems Legible",
    summary: "A systems note on interfaces, assumptions, and responsible exploration.",
    desc: "<p>A boundary tells us where one set of expectations ends and another begins. In software, clear interfaces make those expectations visible.</p><p>When exploring an unfamiliar system, start with what is documented and authorized. Observe first, keep experiments scoped, and write down what a result does—and does not—show.</p><blockquote>Precision is a form of respect for the system and the people who rely on it.</blockquote>",
    img: "/night-window.svg",
    catSlug: "infiltration",
    categorySlugs: ["infiltration", "science"],
    daysAgo: 13,
  },
  {
    slug: "the-notebook-as-a-laboratory",
    title: "The Notebook as a Laboratory",
    summary: "A simple practice for keeping experiments honest and useful.",
    desc: "<p>A useful notebook records more than the polished result. It keeps the rough hypothesis, the conditions, and the moment an assumption changed.</p><p>Write observations in plain language. Mark guesses as guesses. When you revisit the page later, you can see how the idea moved instead of remembering only where it ended up.</p><p>Good notes are a small act of kindness to your future self.</p>",
    img: "/field-notes.svg",
    catSlug: "science",
    categorySlugs: ["science", "programs", "notebook"],
    daysAgo: 17,
  },
  {
    slug: "what-a-finished-idea-leaves-behind",
    title: "What a Finished Idea Leaves Behind",
    summary: "On the notes, tools, and questions that remain after a project ends.",
    desc: "<p>Finishing a project does not mean every question has been answered. It means the work has reached a shape that can be shared, used, or set down.</p><p>Leave behind the decisions that were hard to make, the tests that mattered, and the next question you would ask. That context turns an endpoint into a useful starting place for someone else.</p>",
    img: "/library-shelf.svg",
    catSlug: "projects",
    categorySlugs: ["projects", "philosophy"],
    daysAgo: 22,
  },
  {
    slug: "quiet-routines-for-curious-days",
    title: "Quiet Routines for Curious Days",
    summary: "Small habits that leave room for discovery without demanding a perfect schedule.",
    desc: "<p>Keep one small space for unfinished questions: a note, a folder, or a page in a notebook. Add to it when something catches your attention.</p><p>Once a week, choose one thread and follow it for twenty minutes. Stop while you still know what the next step could be. Returning becomes easier when the invitation is clear.</p>",
    img: "/reading-room.svg",
    catSlug: "programs",
    categorySlugs: ["programs", "philosophy", "notebook"],
    daysAgo: 27,
  },
];

async function main() {
  const author = await prisma.user.upsert({
    where: { email: "nil@local.test" },
    update: { name: "Nil", username: "nil", image: "/farhan.jpeg" },
    create: {
      email: "nil@local.test",
      name: "Nil",
      username: "nil",
      image: "/farhan.jpeg",
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { title: category.title },
      create: category,
    });
  }

  for (const postData of posts) {
    const { categorySlugs, daysAgo, ...content } = postData;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const post = await prisma.post.upsert({
      where: { slug: content.slug },
      update: { ...content, createdAt, approved: true },
      create: { ...content, createdAt, userEmail: author.email, approved: true },
    });

    await prisma.postCategory.deleteMany({ where: { postId: post.id } });
    await prisma.postCategory.createMany({
      data: categorySlugs.map((categorySlug) => ({
        postId: post.id,
        categorySlug,
      })),
    });
  }

  const sampleComments = [
    {
      id: "local-comment-attention",
      postSlug: "a-small-map-of-attention",
      name: "Mira",
      desc: "That line about ordinary moments being landmarks stayed with me.",
    },
    {
      id: "local-comment-uncertainty",
      postSlug: "the-useful-kind-of-uncertainty",
      name: "Jon",
      desc: "Writing down the expectation first is such a useful experiment habit.",
    },
    {
      id: "local-comment-building",
      postSlug: "learning-by-building",
      name: "Ari",
      desc: "A tiny prototype is often enough to make the next question obvious.",
    },
  ];

  for (const comment of sampleComments) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: comment,
      create: comment,
    });
  }

  console.log(
    `Local preview database ready: ${posts.length} posts, ${categories.length} categories, ${sampleComments.length} comments.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed local preview database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
