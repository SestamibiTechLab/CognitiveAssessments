import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { addSessionScore, clearSessionHistory, getSessionHistory } from "./src/features/history/session-store";
import { QUESTION_ITEMS, STORY_TEXT, calculateScore, getInterpretation } from "./src/features/slums/scoring";
import { calculateRudasScore, getRudasInterpretation, getRudasQuestionScores } from "./src/features/rudas/scoring";
import { AD8_ITEMS, calculateAd8Score, getAd8Interpretation, getAd8QuestionScores } from "./src/features/ad8/scoring";

const QUESTION_GROUPS = [
  { label: "Question 1", ids: ["q1"] },
  { label: "Question 2", ids: ["q2"] },
  { label: "Question 3", ids: ["q3"] },
  { label: "Question 5", ids: ["q5a", "q5b"] },
  { label: "Question 6", ids: ["q6a", "q6b", "q6c", "q6d"] },
  { label: "Question 7", ids: ["q7a", "q7b", "q7c", "q7d", "q7e"] },
  { label: "Question 8", ids: ["q8a", "q8b", "q8c"] },
  { label: "Question 9", ids: ["q9a", "q9b"] },
  { label: "Question 10", ids: ["q10a", "q10b"] },
  { label: "Question 11", ids: ["q11a", "q11b", "q11c", "q11d"] },
];

function questionScores(answers) {
  return QUESTION_GROUPS.map((group) => {
    const pts = group.ids.reduce((sum, id) => {
      const item = QUESTION_ITEMS.find((q) => q.id === id);
      return answers?.[id] && item ? sum + item.points : sum;
    }, 0);
    return { label: group.label, pts };
  });
}

