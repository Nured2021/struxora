import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';

function stripCodeFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

function extractFirstJsonObject(s: string): string {
  const t = stripCodeFences(s);
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) return t.slice(start, end + 1);
  return t;
}

@Injectable()
export class OpenAiService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env['OPENAI_API_KEY'];
      if (!apiKey) throw new Error('OPENAI_API_KEY is missing');
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async generateJsaJson(params: {
    task: string;
    location?: string | null;
    tools?: string[];
    hazards?: string[];
  }): Promise<string> {
    const client = this.getClient();
    const model = process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini';

    const prompt = `You are an Alberta OHS safety advisor.
Generate a concise JSA output in JSON only.

Input:
- task: ${params.task}
- location: ${params.location ?? ''}
- tools: ${(params.tools ?? []).join(', ')}
- hazards: ${(params.hazards ?? []).join(', ')}

Return STRICT JSON with this shape:
{
  "summary": "string",
  "hazards": [
    { "hazard": "string", "controls": ["string"], "ppe": ["string"] }
  ],
  "toolboxTalk": { "topic": "string", "keyPoints": ["string"] }
}

Rules:
- Controls should be practical: engineering, admin, then PPE.
- Keep it realistic for construction / industrial work in Alberta.
- No markdown. JSON only.`;

    const res = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const text = res.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('OpenAI returned empty content');

    return extractFirstJsonObject(text);
  }
}

