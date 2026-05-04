export function calculateRudasScore(answers, animalCount) {
  const boCount = ['rb1','rb2','rb3','rb4','rb5','rb6','rb7','rb8']
    .filter(id => answers?.[id]).length;
  const bo = Math.min(boCount, 5);
  const praxis = answers?.praxis ?? 0;
  const drawing = (answers?.rd1 ? 1 : 0) + (answers?.rd2 ? 1 : 0) + (answers?.rd3 ? 1 : 0);
  const j1 = answers?.rj1 ?? 0;
  const j2 = answers?.rj2 ?? 0;
  const memory = (answers?.rm1 ? 2 : 0) + (answers?.rm2 ? 2 : 0) + (answers?.rm3 ? 2 : 0) + (answers?.rm4 ? 2 : 0);
  const language = Math.min(animalCount ?? 0, 8);
  return bo + praxis + drawing + j1 + j2 + memory + language;
}

export function getRudasInterpretation(score) {
  return score <= 22
    ? "Possible cognitive impairment — refer for further investigation"
    : "Within normal range";
}

export function getRudasQuestionScores(answers) {
  if (!answers) return [];
  const boCount = ['rb1','rb2','rb3','rb4','rb5','rb6','rb7','rb8']
    .filter(id => answers[id]).length;
  return [
    { label: "Item 2: Body Orientation", pts: Math.min(boCount, 5) },
    { label: "Item 3: Praxis", pts: answers.praxis ?? 0 },
    { label: "Item 4: Drawing", pts: (answers.rd1 ? 1 : 0) + (answers.rd2 ? 1 : 0) + (answers.rd3 ? 1 : 0) },
    { label: "Item 5: Judgement", pts: (answers.rj1 ?? 0) + (answers.rj2 ?? 0) },
    { label: "Item 1R: Memory Recall", pts: (answers.rm1 ? 2 : 0) + (answers.rm2 ? 2 : 0) + (answers.rm3 ? 2 : 0) + (answers.rm4 ? 2 : 0) },
    { label: "Item 6: Language", pts: Math.min(answers.animalCount ?? 0, 8) },
  ];
}
