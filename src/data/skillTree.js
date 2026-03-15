// Skill dependency graph for math
// Each node has: id, label, subject, gradeLevel, prerequisites (ids), position (for rendering)

export const skillNodes = [
    // Layer 0 — Foundations
    { id: 'addition', label: 'Addition', gradeLevel: 1, prerequisites: [], x: 200, y: 60 },
    { id: 'subtraction', label: 'Subtraction', gradeLevel: 1, prerequisites: [], x: 440, y: 60 },

    // Layer 1 — Building blocks
    { id: 'multiplication', label: 'Multiplication', gradeLevel: 3, prerequisites: ['addition'], x: 120, y: 180 },
    { id: 'division', label: 'Division', gradeLevel: 3, prerequisites: ['subtraction', 'multiplication'], x: 320, y: 180 },
    { id: 'place-value', label: 'Place Value', gradeLevel: 2, prerequisites: ['addition', 'subtraction'], x: 520, y: 180 },

    // Layer 2 — Intermediate
    { id: 'long-division', label: 'Long Division', gradeLevel: 4, prerequisites: ['division'], x: 120, y: 300 },
    { id: 'fractions-basic', label: 'Basic Fractions', gradeLevel: 3, prerequisites: ['division'], x: 320, y: 300 },
    { id: 'decimals', label: 'Decimals', gradeLevel: 4, prerequisites: ['place-value', 'division'], x: 520, y: 300 },

    // Layer 3 — Fraction operations
    { id: 'fractions-multiply', label: 'Multiply Fractions', gradeLevel: 5, prerequisites: ['fractions-basic', 'multiplication'], x: 180, y: 420 },
    { id: 'fractions-divide', label: 'Divide Fractions', gradeLevel: 5, prerequisites: ['fractions-basic', 'long-division'], x: 400, y: 420 },
    { id: 'percentages', label: 'Percentages', gradeLevel: 6, prerequisites: ['decimals', 'fractions-basic'], x: 560, y: 420 },

    // Layer 4 — Pre-Algebra
    { id: 'variables', label: 'Variables & Expressions', gradeLevel: 6, prerequisites: ['fractions-multiply', 'fractions-divide'], x: 200, y: 540 },
    { id: 'order-operations', label: 'Order of Operations', gradeLevel: 5, prerequisites: ['multiplication', 'fractions-basic'], x: 440, y: 540 },

    // Layer 5 — Algebra
    { id: 'expressions', label: 'Simplify Expressions', gradeLevel: 7, prerequisites: ['variables', 'order-operations'], x: 240, y: 660 },
    { id: 'linear-equations', label: 'Linear Equations', gradeLevel: 7, prerequisites: ['expressions'], x: 400, y: 660 },

    // Layer 6 — Advanced
    { id: 'quadratics', label: 'Quadratics', gradeLevel: 8, prerequisites: ['linear-equations'], x: 320, y: 780 },
];

// Build adjacency info for rendering edges
export function getEdges() {
    const edges = [];
    for (const node of skillNodes) {
        for (const prereqId of node.prerequisites) {
            edges.push({ from: prereqId, to: node.id });
        }
    }
    return edges;
}

// Get node by id
export function getNode(id) {
    return skillNodes.find(n => n.id === id);
}

// Determine which skills are unlocked given a set of mastered skills
export function getUnlockedSkills(masteredIds) {
    return skillNodes.filter(node => {
        if (masteredIds.includes(node.id)) return false; // already mastered
        return node.prerequisites.every(prereq => masteredIds.includes(prereq));
    });
}

// Default demo state — student has mastered basics, working on fractions
export const demoMasteredSkills = [
    'addition', 'subtraction', 'multiplication', 'division', 'place-value',
    'long-division', 'fractions-basic', 'decimals',
];

export const demoInProgressSkills = [
    'fractions-multiply', 'fractions-divide', 'percentages',
];
