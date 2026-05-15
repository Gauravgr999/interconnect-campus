import { AIChat } from "./AIChat";
const Roadmap = () => (
  <AIChat tool="roadmap" title="Roadmap Generator" subtitle="Phased learning roadmaps" multiline
    placeholder="What skill/role do you want a roadmap for?"
    starter={"Generate a learning roadmap for: "} />
);
export default Roadmap;