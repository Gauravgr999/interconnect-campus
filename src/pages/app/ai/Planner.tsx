import { AIChat } from "./AIChat";
const Planner = () => (
  <AIChat tool="planner" title="Study Planner" subtitle="Personalized weekly study plan" multiline
    placeholder="Tell me your subjects, exam dates, and daily hours — I'll plan your weeks."
    starter={"Build my study plan.\n- Subjects:\n- Exam dates:\n- Hours/day available:\n- Weak areas:"} />
);
export default Planner;