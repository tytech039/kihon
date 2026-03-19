import { queryOne, query } from './db.js'

// Generate a lesson using the Anthropic API
export async function generateLesson(skill) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'sk-ant-...') {
    console.warn('No Anthropic API key configured, using placeholder lesson')
    return createPlaceholderLesson(skill)
  }

  const prompt = `You are an expert math teacher creating a lesson for a student at approximately grade ${skill.grade_level} level.

Topic: ${skill.label}

Create a clear, engaging lesson that teaches this concept. Follow these rules:

1. Start with a brief, friendly introduction (1-2 sentences)
2. Explain the core concept in simple terms
3. Provide 2-3 worked examples with step-by-step solutions
4. Use KaTeX math notation:
   - Inline math: $expression$
   - Block math: $$expression$$
   - Fractions: $\\frac{a}{b}$
   - Multiplication: $\\times$, Division: $\\div$
5. If helpful, include a simple SVG diagram (number line, fraction bar, etc.) as inline SVG
6. End with a brief summary of the key takeaway
7. Use markdown formatting (headers, bold, etc.)
8. Keep the tone encouraging — never condescending

Format the entire response as markdown with KaTeX math notation.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      throw new Error(`Anthropic API error: ${response.status} ${errBody}`)
    }

    const data = await response.json()
    const content = data.content[0]?.text || ''

    // Cache in database
    const lesson = await queryOne(
      `INSERT INTO lessons (skill_id, type, title, content, difficulty_level, model_used)
       VALUES ($1, 'ai_generated', $2, $3, $4, $5)
       RETURNING *`,
      [skill.id, `Learn: ${skill.label}`, content, skill.grade_level, 'claude-sonnet-4-6']
    )

    return lesson
  } catch (err) {
    console.error('AI lesson generation failed:', err.message)
    return createPlaceholderLesson(skill)
  }
}

function createPlaceholderLesson(skill) {
  const content = getBuiltInContent(skill.id, skill.label, skill.grade_level)

  // Don't cache placeholder — let it try AI again next time
  return {
    skill_id: skill.id,
    type: 'placeholder',
    title: `Learn: ${skill.label}`,
    content,
    difficulty_level: skill.grade_level,
  }
}

// Built-in content for common skills (used when API is unavailable)
function getBuiltInContent(skillId, label, grade) {
  const lessons = {
    'addition': `# Addition

Addition means combining two or more numbers to find their total.

## How It Works

When we add numbers, we combine them together. The symbol $+$ means "plus" or "add."

$$7 + 5 = 12$$

### Example 1: Simple Addition
$$24 + 18 = ?$$

**Step by step:**
1. Add the ones: $4 + 8 = 12$ (write 2, carry the 1)
2. Add the tens: $2 + 1 + 1 = 4$
3. **Answer:** $24 + 18 = 42$

### Example 2: Three Numbers
$$15 + 23 + 7 = ?$$

1. Add first two: $15 + 23 = 38$
2. Add the third: $38 + 7 = 45$
3. **Answer:** $45$

## Key Takeaway
Addition combines numbers together. Start from the ones place and work left, carrying when a column adds up to 10 or more.`,

    'multiplication': `# Multiplication

Multiplication is a faster way to add the same number many times.

## How It Works

$6 \\times 7$ means "6 groups of 7":

$$6 \\times 7 = 7 + 7 + 7 + 7 + 7 + 7 = 42$$

### Example 1
$$9 \\times 8 = ?$$

**Trick:** $9 \\times 8$ is one less group of 9 than $9 \\times 9 = 81$:
$$81 - 9 = 72$$

### Example 2: Multi-digit
$$12 \\times 15 = ?$$

Break it up:
$$12 \\times 10 = 120$$
$$12 \\times 5 = 60$$
$$120 + 60 = 180$$

## Key Takeaway
Multiplication is repeated addition. You can break big multiplications into smaller, easier pieces.`,

    'fractions-basic': `# Basic Fractions

A fraction represents a part of a whole. The top number (numerator) tells how many parts you have. The bottom number (denominator) tells how many equal parts make up the whole.

## How It Works

$$\\frac{3}{4}$$

This means 3 out of 4 equal parts.

### Example 1: Adding Fractions
$$\\frac{1}{2} + \\frac{1}{4} = ?$$

To add fractions, they need the **same denominator**:
$$\\frac{1}{2} = \\frac{2}{4}$$

Now add:
$$\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$$

### Example 2: Different Denominators
$$\\frac{3}{5} + \\frac{2}{3} = ?$$

Find the LCD (15):
$$\\frac{3}{5} = \\frac{9}{15}, \\quad \\frac{2}{3} = \\frac{10}{15}$$

$$\\frac{9}{15} + \\frac{10}{15} = \\frac{19}{15} = 1\\frac{4}{15}$$

## Key Takeaway
To add or subtract fractions, first make the denominators the same, then add or subtract the numerators.`,
  }

  return lessons[skillId] || `# ${label}\n\nThis lesson covers **${label}** at approximately grade ${grade} level.\n\n*Full lesson content will be generated when the AI tutor is configured. Set your ANTHROPIC_API_KEY in .env to enable AI lesson generation.*\n\nIn the meantime, try practicing this skill in a **7 Minute Drill**!`
}
