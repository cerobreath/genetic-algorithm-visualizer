export interface Individual {
    binary: string;
    x: number;
    fitness: number;
    normalizedFitness: number;
}

export interface GAParams {
    populationSize: number;
    crossoverRate: number;
    mutationRate: number;
    maxGenerations: number;
    functionExpression: string;
    elitism?: number;
}

export interface GenerationResult {
    generation: number;
    population: Individual[];
    best: Individual;
    avgFitness: number;
    maxFitness: number;
}

let cachedMinValue: number | null = null;
let cachedMaxValue: number | null = null;
let cachedExpression: string | null = null;

/**
 * Обчислює значення функції для заданого x
 * @param expression - математичний вираз функції
 * @param x - значення змінної x
 * @returns значення f(x)
 */
export function evaluateFunction(expression: string, x: number): number {
    try {
        const sanitized = expression
            .replace(/\^/g, '**')
            .replace(/x/g, `(${x})`);

        const func = new Function('Math', `return ${sanitized}`);
        const result = func(Math);

        if (isNaN(result) || !isFinite(result)) {
            return 0;
        }

        return result;
    } catch (error) {
        return 0;
    }
}

/**
 * Знаходить мінімальне та максимальне значення функції в діапазоні [0, 255]
 * @param expression - математичний вираз функції
 * @returns об'єкт з min та max значеннями
 */
export function findMinMaxValues(expression: string): { min: number; max: number } {
    if (expression === cachedExpression && cachedMinValue !== null && cachedMaxValue !== null) {
        return { min: cachedMinValue, max: cachedMaxValue };
    }

    let min = Infinity;
    let max = -Infinity;

    for (let x = 0; x <= 255; x++) {
        const value = evaluateFunction(expression, x);
        if (value < min) min = value;
        if (value > max) max = value;
    }

    cachedExpression = expression;
    cachedMinValue = min;
    cachedMaxValue = max;

    return { min, max };
}

/**
 * Обчислює сире (необроблене) значення функції пристосованості
 * @param x - значення змінної x
 * @param expression - математичний вираз функції
 * @returns сире значення f(x)
 */
export function rawFitnessFunction(x: number, expression?: string): number {
    const defaultExpression = '(2*x/256)^2 - 5*x + 130';
    return evaluateFunction(expression || defaultExpression, x);
}

/**
 * Обчислює функцію пристосованості зі зміщенням для забезпечення позитивних значень
 * @param x - значення змінної x
 * @param expression - математичний вираз функції
 * @returns зміщене позитивне значення пристосованості
 */
export function fitnessFunction(x: number, expression?: string): number {
    const defaultExpression = '(2*x/256)^2 - 5*x + 130';
    const expr = expression || defaultExpression;

    const rawFitness = evaluateFunction(expr, x);
    const { min } = findMinMaxValues(expr);

    const shiftedFitness = rawFitness - min + 1;

    return shiftedFitness;
}

/**
 * Конвертує бінарний рядок у десяткове число
 * @param binary - 8-бітний бінарний рядок
 * @returns десяткове значення
 */
export function binaryToDecimal(binary: string): number {
    return parseInt(binary, 2);
}

/**
 * Конвертує десяткове число у 8-бітний бінарний рядок
 * @param decimal - десяткове значення
 * @returns 8-бітний бінарний рядок
 */
export function decimalToBinary(decimal: number): string {
    const clamped = Math.max(0, Math.min(255, Math.floor(decimal)));
    return clamped.toString(2).padStart(8, '0');
}

/**
 * Генерує випадковий 8-бітний бінарний рядок
 * @returns випадковий бінарний рядок
 */
export function randomBinary(): string {
    const decimal = Math.floor(Math.random() * 256);
    return decimalToBinary(decimal);
}

/**
 * Створює початкову популяцію особин
 * @param size - розмір популяції
 * @param functionExpression - математичний вираз функції
 * @returns масив особин
 */
export function initializePopulation(size: number, functionExpression?: string): Individual[] {
    const population: Individual[] = [];

    for (let i = 0; i < size; i++) {
        const binary = randomBinary();
        const x = binaryToDecimal(binary);
        const fitness = fitnessFunction(x, functionExpression);

        population.push({
            binary,
            x,
            fitness,
            normalizedFitness: 0,
        });
    }

    return normalizePopulation(population);
}

/**
 * Нормалізує значення пристосованості популяції для методу рулетки
 * @param population - масив особин
 * @returns масив особин з нормалізованою пристосованістю
 */
export function normalizePopulation(population: Individual[]): Individual[] {
    const totalFitness = population.reduce((sum, ind) => sum + ind.fitness, 0);

    if (totalFitness <= 0) {
        return population.map(ind => ({
            ...ind,
            normalizedFitness: 1 / population.length,
        }));
    }

    const uniqueFitness = new Set(population.map(ind => ind.fitness)).size;
    if (uniqueFitness === 1) {
        return population.map(ind => ({
            ...ind,
            normalizedFitness: 1 / population.length,
        }));
    }

    const normalized = population.map(ind => ({
        ...ind,
        normalizedFitness: ind.fitness / totalFitness,
    }));

    return normalized;
}

