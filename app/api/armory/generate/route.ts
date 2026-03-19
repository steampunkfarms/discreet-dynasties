import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'
import { DD_SYSTEM_IDENTITY } from '@/lib/ai/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY?.trim() })

const GENERATOR_PROMPTS: Record<string, (inputs: Record<string, string>) => string> = {
  'fate-roadmap': (i) => `Generate a concrete 90-day FATE Improvement Roadmap for this household.

Weakest domain: ${i.weakestDomain}
Current level: ${i.currentLevel}
Household size: ${i.householdSize}
Property type: ${i.propertyType}
Constraints: ${i.constraints || 'None specified'}

Format as: Overview (2 sentences), then Month 1 / Month 2 / Month 3 with 3–5 specific weekly actions each. End with a single "This Week" action. Ground every recommendation in the FATE doctrine from Discreet Dynasties. Be direct and specific — no vague advice.`,

  'stability-plan': (i) => `Generate a complete Household Stability Plan for this household.

Household: ${i.householdSize} people, ages ${i.ages}
Property type: ${i.propertyType}
Top vulnerability: ${i.topVulnerability}

Cover all four FATE domains. For each domain: current recommended target, 3–5 specific action items, estimated cost where relevant. Keep language from the book — no prepper jargon, no fear language. End with a "First 30 Days" action list.`,

  'food-storage-calculator': (i) => `Generate a detailed Food Storage Plan and Calculator for this household.

Household: ${i.householdSize} people, ages ${i.ages}
Target: ${i.targetDays}
Dietary notes: ${i.dietaryNotes || 'None'}
Storage space: ${i.storageSpace}

Include: daily caloric requirement per person, total calories needed, specific food categories with quantities and approximate cost, storage tips, rotation schedule, and shopping priority order. Be precise with numbers. Ground in the book's food doctrine (caloric independence, preservation, production).`,

  'dead-preps-audit': (i) => `Conduct a Dead Preps Audit and Resurrection Plan for this household.

Preps listed:
${i.prepList}

Top concern: ${i.topWorry}

For each prep listed: classify as Dead (unusable/gone), Zombie (neglected/untested), or Living (maintained/ready). Then provide a ranked resurrection plan for the Zombie preps. For each Zombie: specific steps to bring it fully back to Living status. Apply the book's Dead → Zombie → Living doctrine throughout.`,

  'long-table-map': (i) => `Generate a Long Table Circle Map and development plan for this household.

Household size: ${i.householdSize}
Current trusted circle: ${i.currentCircle}
Gaps identified: ${i.gaps}
Ambition level: ${i.ambition}

Produce: an assessment of current circle strength, the gaps that matter most, 5–7 specific steps to build toward the stated ambition level, criteria for evaluating potential Trusted List additions, and a 6-month relationship-building plan. Ground in the Long Table doctrine from the book.`,

  'fate-letter': (i) => `Write a Dynasty Letter from a father to his children explaining the household's preparedness posture and the "why" behind it.

Children's ages: ${i.childrenAges}
Why building: ${i.whyBuilding}
Core values: ${i.coreValues}
Current FATE status: ${i.fateStatus}

Write in first-person, father's voice. Not lecture — genuine. Explain the FATE model simply. Connect it to the family's values. Express what you're building and who it's for. Close with a charge to the children. Tone: warm, direct, enduring. Length: 400–600 words. This will be saved.`,

  'trusted-list-profile': (i) => `Generate a Trusted List Profile for a potential household ally.

Relationship: ${i.personRole}
How known: ${i.knowThem}
Strengths: ${i.theirStrengths}
Concerns: ${i.concerns || 'None identified'}

Produce: a formal profile including (1) Relationship Assessment, (2) Skill/Capability inventory, (3) Reliability indicators, (4) Concerns or unknowns to resolve, (5) Recommended trust tier (Full / Provisional / Under Evaluation), (6) Suggested next steps to deepen or clarify the relationship. Ground in the book's Trusted List doctrine.`,

  'vow-draft': (i) => `Draft a personal Vow statement — a covenant with dynastic time.

Why building: ${i.whyBuilding}
What building: ${i.whatYoureBuilding}
For whom: ${i.forWhom}
Commitment: ${i.commitment}

Write in first-person. Not a mission statement — a vow. Formal but personal. Reference the FATE posture and Long Table ethic from the book. Include the commitment to what will change. Close with a line that could stand alone as the man's creed. Length: 200–350 words. This is meant to be kept.`,

  'energy-plan': (i) => `Generate a phased Energy Independence Plan for this household.

Property: ${i.propertyType}
Current power: ${i.currentPower}
Current water: ${i.waterSource}
Annual budget: ${i.budget}
Timeline: ${i.timeline}

Phase 1 (0–6 months), Phase 2 (6–18 months), Phase 3 (18–36 months), Phase 4 (long-term). For each phase: specific actions, estimated cost, what capability is gained. Cover both power and water. Apply the FATE Energy domain doctrine. Be realistic about timelines and costs. End with the single highest-leverage action to take this month.`,

  'dynasty-wealth-plan': (i) => `Generate a Dynasty Wealth Plan — a household financial sovereignty roadmap.

Income range: ${i.income}
Debt: ${i.debtLevel}
Emergency fund: ${i.emergencyFund}
Investments: ${i.investmentStatus}
Top goal: ${i.topGoal}

Structure as: (1) Honest Assessment, (2) Debt Payoff Strategy with sequence and timeline, (3) Emergency Fund target and timeline, (4) Income Sovereignty assessment and recommendations, (5) Dynasty Investment strategy (low-fee, long-horizon, generational), (6) One-Page Financial Sovereignty Plan. Apply the book's Dynasty Wealth doctrine — financial independence as household sovereignty, not consumerism.`,
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userRole = (session.user as { role?: string })?.role || 'free'
  const isPaid = ['dd_basic', 'dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)
  const isSteward = ['dd_premium', 'dd_dynast', 'forge_bundle', 'admin'].includes(userRole)

  if (!isPaid) {
    return new Response(JSON.stringify({ error: 'Builder access required' }), { status: 403 })
  }

  const { generatorType, inputs } = await req.json()

  // Steward-only generators
  const stewardOnly = ['fate-letter', 'trusted-list-profile', 'vow-draft', 'energy-plan', 'dynasty-wealth-plan']
  if (stewardOnly.includes(generatorType) && !isSteward) {
    return new Response(JSON.stringify({ error: 'Steward access required' }), { status: 403 })
  }

  const buildPrompt = GENERATOR_PROMPTS[generatorType]
  if (!buildPrompt) {
    return new Response(JSON.stringify({ error: 'Unknown generator' }), { status: 400 })
  }

  const userPrompt = buildPrompt(inputs || {})

  // Stream response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullContent = ''

        const streamResponse = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          system: DD_SYSTEM_IDENTITY,
          messages: [{ role: 'user', content: userPrompt }],
        })

        for await (const event of streamResponse) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullContent += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        // Save to DB
        await prisma.dDArmoryGeneration.create({
          data: {
            userId: session.user.id,
            generatorType,
            title: generatorType,
            userInputs: inputs,
            generatedContent: fullContent,
          },
        })

        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
