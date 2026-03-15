// Question bank organized by skill strand and difficulty level
// Difficulty: 1 = ~2nd grade, 5 = ~6th grade, 8 = ~algebra/pre-algebra

export const questions = [
    // --- Addition / Subtraction (difficulty 1-2) ---
    {
        id: 'add-1',
        skill: 'addition',
        difficulty: 1,
        question: 'What is 7 + 5?',
        options: ['10', '12', '13', '11'],
        correct: 1,
        explanation: '7 + 5 = 12. You can count up 5 from 7: 8, 9, 10, 11, 12.',
    },
    {
        id: 'add-2',
        skill: 'addition',
        difficulty: 1,
        question: 'What is 24 + 18?',
        options: ['42', '32', '44', '40'],
        correct: 0,
        explanation: '24 + 18 = 42. Add the ones: 4+8=12 (carry the 1). Add the tens: 2+1+1=4.',
    },
    {
        id: 'sub-1',
        skill: 'subtraction',
        difficulty: 1,
        question: 'What is 15 − 8?',
        options: ['6', '7', '8', '9'],
        correct: 1,
        explanation: '15 − 8 = 7. You can count down 8 from 15, or think: 8 + ? = 15.',
    },
    {
        id: 'sub-2',
        skill: 'subtraction',
        difficulty: 2,
        question: 'What is 103 − 47?',
        options: ['66', '56', '54', '64'],
        correct: 1,
        explanation: '103 − 47 = 56. Borrow from the hundreds: 10 tens − 4 tens = 6 tens, 13 ones − 7 ones = 6.',
    },

    // --- Multiplication (difficulty 2-3) ---
    {
        id: 'mul-1',
        skill: 'multiplication',
        difficulty: 2,
        question: 'What is 6 × 7?',
        options: ['36', '48', '42', '49'],
        correct: 2,
        explanation: '6 × 7 = 42. Think of it as 6 groups of 7.',
    },
    {
        id: 'mul-2',
        skill: 'multiplication',
        difficulty: 2,
        question: 'What is 9 × 8?',
        options: ['72', '64', '81', '63'],
        correct: 0,
        explanation: '9 × 8 = 72. A trick: 9×8 is one less group of 9 than 9×9=81, so 81−9=72.',
    },
    {
        id: 'mul-3',
        skill: 'multiplication',
        difficulty: 3,
        question: 'What is 12 × 15?',
        options: ['170', '180', '160', '150'],
        correct: 1,
        explanation: '12 × 15 = 180. Break it up: 12×10=120, 12×5=60, 120+60=180.',
    },

    // --- Division (difficulty 2-3) ---
    {
        id: 'div-1',
        skill: 'division',
        difficulty: 2,
        question: 'What is 56 ÷ 8?',
        options: ['6', '8', '7', '9'],
        correct: 2,
        explanation: '56 ÷ 8 = 7, because 8 × 7 = 56.',
    },
    {
        id: 'div-2',
        skill: 'division',
        difficulty: 3,
        question: 'What is 144 ÷ 12?',
        options: ['11', '13', '14', '12'],
        correct: 3,
        explanation: '144 ÷ 12 = 12, because 12 × 12 = 144.',
    },
    {
        id: 'div-3',
        skill: 'long-division',
        difficulty: 3,
        question: 'What is 256 ÷ 16?',
        options: ['14', '18', '16', '15'],
        correct: 2,
        explanation: '256 ÷ 16 = 16. 16 × 16 = 256.',
    },

    // --- Fractions (difficulty 3-5) ---
    {
        id: 'frac-1',
        skill: 'fractions-basic',
        difficulty: 3,
        question: 'What is ½ + ¼?',
        options: ['¾', '²⁄₄', '½', '¹⁄₃'],
        correct: 0,
        explanation: '½ + ¼ = ²⁄₄ + ¼ = ¾. Convert ½ to ²⁄₄ so both have the same denominator.',
    },
    {
        id: 'frac-2',
        skill: 'fractions-basic',
        difficulty: 4,
        question: 'What is ³⁄₅ + ²⁄₃?',
        options: ['⁵⁄₈', '¹⁹⁄₁₅', '¹¹⁄₁₅', '⁵⁄₁₅'],
        correct: 1,
        explanation: '³⁄₅ + ²⁄₃: LCD is 15. ⁹⁄₁₅ + ¹⁰⁄₁₅ = ¹⁹⁄₁₅ (or 1⁴⁄₁₅).',
    },
    {
        id: 'frac-3',
        skill: 'fractions-multiply',
        difficulty: 4,
        question: 'What is ²⁄₃ × ³⁄₄?',
        options: ['⁶⁄₇', '½', '²⁄₄', '⁵⁄₇'],
        correct: 1,
        explanation: '²⁄₃ × ³⁄₄ = ⁶⁄₁₂ = ½. Multiply numerators and denominators, then simplify.',
    },
    {
        id: 'frac-4',
        skill: 'fractions-divide',
        difficulty: 5,
        question: 'What is ⁵⁄₆ ÷ ²⁄₃?',
        options: ['¹⁰⁄₁₈', '1¼', '⁵⁄₄', '⁵⁄₉'],
        correct: 2,
        explanation: '⁵⁄₆ ÷ ²⁄₃ = ⁵⁄₆ × ³⁄₂ = ¹⁵⁄₁₂ = ⁵⁄₄. Flip the second fraction and multiply.',
    },

    // --- Decimals (difficulty 3-4) ---
    {
        id: 'dec-1',
        skill: 'decimals',
        difficulty: 3,
        question: 'What is 3.5 + 2.75?',
        options: ['5.25', '6.25', '6.15', '5.75'],
        correct: 1,
        explanation: '3.50 + 2.75 = 6.25. Line up the decimal points and add column by column.',
    },
    {
        id: 'dec-2',
        skill: 'decimals',
        difficulty: 4,
        question: 'What is 0.6 × 0.4?',
        options: ['2.4', '0.24', '0.024', '24'],
        correct: 1,
        explanation: '0.6 × 0.4 = 0.24. Multiply 6×4=24, then count decimal places (2 total).',
    },

    // --- Percentages / Ratios (difficulty 4-5) ---
    {
        id: 'pct-1',
        skill: 'percentages',
        difficulty: 4,
        question: 'What is 25% of 80?',
        options: ['25', '15', '20', '30'],
        correct: 2,
        explanation: '25% of 80 = 0.25 × 80 = 20. Or think: ¼ of 80 = 20.',
    },
    {
        id: 'pct-2',
        skill: 'percentages',
        difficulty: 5,
        question: 'If a $60 item is 30% off, what is the sale price?',
        options: ['$18', '$42', '$30', '$48'],
        correct: 1,
        explanation: '30% of $60 = $18. Sale price = $60 − $18 = $42.',
    },

    // --- Pre-Algebra (difficulty 5-6) ---
    {
        id: 'alg-1',
        skill: 'variables',
        difficulty: 5,
        question: 'If x + 7 = 15, what is x?',
        options: ['7', '22', '8', '9'],
        correct: 2,
        explanation: 'x + 7 = 15. Subtract 7 from both sides: x = 15 − 7 = 8.',
    },
    {
        id: 'alg-2',
        skill: 'variables',
        difficulty: 6,
        question: 'Solve for x: 3x − 5 = 16',
        options: ['7', '3', '21', '11'],
        correct: 0,
        explanation: '3x − 5 = 16. Add 5: 3x = 21. Divide by 3: x = 7.',
    },
    {
        id: 'alg-3',
        skill: 'expressions',
        difficulty: 6,
        question: 'Simplify: 2(x + 3) + 4x',
        options: ['6x + 3', '2x + 10', '6x + 6', '8x + 3'],
        correct: 2,
        explanation: '2(x+3) + 4x = 2x + 6 + 4x = 6x + 6. Distribute, then combine like terms.',
    },

    // --- Algebra (difficulty 7-8) ---
    {
        id: 'alg-4',
        skill: 'linear-equations',
        difficulty: 7,
        question: 'Solve: 2x + 3 = x − 4',
        options: ['-7', '7', '-1', '1'],
        correct: 0,
        explanation: '2x + 3 = x − 4. Subtract x: x + 3 = −4. Subtract 3: x = −7.',
    },
    {
        id: 'alg-5',
        skill: 'linear-equations',
        difficulty: 7,
        question: 'What is the slope of the line y = −3x + 5?',
        options: ['5', '-3', '3', '-5'],
        correct: 1,
        explanation: 'In y = mx + b form, the slope m = −3.',
    },
    {
        id: 'alg-6',
        skill: 'quadratics',
        difficulty: 8,
        question: 'Factor: x² + 5x + 6',
        options: ['(x+1)(x+6)', '(x+2)(x+3)', '(x+3)(x+3)', '(x+2)(x+4)'],
        correct: 1,
        explanation: 'Find two numbers that multiply to 6 and add to 5: 2 and 3. So (x+2)(x+3).',
    },
    {
        id: 'alg-7',
        skill: 'quadratics',
        difficulty: 8,
        question: 'Solve: x² − 9 = 0',
        options: ['x = 3', 'x = ±3', 'x = 9', 'x = ±9'],
        correct: 1,
        explanation: 'x² = 9. Take the square root: x = ±3. Don\'t forget the negative root!',
    },
];

// Get questions by difficulty range
export function getQuestionsByDifficulty(min, max) {
    return questions.filter(q => q.difficulty >= min && q.difficulty <= max);
}

// Get questions by skill
export function getQuestionsBySkill(skill) {
    return questions.filter(q => q.skill === skill);
}

// Adaptive selection: pick a question near the target difficulty
export function pickAdaptiveQuestion(targetDifficulty, answeredIds = []) {
    const available = questions.filter(q => !answeredIds.includes(q.id));
    if (available.length === 0) return null;

    // Sort by proximity to target difficulty
    const sorted = [...available].sort(
        (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
    );

    // Pick from top 3 closest (with some randomness)
    const pool = sorted.slice(0, 3);
    return pool[Math.floor(Math.random() * pool.length)];
}