/**
 * Відбір особини методом рулетки
 * @param population - масив особин з нормалізованою пристосованістю
 * @returns обрана особина
 */
export function rouletteSelection(population: Individual[]): Individual {
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < population.length; i++) {
        cumulative += population[i].normalizedFitness;
        if (random <= cumulative) {
            return population[i];
        }
    }

    return population[population.length - 1];
}

/**
 * Одноточкове схрещування двох батьків
 * @param parent1 - перша батьківська особина
 * @param parent2 - друга батьківська особина
 * @param rate - ймовірність схрещування (pc)
 * @returns пара бінарних рядків нащадків
 */
export function crossover(parent1: Individual, parent2: Individual, rate: number): [string, string] {
    if (Math.random() > rate) {
        return [parent1.binary, parent2.binary];
    }

    const point = Math.floor(Math.random() * 7) + 1;

    const child1 = parent1.binary.slice(0, point) + parent2.binary.slice(point);
    const child2 = parent2.binary.slice(0, point) + parent1.binary.slice(point);

    return [child1, child2];
}

/**
 * Мутація особини шляхом інверсії бітів
 * @param binary - бінарний рядок особини
 * @param rate - ймовірність мутації біта (pm)
 * @returns мутований бінарний рядок
 */
export function mutate(binary: string, rate: number): string {
    let mutated = '';

    for (let i = 0; i < binary.length; i++) {
        if (Math.random() < rate) {
            mutated += binary[i] === '0' ? '1' : '0';
        } else {
            mutated += binary[i];
        }
    }

    return mutated;
}

/**
 * Створює нову особину з бінарного рядка
 * @param binary - бінарний рядок
 * @param functionExpression - математичний вираз функції
 * @returns об'єкт особини
 */
export function createIndividual(binary: string, functionExpression?: string): Individual {
    const x = binaryToDecimal(binary);
    const fitness = fitnessFunction(x, functionExpression);

    return {
        binary,
        x,
        fitness,
        normalizedFitness: 0,
    };
}

/**
 * Еволюція популяції на одне покоління
 * @param population - поточна популяція
 * @param params - параметри генетичного алгоритму
 * @returns нова популяція після відтворення, схрещування та мутації
 */
export function evolveGeneration(
    population: Individual[],
    params: GAParams
): Individual[] {
    const newPopulation: Individual[] = [];

    const elitism = Math.max(0, Math.floor(params.elitism || 0));
    const maxElitism = Math.min(elitism, params.populationSize);

    if (maxElitism > 0) {
        const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
        for (let i = 0; i < maxElitism && newPopulation.length < params.populationSize; i++) {
            const elite = { ...sorted[i] };
            newPopulation.push(elite);
        }
    }

    while (newPopulation.length < params.populationSize) {
        const parent1 = rouletteSelection(population);
        const parent2 = rouletteSelection(population);

        const [child1Binary, child2Binary] = crossover(
            parent1,
            parent2,
            params.crossoverRate
        );

        const mutated1 = mutate(child1Binary, params.mutationRate);
        const mutated2 = mutate(child2Binary, params.mutationRate);

        newPopulation.push(createIndividual(mutated1, params.functionExpression));

        if (newPopulation.length < params.populationSize) {
            newPopulation.push(createIndividual(mutated2, params.functionExpression));
        }
    }

    return normalizePopulation(newPopulation);
}

/**
 * Знаходить найкращу особину в популяції
 * @param population - масив особин
 * @returns особина з максимальною пристосованістю
 */
export function getBest(population: Individual[]): Individual {
    return population.reduce((best, ind) =>
        ind.fitness > best.fitness ? ind : best
    );
}

/**
 * Обчислює середню пристосованість популяції
 * @param population - масив особин
 * @returns середнє значення пристосованості
 */
export function getAverageFitness(population: Individual[]): number {
    if (population.length === 0) return 0;
    const total = population.reduce((sum, ind) => sum + ind.fitness, 0);
    return total / population.length;
}

/**
 * Знаходить найгіршу особину в популяції
 * @param population - масив особин
 * @returns особина з мінімальною пристосованістю
 */
export function getWorst(population: Individual[]): Individual {
    return population.reduce((worst, ind) =>
        ind.fitness < worst.fitness ? ind : worst
    );
}

/**
 * Скидає кеш мінімальних/максимальних значень функції
 */
export function resetCache(): void {
    cachedMinValue = null;
    cachedMaxValue = null;
    cachedExpression = null;
}

/**
 * Виводить статистику популяції
 * @param population - масив особин
 * @param generation - номер покоління
 * @param expression - математичний вираз функції
 */
export function printPopulationStats(
    population: Individual[],
    generation: number,
    expression?: string
): void {
    const best = getBest(population);
    const worst = getWorst(population);
    const avg = getAverageFitness(population);

    const fitnessVariance = population.reduce((sum, ind) =>
        sum + Math.pow(ind.fitness - avg, 2), 0) / population.length;
}