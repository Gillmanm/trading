import type { AnalysisResult } from '../types';

const API_URL = import.meta.env.VITE_AI_API_URL || 'https://trading-analysis-mcp.onrender.com';

export async function analyzeWithGemini(payload: Record<string, unknown>): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`AI API ${response.status}: ${await response.text()}`);
  return response.json();
}

export function aiApiUrl() { return API_URL; }