function Button({ label, onPress, variant = "primary" }) {
  return (
    <Pressable
      style={[styles.button, variant === "secondary" ? styles.buttonSecondary : styles.buttonPrimary]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function QuestionSection({ title, maxPoints, children }) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionTitle}>{title}</Text>
        {maxPoints > 0 && (
          <View style={styles.maxBadge}>
            <Text style={styles.maxBadgeText}>/{maxPoints}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

function ScoreDot({ selected, points }) {
  return (
    <View style={[styles.scoreDot, selected && styles.scoreDotSelected]}>
      <Text style={[styles.scoreDotText, selected && styles.scoreDotTextSelected]}>{points}</Text>
    </View>
  );
}

function CubeOutline() {
  const diagLine = { position: "absolute", width: 42, height: 2, backgroundColor: "#333", transform: [{ rotate: "-45deg" }] };
  return (
    <View style={{ width: 130, height: 110 }}>
      {/* Front face */}
      <View style={{ position: "absolute", left: 20, top: 40, width: 60, height: 60, borderWidth: 2, borderColor: "#333" }} />
      {/* Back face */}
      <View style={{ position: "absolute", left: 50, top: 10, width: 60, height: 60, borderWidth: 2, borderColor: "#333" }} />
      {/* Corner connectors */}
      <View style={[diagLine, { top: 24, left: 14 }]} />
      <View style={[diagLine, { top: 24, left: 74 }]} />
      <View style={[diagLine, { top: 84, left: 74 }]} />
      <View style={[diagLine, { top: 84, left: 14 }]} />
    </View>
  );
}

function TriangleOutline() {
  return (
    <View style={{ width: 116, height: 68 }}>
      <View style={{ position: "absolute", left: 20, top: 65, width: 76, height: 2, backgroundColor: "#333" }} />
      <View style={{ position: "absolute", left: 1, top: 32, width: 76, height: 2, backgroundColor: "#333", transform: [{ rotate: "-60deg" }] }} />
      <View style={{ position: "absolute", left: 39, top: 32, width: 76, height: 2, backgroundColor: "#333", transform: [{ rotate: "60deg" }] }} />
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState("main");
  const [highSchoolEducation, setHighSchoolEducation] = useState(true);
  const [selectedById, setSelectedById] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [shapeState, setShapeState] = useState({ square: false, triangle: false, rectangle: false });
  const [largestShape, setLargestShape] = useState("");
  const [saved, setSaved] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [returnScreen, setReturnScreen] = useState("main");
  const savedTimer = useRef(null);

  const goHistory = (from) => { setReturnScreen(from); setScreen("history"); };

  const [rudasAnswers, setRudasAnswers] = useState({});
  const [rudasAnimalCount, setRudasAnimalCount] = useState(0);
  const [rudasTimerSeconds, setRudasTimerSeconds] = useState(60);
  const [rudasTimerRunning, setRudasTimerRunning] = useState(false);

  const [ad8Answers, setAd8Answers] = useState({});
  const [showCube, setShowCube] = useState(false);

  useEffect(() => {
    getSessionHistory().then(setHistory);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (timerSeconds === 0) {
      setRunning(false);
      return;
    }
    const handle = setTimeout(() => setTimerSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(handle);
  }, [running, timerSeconds]);

  useEffect(() => {
    if (!rudasTimerRunning) return;
    if (rudasTimerSeconds === 0) {
      setRudasTimerRunning(false);
      return;
    }
    const handle = setTimeout(() => setRudasTimerSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(handle);
  }, [rudasTimerRunning, rudasTimerSeconds]);

  useEffect(() => {
    const backMap = {
      home: "main",
      rudas: "main",
      moca: "main",
      ad8: "main",
      about: "main",
      privacy: "about",
      assessment: "home",
      credits: "home",
      rudas_assessment: "rudas",
      rudas_credits: "rudas",
      ad8_assessment: "ad8",
      ad8_credits: "ad8",
    };
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "main") return false;
      if (screen === "history") { setScreen(returnScreen); return true; }
      const dest = backMap[screen];
      if (dest) { setScreen(dest); return true; }
      return false;
    });
    return () => handler.remove();
  }, [screen, returnScreen]);

  const score = calculateScore(selectedById);
  const interpretation = getInterpretation(score, highSchoolEducation);

  const resetAssessment = () => {
    setHighSchoolEducation(true);
    setSelectedById({});
    setTimerSeconds(60);
    setRunning(false);
    setShapeState({ square: false, triangle: false, rectangle: false });
    setLargestShape("");
    setSaved(false);
  };

  const resetRudasAssessment = () => {
    setRudasAnswers({});
    setRudasAnimalCount(0);
    setRudasTimerSeconds(60);
    setRudasTimerRunning(false);
    setSaved(false);
    setShowCube(false);
  };

  const resetAd8Assessment = () => {
    setAd8Answers({});
    setSaved(false);
  };

  const isSelected = (id) => Boolean(selectedById[id]);
  const toggleScore = (id) => setSelectedById((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectSingleChoice = (ids, selectedId) => {
    setSelectedById((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = false; });
      next[selectedId] = true;
      return next;
    });
  };

  const setRudasField = (key, val) => setRudasAnswers((prev) => ({ ...prev, [key]: val }));
  const toggleRudas = (key) => setRudasAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAd8Field = (key, val) => setAd8Answers((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    await addSessionScore({ assessmentType: "SLUMS", score, highSchoolEducation, interpretation, answers: selectedById, createdAt: Date.now() });
    setHistory(await getSessionHistory());
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
  };

  const ad8HandleSave = async () => {
    const as = calculateAd8Score(ad8Answers);
    const ai = getAd8Interpretation(as);
    await addSessionScore({
      assessmentType: "AD8",
      score: as,
      interpretation: ai,
      answers: { ...ad8Answers },
      createdAt: Date.now(),
    });
    setHistory(await getSessionHistory());
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
  };

  const rudasHandleSave = async () => {
    const rs = calculateRudasScore(rudasAnswers, rudasAnimalCount);
    const ri = getRudasInterpretation(rs);
    await addSessionScore({
      assessmentType: "RUDAS",
      score: rs,
      interpretation: ri,
      answers: { ...rudasAnswers, animalCount: rudasAnimalCount },
      createdAt: Date.now(),
    });
    setHistory(await getSessionHistory());
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
  };

  if (screen === "assessment") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>SLUMS Mental Status Exam</Text>
        <QuestionSection title="1. What day of the week is it?" maxPoints={1}>
          <Pressable style={styles.row} onPress={() => toggleScore("q1")}>
            <Text>Correct</Text>
            <ScoreDot selected={isSelected("q1")} points={1} />
          </Pressable>
        </QuestionSection>

        <QuestionSection title="2. What is the year?" maxPoints={1}>
          <Pressable style={styles.row} onPress={() => toggleScore("q2")}>
            <Text>Correct</Text>
            <ScoreDot selected={isSelected("q2")} points={1} />
          </Pressable>
        </QuestionSection>

        <QuestionSection title="3. What state are we in?" maxPoints={1}>
          <Pressable style={styles.row} onPress={() => toggleScore("q3")}>
            <Text>Correct</Text>
            <ScoreDot selected={isSelected("q3")} points={1} />
          </Pressable>
        </QuestionSection>

        <QuestionSection
          title="4. Please remember these five objects. I will ask you what they are later."
          maxPoints={0}
        >
          <Text selectable style={styles.story}>
            Apple     Pen     Tie     House     Car
          </Text>
        </QuestionSection>

        <QuestionSection
          title="5. You have $100 and you go to the store and buy a dozen apples for $3 and a tricycle for $20."
          maxPoints={3}
        >
          <Pressable style={styles.row} onPress={() => toggleScore("q5a")}>
            <Text>How much did you spend?</Text>
            <ScoreDot selected={isSelected("q5a")} points={1} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => toggleScore("q5b")}>
            <Text>How much do you have left?</Text>
            <ScoreDot selected={isSelected("q5b")} points={2} />
          </Pressable>
        </QuestionSection>

        <QuestionSection title="6. Please name as many animals as you can in one minute." maxPoints={3}>
          <Text style={styles.mutedSmall}>Timer: {timerSeconds}s</Text>
          <Button
            label={running ? "Reset Timer" : "Start Timer"}
            variant="secondary"
            onPress={() => {
              if (running) {
                setRunning(false);
                setTimerSeconds(60);
              } else {
                setRunning(true);
              }
            }}
          />
          {[
            ["q6a", "0-4 animals", 0],
            ["q6b", "5-9 animals", 1],
            ["q6c", "10-14 animals", 2],
            ["q6d", "15+ animals", 3],
          ].map(([id, label, pts]) => (
            <Pressable key={id} style={styles.row} onPress={() => selectSingleChoice(["q6a", "q6b", "q6c", "q6d"], id)}>
              <Text>{label}</Text>
              <ScoreDot selected={isSelected(id)} points={pts} />
            </Pressable>
          ))}
        </QuestionSection>

        <QuestionSection
          title="7. What were the five objects I asked you to remember?"
          maxPoints={5}
        >
          <Text style={styles.cardTitle}>
            1 point for each one correct.
          </Text>
          {[
            ["q7a", "Apple"],
            ["q7b", "Pen"],
            ["q7c", "Tie"],
            ["q7d", "House"],
            ["q7e", "Car"],
          ].map(([id, label]) => (
            <Pressable key={id} style={styles.row} onPress={() => toggleScore(id)}>
              <Text>{label}</Text>
              <ScoreDot selected={isSelected(id)} points={1} />
            </Pressable>
          ))}
        </QuestionSection>

        <QuestionSection
          title="8. I am going to give you a series of numbers and I would like you to give them to me backwards."
          maxPoints={2}
        >
          <Text style={styles.mutedSmall}>Example: if I say 42, you would say 24.</Text>
          {[
            ["q8a", "87", 0],
            ["q8b", "648", 1],
            ["q8c", "8537", 1],
          ].map(([id, label, pts]) => (
            <Pressable key={id} style={styles.row} onPress={() => toggleScore(id)}>
              <Text>{label}</Text>
              <ScoreDot selected={isSelected(id)} points={pts} />
            </Pressable>
          ))}
        </QuestionSection>

        <QuestionSection
          title="9. I am going to give you a sheet of paper with a circle on it. This is a clock face. First, put the hour markers on it. Secondly, draw the time at ten minutes to eleven o'clock."
          maxPoints={4}
        >
          <Pressable style={styles.row} onPress={() => toggleScore("q9a")}>
            <Text>Hour markers okay</Text>
            <ScoreDot selected={isSelected("q9a")} points={2} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => toggleScore("q9b")}>
            <Text>Time correct</Text>
            <ScoreDot selected={isSelected("q9b")} points={2} />
          </Pressable>
        </QuestionSection>

        <QuestionSection title="10. Please point to the triangle." maxPoints={2}>
          <View style={styles.shapesContainer}>
            <Pressable
              style={[styles.shapeWrapper, shapeState.square && styles.activeCard]}
              onPress={() => setShapeState((prev) => ({ square: !prev.square, triangle: false, rectangle: false }))}
            >
              <View style={styles.shapeSquare} />
            </Pressable>
            <Pressable
              style={[styles.shapeWrapper, shapeState.triangle && styles.activeCard]}
              onPress={() => setShapeState((prev) => ({ square: false, triangle: !prev.triangle, rectangle: false }))}
            >
              <TriangleOutline />
            </Pressable>
            <Pressable
              style={[styles.shapeWrapper, shapeState.rectangle && styles.activeCard]}
              onPress={() => setShapeState((prev) => ({ square: false, triangle: false, rectangle: !prev.rectangle }))}
            >
              <View style={styles.shapeRectangle} />
            </Pressable>
          </View>
          <Pressable style={styles.row} onPress={() => toggleScore("q10a")}>
            <Text>Triangle selected</Text>
            <ScoreDot selected={isSelected("q10a")} points={1} />
          </Pressable>
          <Text style={styles.cardTitle}>Which of these figures is largest?</Text>
          <View style={styles.shapesContainer}>
            <Pressable
              style={[styles.shapeWrapper, largestShape === "square" && styles.activeCard]}
              onPress={() => setLargestShape("square")}
            >
              <View style={styles.shapeSquare} />
            </Pressable>
            <Pressable
              style={[styles.shapeWrapper, largestShape === "triangle" && styles.activeCard]}
              onPress={() => setLargestShape("triangle")}
            >
              <TriangleOutline />
            </Pressable>
            <Pressable
              style={[styles.shapeWrapper, largestShape === "rectangle" && styles.activeCard]}
              onPress={() => setLargestShape("rectangle")}
            >
              <View style={styles.shapeRectangle} />
            </Pressable>
          </View>
          <Pressable style={styles.row} onPress={() => toggleScore("q10b")}>
            <Text>Largest figure answer correct</Text>
            <ScoreDot selected={isSelected("q10b")} points={1} />
          </Pressable>
        </QuestionSection>

        <QuestionSection
          title="11. I am going to tell you a story. Please listen carefully because afterwards, I'm going to ask you some questions about it."
          maxPoints={8}
        >
          <Text selectable style={styles.story}>
            {STORY_TEXT}
          </Text>
          <Button
            label="Play / Stop Story Audio"
            onPress={async () => {
              const speaking = await Speech.isSpeakingAsync();
              if (speaking) {
                Speech.stop();
              } else {
                Speech.speak(STORY_TEXT, { language: "en-US", rate: 0.75 });
              }
            }}
          />
          <Pressable style={styles.row} onPress={() => toggleScore("q11a")}>
            <Text>What was the female's name?</Text>
            <ScoreDot selected={isSelected("q11a")} points={2} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => toggleScore("q11b")}>
            <Text>What work did she do?</Text>
            <ScoreDot selected={isSelected("q11b")} points={2} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => toggleScore("q11c")}>
            <Text>When did she go back to work?</Text>
            <ScoreDot selected={isSelected("q11c")} points={2} />
          </Pressable>
          <Pressable style={styles.row} onPress={() => toggleScore("q11d")}>
            <Text>What state did she live in?</Text>
            <ScoreDot selected={isSelected("q11d")} points={2} />
          </Pressable>
        </QuestionSection>

        <View style={styles.questionCard}>
          <View style={[styles.row, { borderTopWidth: 0, paddingTop: 0 }]}>
            <Text>Finished High School</Text>
            <Switch value={highSchoolEducation} onValueChange={setHighSchoolEducation} />
          </View>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.bigText}>Score: {score} / 30</Text>
          <Text style={styles.cardTitle}>{interpretation}</Text>
          <Text style={styles.mutedSmall}>
            High school: 27-30 normal, 21-26 mild neurocognitive disorder, 1-20 dementia
          </Text>
          <Text style={styles.mutedSmall}>
            No high school: 25-30 normal, 20-24 mild neurocognitive disorder, 1-19 dementia
          </Text>
        </View>

        <Button label="Save Anonymous Result" onPress={handleSave} />
        {saved && <Text style={styles.savedText}>Saved!</Text>}
        <Button label="View History" variant="secondary" onPress={() => goHistory("assessment")} />
        <Button
          label="Start New Assessment"
          variant="secondary"
          onPress={() => {
            resetAssessment();
          }}
        />
        <Button label="Back Home" variant="secondary" onPress={() => setScreen("home")} />
      </ScrollView>
    );
  }

  if (screen === "credits") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Credits</Text>
        <Text style={styles.creditsBody}>
          The Saint Louis University Mental Status exam is an assessment tool for mild cognitive impairment and dementia and was developed in partnership with the Geriatrics Research, Education and Clinical Center at the St. Louis Veterans Administration Medical Center.
        </Text>
        <Text style={styles.creditsReference}>
          SH Tariq, N Tumosa, JT Chibnall, HM Perry III, and JE Morley. The Saint Louis University Mental Status (SLUMS) Examination for detecting mild cognitive impairment and dementia is more sensitive than the Mini-Mental Status Examination (MMSE) - A pilot study. <Text style={styles.creditsJournal}>Am J Geriatr Psych</Text> 14:900-10, 2006.
        </Text>
        <Button label="Back" variant="secondary" onPress={() => setScreen("home")} />
      </ScrollView>
    );
  }

  if (screen === "rudas_assessment") {
    const boCount = ['rb1','rb2','rb3','rb4','rb5','rb6','rb7','rb8'].filter(id => rudasAnswers[id]).length;
    const rudasScore = calculateRudasScore(rudasAnswers, rudasAnimalCount);
    const rudasInterpretation = getRudasInterpretation(rudasScore);

    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>RUDAS Assessment</Text>

        {/* Item 1: Memory Registration (no scoring) */}
        <QuestionSection title="Item 1: Memory Registration" maxPoints={0}>
          <Text style={styles.rudasInstruction}>
            Read the following grocery list to the patient. Ask them to repeat it. Repeat up to 5 times until they can recall all items.
          </Text>
          <Text style={styles.story}>
            Tea{"\n"}Cooking Oil{"\n"}Eggs{"\n"}Soap
          </Text>
          <Text style={styles.rudasInstruction}>
            No score for this item. The list will be recalled later (Item 1R).
          </Text>
        </QuestionSection>

        {/* Item 2: Body Orientation */}
        <QuestionSection title="Item 2: Body Orientation" maxPoints={5}>
          <Text style={styles.rudasInstruction}>
            Ask the patient to perform each action. Mark correct responses. Maximum 5 points (first 5 correct count).
          </Text>
          {[
            ["rb1", "Show me your right foot"],
            ["rb2", "Show me your left hand"],
            ["rb3", "Use your right hand to touch your left shoulder"],
            ["rb4", "Use your left hand to touch your right ear"],
            ["rb5", "Which is my left knee?"],
            ["rb6", "Which is my right elbow?"],
            ["rb7", "Use your right hand to point to my left eye"],
            ["rb8", "Use your left hand to point to my left foot"],
          ].map(([id, label]) => (
            <Pressable key={id} style={styles.row} onPress={() => toggleRudas(id)}>
              <Text style={{ flex: 1, marginRight: 8 }}>{label}</Text>
              <ScoreDot selected={Boolean(rudasAnswers[id])} points={1} />
            </Pressable>
          ))}
          <Text style={styles.mutedSmall}>
            Tally: {Math.min(boCount, 5)} / 5 (from {boCount} correct)
          </Text>
        </QuestionSection>

        {/* Item 3: Praxis */}
        <QuestionSection title="Item 3: Praxis — Fist/Palm" maxPoints={2}>
          <Text style={styles.rudasInstruction}>
            "I am going to show you an action/exercise with my hands. I want you to watch me and copy what I do." Demonstrate alternating fist/palm for approximately 10 seconds.
          </Text>
          {[
            [0, "Failed"],
            [1, "Partially Adequate"],
            [2, "Normal"],
          ].map(([val, label]) => (
            <Pressable
              key={val}
              style={styles.row}
              onPress={() => setRudasField("praxis", val)}
            >
              <Text>{label}</Text>
              <ScoreDot selected={rudasAnswers.praxis === val} points={val} />
            </Pressable>
          ))}
        </QuestionSection>

        {/* Item 4: Drawing */}
        <QuestionSection title="Item 4: Drawing — Cube" maxPoints={3}>
          <Text style={styles.rudasInstruction}>
            "Please draw this picture exactly as it looks to you." Show a cube drawing. Score each criterion independently.
          </Text>
          <Button
            label={showCube ? "Hide Cube" : "Show Cube"}
            variant="secondary"
            onPress={() => setShowCube((v) => !v)}
          />
          {showCube && (
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <CubeOutline />
            </View>
          )}
          {[
            ["rd1", "Has person drawn a picture based on a square?"],
            ["rd2", "Do all internal lines appear?"],
            ["rd3", "Do all external lines appear?"],
          ].map(([id, label]) => (
            <Pressable key={id} style={styles.row} onPress={() => toggleRudas(id)}>
              <Text style={{ flex: 1, marginRight: 8 }}>{label}</Text>
              <ScoreDot selected={Boolean(rudasAnswers[id])} points={1} />
            </Pressable>
          ))}
        </QuestionSection>

        {/* Item 5: Judgement */}
        <QuestionSection title="Item 5: Judgement — Crossing the Street" maxPoints={4}>
          <Text style={styles.rudasInstruction}>
            "You are standing on the side of a busy street. There is no pedestrian crossing and no traffic lights. Tell me what you would do to get across to the other side of the street safely."
          </Text>
          <Text style={styles.cardTitle}>Did person indicate they would look for traffic?</Text>
          {[
            [0, "No"],
            [1, "Yes (prompted)"],
            [2, "Yes (unprompted)"],
          ].map(([val, label]) => (
            <Pressable
              key={val}
              style={styles.row}
              onPress={() => setRudasField("rj1", val)}
            >
              <Text>{label}</Text>
              <ScoreDot selected={rudasAnswers.rj1 === val} points={val} />
            </Pressable>
          ))}
          <Text style={[styles.cardTitle, { marginTop: 8 }]}>Did person make any additional safety proposals?</Text>
          {[
            [0, "No"],
            [1, "Yes (prompted)"],
            [2, "Yes (unprompted)"],
          ].map(([val, label]) => (
            <Pressable
              key={val}
              style={styles.row}
              onPress={() => setRudasField("rj2", val)}
            >
              <Text>{label}</Text>
              <ScoreDot selected={rudasAnswers.rj2 === val} points={val} />
            </Pressable>
          ))}
        </QuestionSection>

        {/* Item 1R: Memory Recall */}
        <QuestionSection title="Item 1R: Memory Recall" maxPoints={8}>
          <Text style={styles.rudasInstruction}>
            "We have just arrived at the shop. Can you remember the list of groceries we need to buy?" 2 points each for unprompted recall. If no recall at all, prompt with "The first one was tea" (Tea then scores 0).
          </Text>
          {[
            ["rm1", "Tea"],
            ["rm2", "Cooking Oil"],
            ["rm3", "Eggs"],
            ["rm4", "Soap"],
          ].map(([id, label]) => (
            <Pressable key={id} style={styles.row} onPress={() => toggleRudas(id)}>
              <Text>{label}</Text>
              <ScoreDot selected={Boolean(rudasAnswers[id])} points={2} />
            </Pressable>
          ))}
        </QuestionSection>

        {/* Item 6: Language */}
        <QuestionSection title="Item 6: Language — Animal Naming" maxPoints={8}>
          <Text style={styles.rudasInstruction}>
            "I am going to time you for one minute. In that one minute, I would like you to tell me the names of as many different animals as you can."
          </Text>
          <Text style={styles.mutedSmall}>Timer: {rudasTimerSeconds}s</Text>
          <Button
            label={rudasTimerRunning ? "Reset Timer" : "Start Timer"}
            variant="secondary"
            onPress={() => {
              if (rudasTimerRunning) {
                setRudasTimerRunning(false);
                setRudasTimerSeconds(60);
              } else {
                setRudasTimerRunning(true);
              }
            }}
          />
          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setRudasAnimalCount((c) => Math.max(0, c - 1))}
            >
              <Text style={styles.counterBtnText}>−</Text>
            </Pressable>
            <Text style={styles.counterValue}>{rudasAnimalCount} animals</Text>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setRudasAnimalCount((c) => Math.min(8, c + 1))}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.mutedSmall}>Score: {Math.min(rudasAnimalCount, 8)} / 8 pts</Text>
        </QuestionSection>

        {/* Score Card */}
        <View style={styles.resultCard}>
          <Text style={styles.bigText}>Score: {rudasScore} / 30</Text>
          <Text style={styles.cardTitle}>{rudasInterpretation}</Text>
          <Text style={styles.mutedSmall}>23–30: Within normal range</Text>
          <Text style={styles.mutedSmall}>≤22: Possible cognitive impairment — refer for further investigation</Text>
        </View>

        <Button label="Save Anonymous Result" onPress={rudasHandleSave} />
        {saved && <Text style={styles.savedText}>Saved!</Text>}
        <Button label="View History" variant="secondary" onPress={() => goHistory("rudas_assessment")} />
        <Button
          label="Start New Assessment"
          variant="secondary"
          onPress={() => {
            resetRudasAssessment();
          }}
        />
        <Button label="Back" variant="secondary" onPress={() => setScreen("rudas")} />
      </ScrollView>
    );
  }

  if (screen === "rudas_credits") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Credits</Text>
        <Text style={styles.creditsBody}>
          The Rowland Universal Dementia Assessment Scale (RUDAS): A Multicultural Cognitive Assessment Scale – (Storey J, Rowland J, Basic D, Conforti D &amp; Dickson H [2004] <Text style={styles.creditsJournal}>International Psychogeriatrics</Text>, 16(1) 13-31) is a short cognitive screening instrument designed to minimise the effects of cultural learning and language diversity on the assessment of baseline cognitive performance.
        </Text>
        <Button label="Back" variant="secondary" onPress={() => setScreen("rudas")} />
      </ScrollView>
    );
  }

  if (screen === "ad8") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.homeContent}>
        <Text style={styles.title}>AD8</Text>
        <Text style={styles.muted}>AD8 Dementia Screening Interview</Text>
        <Text style={styles.muted}>Anonymous mode is enabled: no PHI is stored.</Text>
        <Button label="Start Assessment" onPress={() => { resetAd8Assessment(); setScreen("ad8_assessment"); }} />
        <Button label="Anonymous History" variant="secondary" onPress={() => goHistory("ad8")} />
        <Button label="Credits" variant="secondary" onPress={() => setScreen("ad8_credits")} />
        <Button label="Back" variant="secondary" onPress={() => setScreen("main")} />
      </ScrollView>
    );
  }

  if (screen === "ad8_assessment") {
    const ad8Score = calculateAd8Score(ad8Answers);
    const ad8Interpretation = getAd8Interpretation(ad8Score);
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>AD8 Dementia Screening</Text>
        <View style={styles.questionCard}>
          <Text style={styles.mutedSmall}>
            Remember, "Yes, a change" indicates that there has been a change in the last several years caused by cognitive (thinking and memory) problems.
          </Text>
        </View>
        {AD8_ITEMS.map((item) => (
          <QuestionSection key={item.id} title={item.text} maxPoints={0}>
            <View style={styles.ad8Row}>
              {[
                ["yes", "Yes, A change"],
                ["no", "No, No change"],
                ["na", "N/A"],
              ].map(([val, label]) => (
                <Pressable
                  key={val}
                  style={[styles.ad8Choice, ad8Answers[item.id] === val && styles.ad8ChoiceActive]}
                  onPress={() => setAd8Field(item.id, val)}
                >
                  <Text style={[styles.ad8ChoiceText, ad8Answers[item.id] === val && styles.ad8ChoiceTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </QuestionSection>
        ))}

        <View style={styles.resultCard}>
          <Text style={styles.bigText}>Score: {ad8Score} / 8</Text>
          <Text style={styles.cardTitle}>{ad8Interpretation}</Text>
          <Text style={styles.mutedSmall}>0–1: Normal cognition   |   2+: Cognitive impairment likely</Text>
        </View>

        <Button label="Save Anonymous Result" onPress={ad8HandleSave} />
        {saved && <Text style={styles.savedText}>Saved!</Text>}
        <Button label="View History" variant="secondary" onPress={() => goHistory("ad8_assessment")} />
        <Button label="Start New Assessment" variant="secondary" onPress={resetAd8Assessment} />
        <Button label="Back" variant="secondary" onPress={() => setScreen("ad8")} />
      </ScrollView>
    );
  }

  if (screen === "ad8_credits") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Credits</Text>
        <Text style={styles.creditsBody}>
          Adapted from Galvin JE et al, The AD8, a brief informant interview to detect dementia, <Text style={styles.creditsJournal}>Neurology</Text> 2005:65:559-564. Copyright 2005. The AD8 is a copyrighted instrument of the Alzheimer's Disease Research Center, Washington University, St. Louis, Missouri. All Rights Reserved.
        </Text>
        <Button label="Back" variant="secondary" onPress={() => setScreen("ad8")} />
      </ScrollView>
    );
  }

  if (screen === "history") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Anonymous History</Text>
        <Text>No names stored.</Text>
        {history.length === 0 ? (
          <Text style={styles.muted}>No saved entries yet.</Text>
        ) : (
          history.map((entry, index) => {
            const key = `${entry.createdAt}-${index}`;
            const expanded = expandedEntries.has(key);
            const toggle = () => setExpandedEntries((prev) => {
              const next = new Set(prev);
              expanded ? next.delete(key) : next.add(key);
              return next;
            });
            return (
              <Pressable style={styles.card} key={key} onPress={toggle}>
                <View style={styles.historyRow}>
                  <Text style={styles.cardTitle}>Score: {entry.score} / {entry.assessmentType === "AD8" ? 8 : 30}</Text>
                  <Text style={styles.mutedSmall}>{expanded ? "▲" : "▼"}</Text>
                </View>
                {entry.assessmentType && <Text style={styles.mutedSmall}>{entry.assessmentType}</Text>}
                <Text>{entry.interpretation}</Text>
                <Text style={styles.mutedSmall}>{new Date(entry.createdAt).toLocaleString()}</Text>
                {expanded && (
                  <>
                    <View style={styles.historyDivider} />
                    {(entry.assessmentType === "RUDAS"
                      ? getRudasQuestionScores(entry.answers)
                      : entry.assessmentType === "AD8"
                        ? getAd8QuestionScores(entry.answers)
                        : questionScores(entry.answers)
                    ).map(({ label, pts }) => (
                      <View key={label} style={styles.historyRow}>
                        <Text style={styles.mutedSmall}>{label}</Text>
                        <Text style={styles.mutedSmall}>{pts}</Text>
                      </View>
                    ))}
                  </>
                )}
              </Pressable>
            );
          })
        )}
        <Button
          label="Clear History"
          variant="secondary"
          onPress={async () => {
            await clearSessionHistory();
            setHistory([]);
          }}
        />
        <Button label="Return to Assessment" variant="secondary" onPress={() => setScreen(returnScreen)} />
        <Button label="Back Home" onPress={() => setScreen("main")} />
      </ScrollView>
    );
  }

  if (screen === "home") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.homeContent}>
        <Text style={styles.title}>SLUMS Mental Status Exam</Text>
        <Text style={styles.muted}>Anonymous mode is enabled: no PHI is stored.</Text>
        <Button label="Start Assessment" onPress={() => { resetAssessment(); setScreen("assessment"); }} />
        <Button label="Anonymous History" variant="secondary" onPress={() => goHistory("home")} />
        <Button label="Credits" variant="secondary" onPress={() => setScreen("credits")} />
        <Button label="Back" variant="secondary" onPress={() => setScreen("main")} />
        <StatusBar style="auto" />
      </ScrollView>
    );
  }

  if (screen === "rudas") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.homeContent}>
        <Text style={styles.title}>RUDAS</Text>
        <Text style={styles.muted}>Rowland Universal Dementia Assessment Scale</Text>
        <Text style={styles.muted}>Anonymous mode is enabled: no PHI is stored.</Text>
        <Button label="Start Assessment" onPress={() => { resetRudasAssessment(); setScreen("rudas_assessment"); }} />
        <Button label="Anonymous History" variant="secondary" onPress={() => goHistory("rudas")} />
        <Button label="Credits" variant="secondary" onPress={() => setScreen("rudas_credits")} />
        <Button label="Back" variant="secondary" onPress={() => setScreen("main")} />
      </ScrollView>
    );
  }

  if (screen === "about") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.homeContent}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.creditsBody}>
          Cognitive Assessments is a free tool for clinicians and caregivers to administer validated cognitive screening assessments. No personal health information is stored.
        </Text>
        <Pressable onPress={() => Linking.openURL("https://ko-fi.com/sestamibitechlab")}>
          <Text style={styles.link}>Donate</Text>
        </Pressable>
        <Pressable onPress={() => setScreen("privacy")}>
          <Text style={styles.link}>Privacy Policy</Text>
        </Pressable>
        <Button label="Back" variant="secondary" onPress={() => setScreen("main")} />
      </ScrollView>
    );
  }

  if (screen === "privacy") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.mutedSmall}>Last updated: May 3, 2026</Text>

        <Text style={styles.privacySection}>For Reference Only — Not a Medical Device</Text>
        <Text style={styles.creditsBody}>
          This app is intended solely as a reference aid and scoring tool. It does not provide medical diagnoses, clinical recommendations, or treatment plans. Scores and interpretations are screening results only and must not be used as the sole basis for any clinical decision. Always consult a licensed healthcare provider for diagnosis and treatment.
        </Text>

        <Text style={styles.privacySection}>Data We Do Not Collect</Text>
        <Text style={styles.creditsBody}>
          We do not access, collect, use, transmit, or share any personal or sensitive information, including name, date of birth, protected health information, health or fitness data, location, device identifiers, or any other identifying information. No data is ever transmitted to any server, third party, or external service.
        </Text>

        <Text style={styles.privacySection}>Local Storage (Anonymous Session History)</Text>
        <Text style={styles.creditsBody}>
          The optional anonymous session history is stored exclusively on your device. It contains no patient name, identifier, or personally identifying information, is never transmitted off the device, and can be deleted at any time using "Clear History."
        </Text>

        <Text style={styles.privacySection}>Permissions</Text>
        <Text style={styles.creditsBody}>
          The app does not request any dangerous or runtime permissions. The only system capability used is the device's built-in text-to-speech engine to optionally read assessment text aloud, which does not access the microphone or any personal data.
        </Text>

        <Text style={styles.privacySection}>Medical Literature</Text>
        <Text style={styles.creditsBody}>
          All assessment content is derived exclusively from peer-reviewed medical literature and validated clinical instruments. Relevant references are available in the Credits section of each assessment.
        </Text>

        <Text style={styles.privacySection}>Full Policy</Text>
        <Text style={styles.creditsBody}>
          The complete privacy policy is available at the link below.
        </Text>
        <Pressable onPress={() => Linking.openURL("https://sestamibitechlab.github.io/CognitiveAssessments/privacy-policy.html")}>
          <Text style={styles.link}>View full privacy policy</Text>
        </Pressable>

        <Button label="Back" variant="secondary" onPress={() => setScreen("about")} />
      </ScrollView>
    );
  }

  if (screen === "moca") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.homeContent}>
        <Text style={styles.title}>MoCA</Text>
        <Text style={styles.muted}>Montreal Cognitive Assessment</Text>
        <Text style={styles.creditsBody}>
          The MoCA test and instructions are only to be accessed through the MoCA website due to copyright.
        </Text>
        <Pressable onPress={() => Linking.openURL("https://mocacognition.com/paper")}>
          <Text style={styles.link}>mocacognition.com/paper</Text>
        </Pressable>
        <Button label="Back" variant="secondary" onPress={() => setScreen("main")} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.homeContent}>
      <Text style={[styles.title, { textAlign: "center" }]}>Cognitive Assessments</Text>
      <Pressable style={styles.assessmentCard} onPress={() => setScreen("home")}>
        <Text style={styles.assessmentCardTitle}>SLUMS</Text>
        <Text style={styles.assessmentCardSubtitle}>Saint Louis University Mental Status Exam</Text>
      </Pressable>
      <Pressable style={styles.assessmentCard} onPress={() => setScreen("rudas")}>
        <Text style={styles.assessmentCardTitle}>RUDAS</Text>
        <Text style={styles.assessmentCardSubtitle}>Rowland Universal Dementia Assessment Scale</Text>
      </Pressable>
      <Pressable style={styles.assessmentCard} onPress={() => setScreen("moca")}>
        <Text style={styles.assessmentCardTitle}>MoCA</Text>
        <Text style={styles.assessmentCardSubtitle}>Montreal Cognitive Assessment</Text>
      </Pressable>
      <Pressable style={styles.assessmentCard} onPress={() => setScreen("ad8")}>
        <Text style={styles.assessmentCardTitle}>AD8</Text>
        <Text style={styles.assessmentCardSubtitle}>AD8 Dementia Screening Interview</Text>
      </Pressable>
      <StatusBar style="auto" />
      <Pressable onPress={() => setScreen("about")} style={{ alignItems: "center", marginTop: 8 }}>
        <Text style={styles.aboutLink}>About</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 64,
    gap: 12,
  },
  homeContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  muted: {
    color: "#555",
  },
  mutedSmall: {
    color: "#666",
    fontSize: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  resultCard: {
    borderWidth: 2,
    borderColor: "#1f2d5c",
    borderRadius: 12,
    padding: 16,
    gap: 6,
    backgroundColor: "#eef2ff",
  },
  questionCard: {
    borderWidth: 2,
    borderColor: "#1f2d5c",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: "#fff",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  questionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#121212",
  },
  maxBadge: {
    borderWidth: 2,
    borderColor: "#1f2d5c",
    borderRadius: 16,
    minWidth: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#eef2ff",
  },
  maxBadgeText: {
    color: "#1f2d5c",
    fontWeight: "700",
  },
  activeCard: {
    borderColor: "#0d6efd",
    backgroundColor: "#eaf2ff",
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  scoreDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1f2d5c",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  scoreDotSelected: {
    backgroundColor: "#1f2d5c",
  },
  scoreDotText: {
    color: "#1f2d5c",
    fontWeight: "700",
    fontSize: 12,
  },
  scoreDotTextSelected: {
    color: "#fff",
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#0d6efd",
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  savedText: {
    textAlign: "center",
    color: "#198754",
    fontWeight: "700",
    fontSize: 16,
  },
  bigText: {
    fontSize: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  story: {
    lineHeight: 22,
  },
  shapesContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: 8,
  },
  shapeWrapper: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  shapeSquare: {
    width: 90,
    height: 90,
    borderWidth: 2,
    borderColor: "#333",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  historyDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 6,
  },
  assessmentCard: {
    borderWidth: 2,
    borderColor: "#1f2d5c",
    borderRadius: 12,
    padding: 16,
    gap: 4,
    backgroundColor: "#fff",
  },
  assessmentCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2d5c",
  },
  assessmentCardSubtitle: {
    fontSize: 13,
    color: "#555",
  },
  creditsBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#222",
  },
  creditsReference: {
    fontSize: 14,
    lineHeight: 21,
    color: "#444",
    borderLeftWidth: 3,
    borderLeftColor: "#1f2d5c",
    paddingLeft: 12,
  },
  creditsJournal: {
    fontStyle: "italic",
  },
  link: {
    color: "#0d6efd",
    textDecorationLine: "underline",
    fontSize: 15,
  },
  ad8Row: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  ad8Choice: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1f2d5c",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  ad8ChoiceActive: {
    backgroundColor: "#1f2d5c",
  },
  ad8ChoiceText: {
    fontSize: 11,
    color: "#1f2d5c",
    textAlign: "center",
    fontWeight: "600",
  },
  ad8ChoiceTextActive: {
    color: "#fff",
  },
  shapeRectangle: {
    width: 55,
    height: 90,
    borderWidth: 2,
    borderColor: "#333",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 8,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1f2d5c",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
  },
  counterValue: {
    fontSize: 20,
    fontWeight: "700",
    minWidth: 100,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  rudasInstruction: {
    color: "#333",
    fontSize: 15,
    lineHeight: 22,
  },
  aboutLink: {
    color: "#888",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  privacySection: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2d5c",
    marginTop: 8,
  },
});
