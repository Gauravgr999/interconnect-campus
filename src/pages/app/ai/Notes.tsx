import { AIChat } from "./AIChat";
const Notes = () => (
  <AIChat tool="notes" title="Notes Generator" subtitle="Exam-ready study notes" multiline
    placeholder="Tell me a topic and the depth you want — I'll generate structured notes."
    starter="Generate detailed notes on: " />
);
export default Notes;