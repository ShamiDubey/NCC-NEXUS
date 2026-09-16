// Responsibility: Gemini function-calling client for the AI Adjutant (M9) —
//   runs the model↔tool loop: send contents + tool declarations, execute any
//   requested tools via a caller-provided executor, feed results back, and
//   return the final text plus the full tool trace.
// Layer: AI Adjutant (Layer 3) service. A NEW file — the existing cadet chatbot
//   (bot.service.js) is deliberately untouched (ADL-007).
// Depends on: global fetch + GEMINI_API_KEY env (read-only). Tool semantics live
//   in modules/adjutant/adjutant.tools.js, injected as `executeTool`.
// Must never be depended on by: legacy modules or bot.service.js.

require("dotenv").config();

const ADJUTANT_PROVIDER = "gemini";
const ADJUTANT_MODEL =
  process.env.ADJUTANT_GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL_BASE =
  process.env.GEMINI_API_URL_BASE || "https://generativelanguage.googleapis.com/v1beta";
const REQUEST_TIMEOUT_MS = Number(process.env.ADJUTANT_TIMEOUT_MS || 45000);
const MAX_TOOL_ROUNDS = 4;
// Transient Gemini failures (rate limit, overload, timeout) are retried with
// backoff instead of surfacing straight to the officer as a 502.
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = Number(process.env.ADJUTANT_RETRY_DELAY_MS || 1200);

