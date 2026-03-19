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
  { id: 'add-1', skill: 'addition', difficulty: 1, question: 'What is 7 + 5?', options: ['10', '12', '13', '11'], correct: 1, explanation: '7 + 5 = 12. You can count up 5 from 7: 8, 9, 10, 11, 12.' },
  { id: 'add-2', skill: 'addition', difficulty: 1, question: 'What is 24 + 18?', options: ['42', '32', '44', '40'], correct: 0, explanation: '24 + 18 = 42. Add the ones: 4+8=12 (carry the 1). Add the tens: 2+1+1=4.' },
  { id: 'sub-1', skill: 'subtraction', difficulty: 1, question: 'What is 15 − 8?', options: ['6', '7', '8', '9'], correct: 1, explanation: '15 − 8 = 7. You can count down 8 from 15, or think: 8 + ? = 15.' },
  { id: 'sub-2', skill: 'subtraction', difficulty: 2, question: 'What is 103 − 47?', options: ['66', '56', '54', '64'], correct: 1, explanation: '103 − 47 = 56. Borrow from the hundreds: 10 tens − 4 tens = 6 tens, 13 ones − 7 ones = 6.' },
  { id: 'mul-1', skill: 'multiplication', difficulty: 2, question: 'What is 6 × 7?', options: ['36', '48', '42', '49'], correct: 2, explanation: '6 × 7 = 42. Think of it as 6 groups of 7.' },
  { id: 'mul-2', skill: 'multiplication', difficulty: 2, question: 'What is 9 × 8?', options: ['72', '64', '81', '63'], correct: 0, explanation: '9 × 8 = 72. A trick: 9×8 is one less group of 9 than 9×9=81, so 81−9=72.' },
  { id: 'mul-3', skill: 'multiplication', difficulty: 3, question: 'What is 12 × 15?', options: ['170', '180', '160', '150'], correct: 1, explanation: '12 × 15 = 180. Break it up: 12×10=120, 12×5=60, 120+60=180.' },
  { id: 'div-1', skill: 'division', difficulty: 2, question: 'What is 56 ÷ 8?', options: ['6', '8', '7', '9'], correct: 2, explanation: '56 ÷ 8 = 7, because 8 × 7 = 56.' },
  { id: 'div-2', skill: 'division', difficulty: 3, question: 'What is 144 ÷ 12?', options: ['11', '13', '14', '12'], correct: 3, explanation: '144 ÷ 12 = 12, because 12 × 12 = 144.' },
  { id: 'div-3', skill: 'long-division', difficulty: 3, question: 'What is 256 ÷ 16?', options: ['14', '18', '16', '15'], correct: 2, explanation: '256 ÷ 16 = 16. 16 × 16 = 256.' },
  { id: 'frac-1', skill: 'fractions-basic', difficulty: 3, question: 'What is ½ + ¼?', options: ['¾', '²⁄₄', '½', '¹⁄₃'], correct: 0, explanation: '½ + ¼ = ²⁄₄ + ¼ = ¾. Convert ½ to ²⁄₄ so both have the same denominator.' },
  { id: 'frac-2', skill: 'fractions-basic', difficulty: 4, question: 'What is ³⁄₅ + ²⁄₃?', options: ['⁵⁄₈', '¹⁹⁄₁₅', '¹¹⁄₁₅', '⁵⁄₁₅'], correct: 1, explanation: '³⁄₅ + ²⁄₃: LCD is 15. ⁹⁄₁₅ + ¹⁰⁄₁₅ = ¹⁹⁄₁₅ (or 1⁴⁄₁₅).' },
  { id: 'frac-3', skill: 'fractions-multiply', difficulty: 4, question: 'What is ²⁄₃ × ³⁄₄?', options: ['⁶⁄₇', '½', '²⁄₄', '⁵⁄₇'], correct: 1, explanation: '²⁄₃ × ³⁄₄ = ⁶⁄₁₂ = ½. Multiply numerators and denominators, then simplify.' },
  { id: 'frac-4', skill: 'fractions-divide', difficulty: 5, question: 'What is ⁵⁄₆ ÷ ²⁄₃?', options: ['¹⁰⁄₁₈', '1¼', '⁵⁄₄', '⁵⁄₉'], correct: 2, explanation: '⁵⁄₆ ÷ ²⁄₃ = ⁵⁄₆ × ³⁄₂ = ¹⁵⁄₁₂ = ⁵⁄₄. Flip the second fraction and multiply.' },
  { id: 'dec-1', skill: 'decimals', difficulty: 3, question: 'What is 3.5 + 2.75?', options: ['5.25', '6.25', '6.15', '5.75'], correct: 1, explanation: '3.50 + 2.75 = 6.25. Line up the decimal points and add column by column.' },
  { id: 'dec-2', skill: 'decimals', difficulty: 4, question: 'What is 0.6 × 0.4?', options: ['2.4', '0.24', '0.024', '24'], correct: 1, explanation: '0.6 × 0.4 = 0.24. Multiply 6×4=24, then count decimal places (2 total).' },
  { id: 'pct-1', skill: 'percentages', difficulty: 4, question: 'What is 25% of 80?', options: ['25', '15', '20', '30'], correct: 2, explanation: '25% of 80 = 0.25 × 80 = 20. Or think: ¼ of 80 = 20.' },
  { id: 'pct-2', skill: 'percentages', difficulty: 5, question: 'If a $60 item is 30% off, what is the sale price?', options: ['$18', '$42', '$30', '$48'], correct: 1, explanation: '30% of $60 = $18. Sale price = $60 − $18 = $42.' },
  { id: 'alg-1', skill: 'variables', difficulty: 5, question: 'If x + 7 = 15, what is x?', options: ['7', '22', '8', '9'], correct: 2, explanation: 'x + 7 = 15. Subtract 7 from both sides: x = 15 − 7 = 8.' },
  { id: 'alg-2', skill: 'variables', difficulty: 6, question: 'Solve for x: 3x − 5 = 16', options: ['7', '3', '21', '11'], correct: 0, explanation: '3x − 5 = 16. Add 5: 3x = 21. Divide by 3: x = 7.' },
  { id: 'alg-3', skill: 'expressions', difficulty: 6, question: 'Simplify: 2(x + 3) + 4x', options: ['6x + 3', '2x + 10', '6x + 6', '8x + 3'], correct: 2, explanation: '2(x+3) + 4x = 2x + 6 + 4x = 6x + 6. Distribute, then combine like terms.' },
  { id: 'alg-4', skill: 'linear-equations', difficulty: 7, question: 'Solve: 2x + 3 = x − 4', options: ['-7', '7', '-1', '1'], correct: 0, explanation: '2x + 3 = x − 4. Subtract x: x + 3 = −4. Subtract 3: x = −7.' },
  { id: 'alg-5', skill: 'linear-equations', difficulty: 7, question: 'What is the slope of the line y = −3x + 5?', options: ['5', '-3', '3', '-5'], correct: 1, explanation: 'In y = mx + b form, the slope m = −3.' },
  { id: 'alg-6', skill: 'quadratics', difficulty: 8, question: 'Factor: x² + 5x + 6', options: ['(x+1)(x+6)', '(x+2)(x+3)', '(x+3)(x+3)', '(x+2)(x+4)'], correct: 1, explanation: 'Find two numbers that multiply to 6 and add to 5: 2 and 3. So (x+2)(x+3).' },
  { id: 'alg-7', skill: 'quadratics', difficulty: 8, question: 'Solve: x² − 9 = 0', options: ['x = 3', 'x = ±3', 'x = 9', 'x = ±9'], correct: 1, explanation: "x² = 9. Take the square root: x = ±3. Don't forget the negative root!" },
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
