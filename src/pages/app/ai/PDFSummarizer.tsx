import { AIChat } from "./AIChat";
const PDFSummarizer = () => (
  <AIChat tool="pdf" title="PDF Summarizer" subtitle="Summarize long documents" multiline
    placeholder="Paste the full text from your PDF/article and I'll summarize it."
    starter={"Summarize this:\n\n"} />
);
export default PDFSummarizer;