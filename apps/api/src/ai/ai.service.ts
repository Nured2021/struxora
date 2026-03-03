import { Injectable } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { CreateJsaDto } from './dto/create-jsa.dto';

type HazardItem = {
  hazard: string;
  controls: string[];
  ppe: string[];
  before: { severity: number; probability: number; risk: number };
  after: { severity: number; probability: number; risk: number };
};

function clamp15(n: unknown, fallback = 3): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(1, Math.min(5, Math.round(x)));
}

function risk(sev: number, prob: number): number {
  return sev * prob; // simple 1-25
}

@Injectable()
export class AiService {
  constructor(private readonly openai: OpenAiService) {}

  private readonly library: Array<{
    match: RegExp;
    hazard: string;
    controls: string[];
    ppe: string[];
    reduceProbBy?: number;
  }> = [
    {
      match: /lift|hoist|rigg|crane|forklift/i,
      hazard: 'Struck-by / pinch points during lifting operations',
      controls: [
        'Use a lift plan and competent rigger/signal person',
        'Establish exclusion zone and keep non-essential workers out',
        'Inspect slings, shackles, and lifting points before use',
        'Use tag lines; never stand under suspended load',
      ],
      ppe: ['Hard hat', 'Safety boots', 'Hi-vis', 'Gloves'],
      reduceProbBy: 2,
    },
    {
      match: /grind|cut|saw|torch/i,
      hazard: 'Flying particles / cuts / burns',
      controls: [
        'Use guards and correct disc/blade; inspect before use',
        'Maintain stable stance; secure material',
        'Keep sparks away from combustibles; have fire watch if required',
      ],
      ppe: ['Safety glasses + face shield', 'Cut-resistant gloves', 'Hearing protection'],
      reduceProbBy: 2,
    },
    {
      match: /ladder|scaffold|height|elevat|roof/i,
      hazard: 'Fall from height',
      controls: [
        'Use approved access (scaffold/MEWP) when possible',
        '100% tie-off where required; inspect harness/lanyard',
        'Maintain 3 points of contact on ladders; set up properly',
      ],
      ppe: ['Harness & lanyard (if required)', 'Hard hat', 'Safety boots'],
      reduceProbBy: 2,
    },
    {
      match: /confined|tank|vessel/i,
      hazard: 'Confined space hazards (atmosphere/engulfment)',
      controls: [
        'Complete confined space permit and hazard assessment',
        'Atmospheric testing and continuous monitoring as required',
        'Ventilation; rescue plan and attendant in place',
      ],
      ppe: ['As per permit (respirator if required)', 'Gas monitor (as required)'],
      reduceProbBy: 2,
    },
    {
      match: /chemical|solvent|acid|caustic|paint/i,
      hazard: 'Chemical exposure',
      controls: [
        'Review SDS and follow handling/storage requirements',
        'Use ventilation; avoid skin contact and inhalation',
        'Spill kit available; proper labeling and containers',
      ],
      ppe: ['Chemical-resistant gloves', 'Safety glasses/goggles', 'Respirator (if required)'],
      reduceProbBy: 2,
    },
  ];

  createJsa(input: CreateJsaDto) {
    const severity = clamp15(input.severity, 3);
    const probability = clamp15(input.probability, 3);

    const text = [
      input.task ?? '',
      input.location ?? '',
      ...(input.tools ?? []),
      ...(input.hazards ?? []),
    ].join(' ');

    const matched = this.library.filter((x) => x.match.test(text));

    const defaultEntry = {
      match: /.*/i,
      hazard: 'General worksite hazards (slips/trips, hand injuries, struck-by)',
      controls: [
        'Pre-job walkdown; remove trip hazards and maintain housekeeping',
        'Use the right tool for the job; inspect tools before use',
        'Keep clear communication and maintain situational awareness',
      ],
      ppe: ['Hard hat', 'Safety glasses', 'Safety boots', 'Gloves'],
      reduceProbBy: 1,
    };

    const hazards: HazardItem[] = (matched.length ? matched : [defaultEntry]).map((m) => {
      const beforeRisk = risk(severity, probability);
      const afterProb = Math.max(1, probability - (m.reduceProbBy ?? 1));
      const afterRisk = risk(severity, afterProb);

      return {
        hazard: m.hazard,
        controls: m.controls,
        ppe: m.ppe,
        before: { severity, probability, risk: beforeRisk },
        after: { severity, probability: afterProb, risk: afterRisk },
      };
    });

    const overallBefore = Math.max(...hazards.map((h) => h.before.risk));
    const overallAfter = Math.max(...hazards.map((h) => h.after.risk));

    return {
      task: input.task,
      location: input.location ?? null,
      tools: input.tools ?? [],
      inputHazards: input.hazards ?? [],
      overall: {
        beforeRisk: overallBefore,
        afterRisk: overallAfter,
        note:
          overallAfter >= 15
            ? 'High residual risk: add engineering/administrative controls and supervisor review.'
            : 'Residual risk appears manageable with listed controls.',
      },
      hazards,
    };
  }

  async createJsaSmart(input: CreateJsaDto) {
    const ruleBased = this.createJsa(input);

    if (!process.env['OPENAI_API_KEY']) {
      return { ...ruleBased, ai: { enabled: false } };
    }

    try {
      const jsonText = await this.openai.generateJsaJson({
        task: input.task,
        location: input.location ?? null,
        tools: input.tools ?? [],
        hazards: input.hazards ?? [],
      });
      const enhanced = JSON.parse(jsonText) as unknown;
      return {
        ...ruleBased,
        ai: { enabled: true, model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini' },
        enhanced,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        ...ruleBased,
        ai: { enabled: false, error: message },
      };
    }
  }
}
