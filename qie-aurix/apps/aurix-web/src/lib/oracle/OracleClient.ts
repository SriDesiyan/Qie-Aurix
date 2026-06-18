// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — Oracle Client
// Thin HTTP client for the Aurix FastAPI oracle service.
// ─────────────────────────────────────────────────────────────────────────────

import type { RiskReport, ProtectionPlan, AuditSummary, RecoveryClaim } from "@aurix/core";
import { ORACLE_BASE_URL } from "@aurix/core";

// Import oracle response shape matching the Python schemas
export interface OracleScoreResponse {
  profile:  unknown;
  score:    unknown;
  risk:     RiskReport;
  guardian: unknown;
}

// ── Client ────────────────────────────────────────────────────────────────────

class OracleClient {
  private baseUrl: string;

  constructor(baseUrl: string = ORACLE_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Oracle error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`Oracle error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  async buildProfile(address: string, chainIds: number[] = [1234]): Promise<OracleScoreResponse> {
    return this.post<OracleScoreResponse>("/profile/build", { address, chain_ids: chainIds });
  }

  async getScore(address: string): Promise<OracleScoreResponse> {
    return this.get<OracleScoreResponse>(`/score/${address}`);
  }

  async getProtectionPlan(address: string, risk: RiskReport): Promise<ProtectionPlan> {
    return this.post<ProtectionPlan>("/protection/plan", { address, risk });
  }

  async getAudit(address: string): Promise<AuditSummary> {
    return this.get<AuditSummary>(`/audit/${address}`);
  }

  async verifyClaim(claim: RecoveryClaim): Promise<{ status: string; message: string }> {
    return this.post("/recovery/verify", claim);
  }

  async chat(address: string, message: string): Promise<{ reply: string; actions: unknown[] }> {
    return this.post("/chat", { address, message });
  }

  async health(): Promise<{ status: string }> {
    return this.get("/health");
  }
}

export const oracleClient = new OracleClient();
