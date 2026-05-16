import api from "./api";

export interface JobMatch {
  title:    string;
  match:    number;
  reason:   string;
  url:      string;
  job_type: string;
  location: string;
}

export interface JobAnalysisResponse {
  matches: JobMatch[];
}

export async function analyzeCv(): Promise<JobAnalysisResponse> {
  const { data } = await api.post("/api/ai-jobs/analyze/");
  return data;
}
