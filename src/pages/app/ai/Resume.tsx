import { AIChat } from "./AIChat";
const Resume = () => (
  <AIChat tool="resume" title="Resume Builder" subtitle="Generate ATS-friendly resume content" multiline
    placeholder="Paste your details (skills, projects, experience, target role) and I'll craft polished resume content."
    starter={"Generate a resume for me. My details:\n- Name:\n- Target role:\n- Skills:\n- Projects:\n- Education:\n- Achievements:"} />
);
export default Resume;