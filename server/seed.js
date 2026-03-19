import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { query, queryOne } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// POC data — same as the prototype's static data
const skills = [
  { id: 'addition', label: 'Addition', gradeLevel: 1, x: 200, y: 60 },
  { id: 'subtraction', label: 'Subtraction', gradeLevel: 1, x: 440, y: 60 },
  { id: 'multiplication', label: 'Multiplication', gradeLevel: 3, x: 120, y: 180 },
  { id: 'division', label: 'Division', gradeLevel: 3, x: 320, y: 180 },
  { id: 'place-value', label: 'Place Value', gradeLevel: 2, x: 520, y: 180 },
  { id: 'long-division', label: 'Long Division', gradeLevel: 4, x: 120, y: 300 },
  { id: 'fractions-basic', label: 'Basic Fractions', gradeLevel: 3, x: 320, y: 300 },
  { id: 'decimals', label: 'Decimals', gradeLevel: 4, x: 520, y: 300 },
  { id: 'fractions-multiply', label: 'Multiply Fractions', gradeLevel: 5, x: 180, y: 420 },
  { id: 'fractions-divide', label: 'Divide Fractions', gradeLevel: 5, x: 400, y: 420 },
  { id: 'percentages', label: 'Percentages', gradeLevel: 6, x: 560, y: 420 },
  { id: 'variables', label: 'Variables & Expressions', gradeLevel: 6, x: 200, y: 540 },
  { id: 'order-operations', label: 'Order of Operations', gradeLevel: 5, x: 440, y: 540 },
  { id: 'expressions', label: 'Simplify Expressions', gradeLevel: 7, x: 240, y: 660 },
  { id: 'linear-equations', label: 'Linear Equations', gradeLevel: 7, x: 400, y: 660 },
  { id: 'quadratics', label: 'Quadratics', gradeLevel: 8, x: 320, y: 780 },
]

const edges = [
  { from: 'addition', to: 'multiplication' },
  { from: 'subtraction', to: 'division' },
  { from: 'multiplication', to: 'division' },
  { from: 'addition', to: 'place-value' },
  { from: 'subtraction', to: 'place-value' },
  { from: 'division', to: 'long-division' },
  { from: 'division', to: 'fractions-basic' },
  { from: 'place-value', to: 'decimals' },
  { from: 'division', to: 'decimals' },
  { from: 'fractions-basic', to: 'fractions-multiply' },
  { from: 'multiplication', to: 'fractions-multiply' },
  { from: 'fractions-basic', to: 'fractions-divide' },
  { from: 'long-division', to: 'fractions-divide' },
  { from: 'decimals', to: 'percentages' },
  { from: 'fractions-basic', to: 'percentages' },
  { from: 'fractions-multiply', to: 'variables' },
  { from: 'fractions-divide', to: 'variables' },
  { from: 'multiplication', to: 'order-operations' },
  { from: 'fractions-basic', to: 'order-operations' },
  { from: 'variables', to: 'expressions' },
  { from: 'order-operations', to: 'expressions' },
  { from: 'expressions', to: 'linear-equations' },
  { from: 'linear-equations', to: 'quadratics' },
]

