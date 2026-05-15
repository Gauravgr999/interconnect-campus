import { AIChat } from "./AIChat";
const Career = () => (
  <AIChat tool="career" title="Career Guide" subtitle="Career guidance & roadmaps" multiline
    placeholder="Tell me your year, branch, interests, and target role — I'll give grounded career guidance."
    starter={"Guide my career.\n- Year/branch:\n- Skills:\n- Interests:\n- Target role:"} />
);
export default Career;