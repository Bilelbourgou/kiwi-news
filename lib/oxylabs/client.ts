const OXY_REALTIMES_BASE = "https://realtime.oxylabs.io/v1/queries";
const OXY_DATA_BASE = "https://data.oxylabs.io/v1";

function getOxylabsCredentials(): { username: string; password: string } {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Missing OXY_WSA_USERNAME or OXY_WSA_PASSWORD. Set both in the server environment."
    );
  }

  return { username, password };
}

export function getOxylabsBasicAuthHeader(): string {
  const { username, password } = getOxylabsCredentials();
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

async function requestOxylabsJson<T>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", getOxylabsBasicAuthHeader());
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Oxylabs request failed (${response.status}) for ${url}: ${rawText || "unknown error"}`
    );
  }

  if (!rawText) {
    return {} as T;
  }

  return JSON.parse(rawText) as T;
}

export async function fetchUrlAsHtml(url: string): Promise<string> {
  const payload = {
    source: "universal",
    url,
    render: "html",
    timeout: 180000,
  };

  const result = await requestOxylabsJson<{
    results?: Array<{ content?: string; html?: string; url?: string }>;
    content?: string;
  }>(OXY_REALTIMES_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const content =
    result.results?.[0]?.content ??
    result.results?.[0]?.html ??
    result.content ??
    "";

  if (typeof content !== "string") {
    return "";
  }

  return content;
}

export async function listOxylabsSchedules(): Promise<string[]> {
  const payload = await requestOxylabsJson<{ schedules?: Array<string | number> }>(
    `${OXY_DATA_BASE}/schedules`,
    {
      method: "GET",
    }
  );

  return (payload.schedules ?? []).map((scheduleId) => String(scheduleId));
}

export async function createOxylabsSchedule(input: {
  url: string;
  cron: string;
  endTime: string;
}): Promise<{ schedule_id?: string | number; active?: boolean; items_count?: number }> {
  const payload = {
    cron: input.cron,
    items: [{ source: "universal", url: input.url, render: "html" }],
    end_time: input.endTime,
  };

  const response = await requestOxylabsJson<{
    schedule_id?: string | number;
    active?: boolean;
    items_count?: number;
  }>(`${OXY_DATA_BASE}/schedules`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response;
}

export async function deactivateOxylabsSchedule(scheduleId: string): Promise<void> {
  await requestOxylabsJson<void>(`${OXY_DATA_BASE}/schedules/${scheduleId}/state`, {
    method: "PUT",
    body: JSON.stringify({ active: false }),
  });
}

export async function getScheduleRuns(scheduleId: string): Promise<
  Array<{
    run_id?: string | number;
    jobs?: Array<{ id?: string | number; result_status?: string }>;
  }>
> {
  const payload = await requestOxylabsJson<{
    runs?: Array<{
      run_id?: string | number;
      jobs?: Array<{ id?: string | number; result_status?: string }>;
    }>;
  }>(`${OXY_DATA_BASE}/schedules/${scheduleId}/runs`, {
    method: "GET",
  });

  return payload.runs ?? [];
}

export async function getJobResultHtml(jobId: string): Promise<string | null> {
  const candidateUrls = [
    `${OXY_DATA_BASE}/queries/${jobId}/results?type=raw`,
    `${OXY_DATA_BASE}/queries/${jobId}?type=raw`,
    `${OXY_DATA_BASE}/queries/${jobId}/result?type=raw`,
  ];

  for (const candidateUrl of candidateUrls) {
    try {
      const payload = await requestOxylabsJson<{
        results?: Array<{ content?: string; html?: string }>;
        content?: string;
      }>(candidateUrl, {
        method: "GET",
      });

      const content =
        payload.results?.[0]?.content ??
        payload.results?.[0]?.html ??
        payload.content ??
        "";

      if (typeof content === "string" && content.trim()) {
        return content;
      }
    } catch {
      // Try the next known pattern for a result payload.
    }
  }

  return null;
}
