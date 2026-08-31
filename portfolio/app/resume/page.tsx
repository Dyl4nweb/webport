import type { Metadata } from "next";
import ResumeViewer from "@/components/resume/ResumeViewer";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Resume",
  description: `Curriculum Vitae and professional experience of ${SITE.name}, ${SITE.role}.`,
};

export default function ResumePage() {
  return <ResumeViewer />;
}
