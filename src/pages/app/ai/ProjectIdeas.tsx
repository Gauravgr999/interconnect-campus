import { AIChat } from "./AIChat";
const ProjectIdeas = () => (
  <AIChat tool="ideas" title="Project Ideas" subtitle="Portfolio-worthy project ideas" multiline
    placeholder="Tell me your skills, interests, and time budget — I'll suggest 5 projects."
    starter={"Suggest project ideas.\n- Skills:\n- Interests:\n- Time available (hrs/week):\n- Goal (portfolio / hackathon / learning):"} />
);
export default ProjectIdeas;