// Free-tier quotas are PER MODEL, so when the primary's bucket is empty we can
// fall back to a sibling model with its own untouched quota instead of failing.
const FALLBACK_MODELS = (
  process.env.ADJUTANT_GEMINI_FALLBACKS || "gemini-3.7-flash,gemini-3.5-flash-lite"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const MODEL_CHAIN = [ADJUTANT_MODEL, ...FALLBACK_MODELS.filter((m) => m !== ADJUTANT_MODEL)];
// Sticky: remember which model last worked and start there, so an exhausted
// primary isn't hammered on every call (and one turn's rounds stay on one model).
let stickyModelIndex = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/** Extract the human message AND Google's advised retry delay (RetryInfo) from
 *  a failed response — a 429 tells us exactly how long the quota window is. */
const parseGeminiFailure = async (response) => {
  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch {
    bodyText = "";
  }
  let message = bodyText || response.statusText || "Unknown error";
  let retryDelayMs = null;
  try {
    const parsed = JSON.parse(bodyText);
    if (typeof parsed?.error?.message === "string") message = parsed.error.message;
    else if (typeof parsed?.message === "string") message = parsed.message;
    const retryInfo = (parsed?.error?.details || []).find(
      (d) => typeof d?.retryDelay === "string"
    );
    const secs = retryInfo ? parseFloat(retryInfo.retryDelay) : NaN;
    if (Number.isFinite(secs) && secs > 0) retryDelayMs = Math.ceil(secs * 1000);
  } catch {
    /* non-JSON payload */
  }
  return { message, retryDelayMs };
};

/**
 * Pure: split a generateContent response payload into text and functionCalls.
 * Exported separately so the parsing is unit-testable without any network.
 * @returns {{text:string, functionCalls:Array<{name:string, args:object}>,
 *            modelParts:Array}} modelParts = the raw parts to echo back as the
 *            model turn when continuing the loop.
 */
function parseModelTurn(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return { text: "", functionCalls: [], modelParts: [] };

  const textChunks = [];
  const functionCalls = [];
  for (const part of parts) {
    if (typeof part?.text === "string") textChunks.push(part.text);
    if (part?.functionCall && typeof part.functionCall.name === "string") {
      functionCalls.push({
        name: part.functionCall.name,
        args: part.functionCall.args && typeof part.functionCall.args === "object"
          ? part.functionCall.args
          : {},
      });
    }
  }
  return { text: textChunks.join(" ").trim(), functionCalls, modelParts: parts };
}

const callGemini = async ({ systemPrompt, contents, toolDeclarations }) => {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    // gemini-3.6+ are thinking models: thought tokens count against
    // maxOutputTokens, so the cap must leave room for both thinking and answer.
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };
  if (toolDeclarations?.length) {
    body.tools = [{ functionDeclarations: toolDeclarations }];
    body.toolConfig = { functionCallingConfig: { mode: "AUTO" } };
  }
  const payload = JSON.stringify(body);

  let lastError;
  let quotaDelayMs = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    // Walk the model chain starting from the last model that worked.
    for (let step = 0; step < MODEL_CHAIN.length; step += 1) {
      const idx = (stickyModelIndex + step) % MODEL_CHAIN.length;
      const model = MODEL_CHAIN[idx];
      const endpoint = `${GEMINI_API_URL_BASE}/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

      let response;
      try {
        response = await fetchWithTimeout(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      } catch (error) {
        lastError =
          error?.name === "AbortError" ? new Error("Adjutant request timed out.") : error;
        console.error(`[adjutant] ${model} attempt ${attempt}: ${lastError.message}`);
        continue; // timeout / network drop — try the next model
      }

      if (response.ok) {
        if (idx !== stickyModelIndex) {
          console.warn(`[adjutant] switched to fallback model ${model}`);
          stickyModelIndex = idx;
        }
        return response.json();
      }

      const { message, retryDelayMs } = await parseGeminiFailure(response);
      lastError = new Error(`Gemini API error (${response.status}): ${message}`);
      console.error(
        `[adjutant] ${model} attempt ${attempt} → HTTP ${response.status}: ${message}`
      );
      // Key problems no model can fix — fail fast.
      if (response.status === 401 || response.status === 403) throw lastError;
      // 429 quotas are per model — note the shortest advised wait, try siblings.
      if (response.status === 429 && retryDelayMs) {
        quotaDelayMs =
          quotaDelayMs == null ? retryDelayMs : Math.min(quotaDelayMs, retryDelayMs);
      }
      // 400/404/429/5xx: fall through to the next model in the chain.
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(Math.min(quotaDelayMs ?? RETRY_BASE_DELAY_MS * attempt, 60000));
    }
  }
  throw lastError;
};

/**
 * Run the full model↔tool loop for one user turn.
 *
 * @param {object} input
 * @param {string} input.systemPrompt
 * @param {Array<{role:('user'|'model'), parts:Array}>} input.contents  prior turns
 *   INCLUDING the new user message as the last entry.
 * @param {Array<object>} input.toolDeclarations  Gemini functionDeclarations.
 * @param {(name:string, args:object) => Promise<object>} input.executeTool  runs a
 *   whitelisted tool and returns a JSON-serialisable result. Errors it throws are
 *   fed back to the model as { error } rather than aborting the turn.
 * @returns {{text:string, toolTrace:Array<{name:string, args:object, ok:boolean,
 *            summary:(string|null)}>}}
 */
async function generateWithTools({ systemPrompt, contents, toolDeclarations, executeTool }) {
  const convo = [...contents];
  const toolTrace = [];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
    const payload = await callGemini({ systemPrompt, contents: convo, toolDeclarations });
    const turn = parseModelTurn(payload);

    if (!turn.functionCalls.length) {
      const text = turn.text || "I could not produce a response. Please rephrase.";
      return { text, toolTrace };
    }

    // Echo the model's turn, execute each requested tool, then answer with
    // functionResponse parts in a single user turn (v1beta contract).
    convo.push({ role: "model", parts: turn.modelParts });

    const responseParts = [];
    for (const call of turn.functionCalls) {
      let result;
      let ok = true;
      try {
        result = await executeTool(call.name, call.args);
      } catch (error) {
        ok = false;
        result = { error: error?.message || "Tool execution failed." };
      }
      toolTrace.push({
        name: call.name,
        args: call.args,
        ok,
        summary: typeof result?.summary === "string" ? result.summary : null,
      });
      responseParts.push({
        functionResponse: { name: call.name, response: { result } },
      });
    }
    convo.push({ role: "user", parts: responseParts });
  }

  return {
    text: "I consulted the data but could not finish reasoning within the tool budget. Please ask a narrower question.",
    toolTrace,
  };
}

module.exports = {
  ADJUTANT_PROVIDER,
  ADJUTANT_MODEL,
  MAX_TOOL_ROUNDS,
  parseModelTurn,
  generateWithTools,
};