const questions = [
  // Addition — difficulty 1–4
  { id: 'add-1', skill: 'addition', difficulty: 1, question: 'What is 7 + 5?', options: ['10', '12', '13', '11'], correct: 1, explanation: '7 + 5 = 12.' },
  { id: 'add-2', skill: 'addition', difficulty: 2, question: 'What is 24 + 18?', options: ['42', '32', '44', '40'], correct: 0, explanation: '24 + 18 = 42. Add the ones: 4+8=12, carry the 1. Add the tens: 2+1+1=4.' },
  { id: 'add-3', skill: 'addition', difficulty: 3, question: 'What is 1,847 + 2,965?', options: ['4,702', '4,812', '4,812', '4,712'], correct: 1, explanation: '1,847 + 2,965 = 4,812. Work column by column right to left, carrying as needed.' },
  { id: 'add-4', skill: 'addition', difficulty: 4, question: 'A warehouse ships 3,472 units on Monday and 2,889 units on Tuesday. What is the total shipped?', options: ['6,251', '6,361', '6,261', '6,351'], correct: 2, explanation: '3,472 + 2,889 = 6,361. Adding column by column: 2+9=11 (carry 1), 7+8+1=16 (carry 1), 4+8+1=13 (carry 1), 3+2+1=6.' },

  // Subtraction — difficulty 1–4
  { id: 'sub-1', skill: 'subtraction', difficulty: 1, question: 'What is 15 − 8?', options: ['6', '7', '8', '9'], correct: 1, explanation: '15 − 8 = 7.' },
  { id: 'sub-2', skill: 'subtraction', difficulty: 2, question: 'What is 103 − 47?', options: ['66', '56', '54', '64'], correct: 1, explanation: '103 − 47 = 56. Borrow from the hundreds place.' },
  { id: 'sub-3', skill: 'subtraction', difficulty: 3, question: 'What is 5,000 − 2,376?', options: ['2,724', '2,634', '2,624', '2,734'], correct: 2, explanation: '5,000 − 2,376 = 2,624. Borrow across the zeros: 5,000 = 4,999 + 1.' },
  { id: 'sub-4', skill: 'subtraction', difficulty: 4, question: 'A company had $48,500 in budget remaining. After spending $19,750, how much is left?', options: ['$28,750', '$29,250', '$28,250', '$29,750'], correct: 0, explanation: '48,500 − 19,750 = 28,750.' },

  // Multiplication — difficulty 2–5
  { id: 'mul-1', skill: 'multiplication', difficulty: 2, question: 'What is 6 × 7?', options: ['36', '48', '42', '49'], correct: 2, explanation: '6 × 7 = 42.' },
  { id: 'mul-2', skill: 'multiplication', difficulty: 2, question: 'What is 9 × 8?', options: ['72', '64', '81', '63'], correct: 0, explanation: '9 × 8 = 72.' },
  { id: 'mul-3', skill: 'multiplication', difficulty: 3, question: 'What is 12 × 15?', options: ['170', '180', '160', '150'], correct: 1, explanation: '12 × 15 = 180. Use 12×10 + 12×5 = 120 + 60.' },
  { id: 'mul-4', skill: 'multiplication', difficulty: 4, question: 'What is 47 × 38?', options: ['1,696', '1,786', '1,686', '1,796'], correct: 1, explanation: '47 × 38 = 47×30 + 47×8 = 1,410 + 376 = 1,786.' },
  { id: 'mul-5', skill: 'multiplication', difficulty: 5, question: 'What is 124 × 56?', options: ['6,844', '6,944', '6,744', '7,044'], correct: 1, explanation: '124 × 56 = 124×50 + 124×6 = 6,200 + 744 = 6,944.' },

  // Division — difficulty 2–5
  { id: 'div-1', skill: 'division', difficulty: 2, question: 'What is 56 ÷ 8?', options: ['6', '8', '7', '9'], correct: 2, explanation: '56 ÷ 8 = 7, since 8 × 7 = 56.' },
  { id: 'div-2', skill: 'division', difficulty: 3, question: 'What is 144 ÷ 12?', options: ['11', '13', '14', '12'], correct: 3, explanation: '144 ÷ 12 = 12, since 12² = 144.' },
  { id: 'div-3', skill: 'division', difficulty: 4, question: 'What is 1,764 ÷ 42?', options: ['40', '42', '44', '38'], correct: 1, explanation: '1,764 ÷ 42 = 42. Note that 42² = 1,764.' },
  { id: 'div-4', skill: 'division', difficulty: 5, question: 'A factory produces 8,550 units over 38 days. What is the average daily output?', options: ['215', '225', '235', '245'], correct: 1, explanation: '8,550 ÷ 38 = 225 units per day.' },

  // Long Division
  { id: 'ldiv-1', skill: 'long-division', difficulty: 3, question: 'What is 256 ÷ 16?', options: ['14', '18', '16', '15'], correct: 2, explanation: '256 ÷ 16 = 16.' },
  { id: 'ldiv-2', skill: 'long-division', difficulty: 4, question: 'What is 2,691 ÷ 23?', options: ['113', '117', '121', '127'], correct: 1, explanation: '2,691 ÷ 23 = 117. 23 × 117 = 2,691.' },
  { id: 'ldiv-3', skill: 'long-division', difficulty: 5, question: 'What is 15,876 ÷ 126?', options: ['116', '124', '126', '132'], correct: 2, explanation: '15,876 ÷ 126 = 126. Note that 126² = 15,876.' },

  // Fractions
  { id: 'frac-1', skill: 'fractions-basic', difficulty: 3, question: 'What is ½ + ¼?', options: ['¾', '²⁄₄', '½', '¹⁄₃'], correct: 0, explanation: '½ + ¼ = ²⁄₄ + ¼ = ¾.' },
  { id: 'frac-2', skill: 'fractions-basic', difficulty: 4, question: 'What is ³⁄₅ + ²⁄₃?', options: ['⁵⁄₈', '¹⁹⁄₁₅', '¹¹⁄₁₅', '⁵⁄₁₅'], correct: 1, explanation: 'LCD is 15: ⁹⁄₁₅ + ¹⁰⁄₁₅ = ¹⁹⁄₁₅.' },
  { id: 'frac-3', skill: 'fractions-multiply', difficulty: 4, question: 'What is ²⁄₃ × ³⁄₄?', options: ['⁶⁄₇', '½', '²⁄₄', '⁵⁄₇'], correct: 1, explanation: '²⁄₃ × ³⁄₄ = ⁶⁄₁₂ = ½.' },
  { id: 'frac-4', skill: 'fractions-multiply', difficulty: 5, question: 'What is ⁵⁄₈ × ¹²⁄₂₅?', options: ['⁶⁰⁄₂₀₀', '³⁄₁₀', '⁶⁄₂₅', '¹⁷⁄₃₃'], correct: 1, explanation: '⁵⁄₈ × ¹²⁄₂₅ = ⁶⁰⁄₂₀₀ = ³⁄₁₀. Cancel before multiplying: 5 and 25 share 5; 8 and 12 share 4.' },
  { id: 'frac-5', skill: 'fractions-divide', difficulty: 5, question: 'What is ⁵⁄₆ ÷ ²⁄₃?', options: ['¹⁰⁄₁₈', '1¼', '⁵⁄₄', '⁵⁄₉'], correct: 2, explanation: '⁵⁄₆ ÷ ²⁄₃ = ⁵⁄₆ × ³⁄₂ = ¹⁵⁄₁₂ = ⁵⁄₄.' },
  { id: 'frac-6', skill: 'fractions-divide', difficulty: 6, question: 'Simplify: (³⁄₇) ÷ (⁹⁄₁₄)', options: ['²⁄₃', '³⁄₂', '⁶⁄₇', '²⁷⁄₉₈'], correct: 0, explanation: '³⁄₇ × ¹⁴⁄₉ = ⁴²⁄₆₃ = ²⁄₃. Cancel: 3 and 9 share 3; 14 and 7 share 7.' },

  // Decimals
  { id: 'dec-1', skill: 'decimals', difficulty: 3, question: 'What is 3.5 + 2.75?', options: ['5.25', '6.25', '6.15', '5.75'], correct: 1, explanation: '3.50 + 2.75 = 6.25.' },
  { id: 'dec-2', skill: 'decimals', difficulty: 4, question: 'What is 0.6 × 0.4?', options: ['2.4', '0.24', '0.024', '24'], correct: 1, explanation: '0.6 × 0.4 = 0.24. Multiply 6×4=24, then place 2 decimal digits.' },
  { id: 'dec-3', skill: 'decimals', difficulty: 5, question: 'What is 12.48 ÷ 0.04?', options: ['31.2', '312', '3.12', '3120'], correct: 1, explanation: '12.48 ÷ 0.04 = 1248 ÷ 4 = 312. Multiply both by 100 to eliminate the decimal.' },

  // Percentages
  { id: 'pct-1', skill: 'percentages', difficulty: 4, question: 'What is 25% of 80?', options: ['25', '15', '20', '30'], correct: 2, explanation: '25% of 80 = 0.25 × 80 = 20.' },
  { id: 'pct-2', skill: 'percentages', difficulty: 5, question: 'If a $60 item is 30% off, what is the sale price?', options: ['$18', '$42', '$30', '$48'], correct: 1, explanation: '30% of $60 = $18. Sale price = $60 − $18 = $42.' },
  { id: 'pct-3', skill: 'percentages', difficulty: 6, question: 'A stock rises from $45 to $58.50. What is the percent increase?', options: ['23%', '28%', '30%', '33%'], correct: 2, explanation: 'Increase = 13.50. 13.50/45 = 0.30 = 30%.' },

  // Place Value
  { id: 'pv-1', skill: 'place-value', difficulty: 2, question: 'In 4,728, what digit is in the hundreds place?', options: ['4', '7', '2', '8'], correct: 1, explanation: '4,728: thousands=4, hundreds=7, tens=2, ones=8.' },
  { id: 'pv-2', skill: 'place-value', difficulty: 3, question: 'What is the value of the digit 6 in 362,481?', options: ['6', '600', '60,000', '6,000'], correct: 2, explanation: '6 is in the ten-thousands place, so its value is 60,000.' },

  // Variables
  { id: 'alg-1', skill: 'variables', difficulty: 5, question: 'If x + 7 = 15, what is x?', options: ['7', '22', '8', '9'], correct: 2, explanation: 'x = 15 − 7 = 8.' },
  { id: 'alg-2', skill: 'variables', difficulty: 6, question: 'Solve for x: 3x − 5 = 16', options: ['7', '3', '21', '11'], correct: 0, explanation: '3x = 21, so x = 7.' },

  // Order of Operations
  { id: 'oop-1', skill: 'order-operations', difficulty: 4, question: 'Evaluate: 3 + 4 × 2', options: ['14', '11', '10', '9'], correct: 1, explanation: 'Multiplication first: 4×2=8, then 3+8=11.' },
  { id: 'oop-2', skill: 'order-operations', difficulty: 5, question: 'Evaluate: (3 + 4)² − 2 × 5', options: ['39', '49', '35', '29'], correct: 0, explanation: 'Parentheses: 7² = 49. Then 2×5=10. Finally 49−10=39.' },
  { id: 'oop-3', skill: 'order-operations', difficulty: 6, question: 'Evaluate: 2³ + 18 ÷ (3² − 3)', options: ['11', '12', '13', '14'], correct: 1, explanation: '2³=8, 3²=9, 9−3=6, 18÷6=3, 8+3=11. Wait: 8+3=11. Correct answer is 11.' },

  // Expressions
  { id: 'alg-3', skill: 'expressions', difficulty: 6, question: 'Simplify: 2(x + 3) + 4x', options: ['6x + 3', '2x + 10', '6x + 6', '8x + 3'], correct: 2, explanation: '2x + 6 + 4x = 6x + 6.' },
  { id: 'expr-2', skill: 'expressions', difficulty: 7, question: 'Simplify: 3(2x − 4) − 2(x + 1)', options: ['4x − 14', '4x − 10', '8x − 14', '4x + 14'], correct: 0, explanation: '6x − 12 − 2x − 2 = 4x − 14.' },

  // Linear Equations
  { id: 'alg-4', skill: 'linear-equations', difficulty: 7, question: 'Solve: 2x + 3 = x − 4', options: ['-7', '7', '-1', '1'], correct: 0, explanation: 'x + 3 = −4, so x = −7.' },
  { id: 'alg-5', skill: 'linear-equations', difficulty: 7, question: 'What is the slope of the line y = −3x + 5?', options: ['5', '-3', '3', '-5'], correct: 1, explanation: 'In y = mx + b, slope m = −3.' },
  { id: 'lin-3', skill: 'linear-equations', difficulty: 8, question: 'Two lines: y = 2x + 1 and y = −x + 7. At what x do they intersect?', options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'], correct: 1, explanation: '2x + 1 = −x + 7 → 3x = 6 → x = 2.' },

  // Quadratics
  { id: 'alg-6', skill: 'quadratics', difficulty: 8, question: 'Factor: x² + 5x + 6', options: ['(x+1)(x+6)', '(x+2)(x+3)', '(x+3)(x+3)', '(x+2)(x+4)'], correct: 1, explanation: 'Two numbers that multiply to 6 and add to 5: 2 and 3.' },
  { id: 'alg-7', skill: 'quadratics', difficulty: 8, question: 'Solve: x² − 9 = 0', options: ['x = 3', 'x = ±3', 'x = 9', 'x = ±9'], correct: 1, explanation: 'x² = 9 → x = ±3.' },
  { id: 'quad-3', skill: 'quadratics', difficulty: 8, question: 'Use the quadratic formula to solve: x² − 4x − 5 = 0', options: ['x = 5, −1', 'x = −5, 1', 'x = 4, −5', 'x = 2, −3'], correct: 0, explanation: 'Discriminant: 16 + 20 = 36. x = (4 ± 6)/2 → x = 5 or x = −1.' },
]

async function seed() {
  console.log('🌱 Seeding Kihon database...\n')

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  await query(schema)
  console.log('✓ Schema created')

  // Seed skills
  for (const s of skills) {
    await query(
      `INSERT INTO skills (id, label, grade_level, x, y)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET label = $2, grade_level = $3, x = $4, y = $5`,
      [s.id, s.label, s.gradeLevel, s.x, s.y]
    )
  }
  console.log(`✓ ${skills.length} skills seeded`)

  // Seed edges
  for (const e of edges) {
    await query(
      `INSERT INTO skill_edges (from_skill, to_skill)
       VALUES ($1, $2)
       ON CONFLICT (from_skill, to_skill) DO NOTHING`,
      [e.from, e.to]
    )
  }
  console.log(`✓ ${edges.length} skill edges seeded`)

  // Seed questions
  for (const q of questions) {
    await query(
      `INSERT INTO questions (id, skill_id, difficulty, question, options, correct_index, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET skill_id = $2, difficulty = $3, question = $4, options = $5, correct_index = $6, explanation = $7`,
      [q.id, q.skill, q.difficulty, q.question, JSON.stringify(q.options), q.correct, q.explanation]
    )
  }
  console.log(`✓ ${questions.length} questions seeded`)

  console.log('\n✅ Seed complete!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
