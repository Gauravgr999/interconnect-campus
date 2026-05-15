import { AIChat } from "./AIChat";
const Research = () => (
  <AIChat tool="research" title="Research Assistant" subtitle="Lit reviews, structure & methodology" multiline
    placeholder="Describe your research topic or paste an abstract — I'll help structure, critique, or summarize."
    starter={"Help me with my research.\n- Topic:\n- Stage (idea / lit review / drafting / revising):\n- What I need:"} />
);
export default Research;