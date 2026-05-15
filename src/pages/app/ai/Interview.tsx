import { AIChat } from "./AIChat";
const Interview = () => (
  <AIChat tool="interview" title="Interview Prep" subtitle="Mock interviews with feedback" multiline
    placeholder="Tell me the role, company, and round (behavioral / technical / system design) — I'll start a mock interview."
    starter={"Start a mock interview for me.\n- Role:\n- Company (optional):\n- Round (behavioral/technical/system-design):\n- My background:"} />
);
export default Interview;