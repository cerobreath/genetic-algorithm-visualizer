import { useState, useCallback } from "react";
import { ParametersPanel } from "@/components/ParametersPanel";
import { PopulationTable } from "@/components/PopulationTable";
import { EvolutionChart } from "@/components/EvolutionChart";
import { BestSolutionInfo } from "@/components/BestSolutionInfo";
import {
  GAParams,
  Individual,
  initializePopulation,
  evolveGeneration,
  getBest,
  getAverageFitness,
} from "@/lib/geneticAlgorithm";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [params, setParams] = useState<GAParams>({
    populationSize: 18,
    crossoverRate: 0.64,
    mutationRate: 0.025,
    maxGenerations: 100,
    functionExpression: '(2*x/256)^2 - 5*x + 130',
  });

  const [population, setPopulation] = useState<Individual[]>([]);
  const [generation, setGeneration] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<Array<{ generation: number; maxFitness: number; avgFitness: number }>>([]);
  const [best, setBest] = useState<Individual | null>(null);

  const handleInitialize = useCallback(() => {
    const newPopulation = initializePopulation(params.populationSize, params.functionExpression);
    setPopulation(newPopulation);
    setGeneration(0);
    setIsInitialized(true);
    setHistory([]);
    
    const bestIndividual = getBest(newPopulation);
    setBest(bestIndividual);
    
    const avgFitness = getAverageFitness(newPopulation);
    setHistory([{ generation: 0, maxFitness: bestIndividual.fitness, avgFitness }]);
    
    toast({
      title: "Популяція ініціалізована",
      description: `Створено ${params.populationSize} особин`,
    });
  }, [params.populationSize, params.functionExpression]);

  const handleStep = useCallback(() => {
    if (!isInitialized || generation >= params.maxGenerations) return;

    const newPopulation = evolveGeneration(population, params);
    const newGeneration = generation + 1;
    
    setPopulation(newPopulation);
    setGeneration(newGeneration);
    
    const bestIndividual = getBest(newPopulation);
    setBest(bestIndividual);
    
    const avgFitness = getAverageFitness(newPopulation);
    setHistory((prev) => [...prev, { generation: newGeneration, maxFitness: bestIndividual.fitness, avgFitness }]);
    
    if (newGeneration >= params.maxGenerations) {
      toast({
        title: "Еволюція завершена",
        description: `Досягнуто максимальну кількість поколінь: ${params.maxGenerations}`,
      });
    }
  }, [isInitialized, generation, params, population]);

  const handleEvolve = useCallback(async () => {
    if (!isInitialized) return;
    
    setIsRunning(true);
    
    let currentPopulation = population;
    let currentGeneration = generation;
    const newHistory = [...history];
    
    toast({
      title: "Еволюція розпочата",
      description: "Виконується автоматична еволюція...",
    });
    
    while (currentGeneration < params.maxGenerations) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      currentPopulation = evolveGeneration(currentPopulation, params);
      currentGeneration++;
      
      const bestIndividual = getBest(currentPopulation);
      const avgFitness = getAverageFitness(currentPopulation);
      
      newHistory.push({ generation: currentGeneration, maxFitness: bestIndividual.fitness, avgFitness });
      
      setPopulation([...currentPopulation]);
      setGeneration(currentGeneration);
      setBest(bestIndividual);
      setHistory([...newHistory]);
    }
    
    setIsRunning(false);
    
    toast({
      title: "Еволюція завершена",
      description: `Виконано ${params.maxGenerations} поколінь`,
    });
  }, [isInitialized, generation, params, population, history]);

  const handleReset = useCallback(() => {
    setPopulation([]);
    setGeneration(0);
    setIsInitialized(false);
    setIsRunning(false);
    setHistory([]);
    setBest(null);
    
    toast({
      title: "Скинуто",
      description: "Всі дані очищено",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Генетичний алгоритм
          </h1>
          <p className="text-muted-foreground">
            Максимізація функції f(x) = {params.functionExpression}, де x ∈ [0, 255]
          </p>
        </header>

        <ParametersPanel
          params={params}
          onParamsChange={setParams}
          onInitialize={handleInitialize}
          onEvolve={handleEvolve}
          onStep={handleStep}
          onReset={handleReset}
          isRunning={isRunning}
          isInitialized={isInitialized}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EvolutionChart history={history} />
          </div>
          <div>
            <BestSolutionInfo best={best} generation={generation} />
          </div>
        </div>

        <PopulationTable population={population} generation={generation} />
      </div>
    </div>
  );
};

export default Index;
