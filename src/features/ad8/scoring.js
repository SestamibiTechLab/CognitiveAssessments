export const AD8_ITEMS = [
  { id: "a1", text: "1. Problems with judgment (e.g., problems making decisions, bad financial decisions, problems with thinking)", short: "Q1: Problems with judgment" },
  { id: "a2", text: "2. Less interest in hobbies/activities", short: "Q2: Less interest in hobbies/activities" },
  { id: "a3", text: "3. Repeats the same things over and over (questions, stories, or statements)", short: "Q3: Repeats same things" },
  { id: "a4", text: "4. Trouble learning how to use a tool, appliance, or gadget (e.g., VCR, computer, microwave, remote control)", short: "Q4: Trouble learning tools/gadgets" },
  { id: "a5", text: "5. Forgets correct month or year", short: "Q5: Forgets month or year" },
  { id: "a6", text: "6. Trouble handling complicated financial affairs (e.g., balancing checkbook, income taxes, paying bills)", short: "Q6: Trouble with finances" },
  { id: "a7", text: "7. Trouble remembering appointments", short: "Q7: Trouble remembering appointments" },
  { id: "a8", text: "8. Daily problems with thinking and/or memory", short: "Q8: Daily thinking/memory problems" },
];

export function calculateAd8Score(answers) {
  return AD8_ITEMS.filter((item) => answers?.[item.id] === "yes").length;
}

export function getAd8Interpretation(score) {
  return score <= 1
    ? "Normal cognition"
    : "Cognitive impairment is likely to be present";
}

export function getAd8QuestionScores(answers) {
  return AD8_ITEMS.map((item) => ({
    label: item.short,
    pts: answers?.[item.id] === "yes" ? 1 : 0,
  }));
}
