import api from "./api";

// ── Types ──────────────────────────────────────────────────────────
export interface CV {
  id:             number;
  file_url:       string | null;
  extracted_text: string;
  uploaded_at:    string;
  updated_at:     string;
}

export interface UploadCvResponse {
  message: string;
  cv:      CV;
}

// ── Service functions ──────────────────────────────────────────────

export async function getMyCv(): Promise<CV | null> {
  const { data } = await api.get("/api/cv/");
  return data;
}

export async function uploadCv(file: File): Promise<UploadCvResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/cv/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteCv(): Promise<{ message: string }> {
  const { data } = await api.delete("/api/cv/delete/");
  return data;
}