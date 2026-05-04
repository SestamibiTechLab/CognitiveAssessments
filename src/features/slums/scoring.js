export const STORY_TEXT =
  "Jill was a very successful stockbroker. She made a lot of money on the stock market. She then met Jack, a devastatingly handsome man. She married him and had three children. They lived in Chicago. She then stopped work and stayed at home to bring up her children. When they were teenagers, she went back to work. She and Jack lived happily ever after.";

export const QUESTION_ITEMS = [
  { id: "q1", label: "1. What day of the week is it?", points: 1 },
  { id: "q2", label: "2. What is the year?", points: 1 },
  { id: "q3", label: "3. What state are we in?", points: 1 },
  { id: "q5a", label: "5. How much did you spend?", points: 1 },
  { id: "q5b", label: "5. How much do you have left?", points: 2 },
  { id: "q6a", label: "6. Animal naming: 0-4 animals", points: 0 },
  { id: "q6b", label: "6. Animal naming: 5-9 animals", points: 1 },
  { id: "q6c", label: "6. Animal naming: 10-14 animals", points: 2 },
  { id: "q6d", label: "6. Animal naming: 15+ animals", points: 3 },
  { id: "q7a", label: "7. Delayed recall: Apple", points: 1 },
  { id: "q7b", label: "7. Delayed recall: Pen", points: 1 },
  { id: "q7c", label: "7. Delayed recall: Tie", points: 1 },
  { id: "q7d", label: "7. Delayed recall: House", points: 1 },
  { id: "q7e", label: "7. Delayed recall: Car", points: 1 },
  { id: "q8a", label: "8. Backwards number: 87", points: 0 },
  { id: "q8b", label: "8. Backwards number: 648", points: 1 },
  { id: "q8c", label: "8. Backwards number: 8537", points: 1 },
  { id: "q9a", label: "9. Clock: hour markers okay", points: 2 },
  { id: "q9b", label: "9. Clock: time correct", points: 2 },
  { id: "q10a", label: "10. Place an X in the triangle", points: 1 },
  { id: "q10b", label: "10. Identify largest figure", points: 1 },
  { id: "q11a", label: "11. Story: female name", points: 2 },
  { id: "q11b", label: "11. Story: what work did she do?", points: 2 },
  { id: "q11c", label: "11. Story: when did she go back to work?", points: 2 },
  { id: "q11d", label: "11. Story: what state did she live in?", points: 2 },
];

export function calculateScore(selectedById) {
  return QUESTION_ITEMS.reduce((sum, item) => {
    return selectedById[item.id] ? sum + item.points : sum;
  }, 0);
}

export function getInterpretation(score, highSchoolEducation) {
  if (highSchoolEducation) {
    if (score >= 27) return "Normal";
    if (score >= 21) return "Mild neurocognitive disorder";
    return "Dementia";
  }
  if (score >= 25) return "Normal";
  if (score >= 20) return "Mild neurocognitive disorder";
  return "Dementia";
}
