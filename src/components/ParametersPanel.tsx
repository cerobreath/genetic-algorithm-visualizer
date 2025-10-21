import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GAParams {
    populationSize: number;
    crossoverRate: number;
    mutationRate: number;
    maxGenerations: number;
    functionExpression: string;
    elitism?: number;
}

interface ParametersPanelProps {
    params: GAParams;
    onParamsChange: (params: GAParams) => void;
    onInitialize: () => void;
    onEvolve: () => void;
    onStep: () => void;
    onReset: () => void;
    isRunning: boolean;
    isInitialized: boolean;
}

export function ParametersPanel({
                                    params,
                                    onParamsChange,
                                    onInitialize,
                                    onEvolve,
                                    onStep,
                                    onReset,
                                    isRunning,
                                    isInitialized,
                                }: ParametersPanelProps) {
    const handleNumberChange = (field: keyof GAParams, value: string) => {
        if (value === '' || value === '-') {
            onParamsChange({ ...params, [field]: value as any });
            return;
        }

        const parsed = field === 'crossoverRate' || field === 'mutationRate'
            ? parseFloat(value)
            : parseInt(value, 10);

        if (!isNaN(parsed)) {
            onParamsChange({ ...params, [field]: parsed });
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Параметри алгоритму</h2>

            <div className="space-y-2 mb-4">
                <Label htmlFor="functionExpression">Функція f(x)</Label>
                <Input
                    id="functionExpression"
                    type="text"
                    placeholder="(2*x/256)^2 - 5*x + 130"
                    value={params.functionExpression}
                    onChange={(e) => onParamsChange({ ...params, functionExpression: e.target.value })}
                    disabled={isInitialized}
                    className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                    Використовуйте 'x' як змінну. Підтримуються: +, -, *, /, ^, Math функції (sqrt, sin, cos, abs тощо)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                    <Label htmlFor="populationSize">Розмір популяції (n)</Label>
                    <Input
                        id="populationSize"
                        type="number"
                        value={params.populationSize}
                        onChange={(e) => handleNumberChange('populationSize', e.target.value)}
                        disabled={isInitialized}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maxGenerations">Макс. поколінь</Label>
                    <Input
                        id="maxGenerations"
                        type="number"
                        value={params.maxGenerations}
                        onChange={(e) => handleNumberChange('maxGenerations', e.target.value)}
                        disabled={isInitialized}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="crossoverRate">Ймовірність схрещування (pc)</Label>
                    <Input
                        id="crossoverRate"
                        type="number"
                        step="0.01"
                        value={params.crossoverRate}
                        onChange={(e) => handleNumberChange('crossoverRate', e.target.value)}
                        disabled={isInitialized}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mutationRate">Ймовірність мутації (pm)</Label>
                    <Input
                        id="mutationRate"
                        type="number"
                        step="0.001"
                        value={params.mutationRate}
                        onChange={(e) => handleNumberChange('mutationRate', e.target.value)}
                        disabled={isInitialized}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="elitism">Елітизм (кількість)</Label>
                    <Input
                        id="elitism"
                        type="number"
                        value={params.elitism || 0}
                        onChange={(e) => handleNumberChange('elitism', e.target.value)}
                        disabled={isInitialized}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={onInitialize}
                    disabled={isInitialized || isRunning}
                    variant="default"
                >
                    Ініціалізувати популяцію
                </Button>

                <Button
                    onClick={onEvolve}
                    disabled={!isInitialized || isRunning}
                    variant="default"
                >
                    Запустити еволюцію
                </Button>

                <Button
                    onClick={onStep}
                    disabled={!isInitialized || isRunning}
                    variant="secondary"
                >
                    Крок вперед
                </Button>

                <Button
                    onClick={onReset}
                    disabled={isRunning}
                    variant="outline"
                >
                    Скинути
                </Button>
            </div>
        </Card>
    );
}