import { Card } from "@/components/ui/card";
import { Individual } from "@/lib/geneticAlgorithm";

interface BestSolutionInfoProps {
  best: Individual | null;
  generation: number;
}

export function BestSolutionInfo({ best, generation }: BestSolutionInfoProps) {
  if (!best) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Найкраще рішення</h2>
        <p className="text-muted-foreground">Ініціалізуйте популяцію для початку</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-accent/5 border-accent/20">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Найкраще рішення</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Покоління:</span>
          <span className="font-semibold text-lg">{generation}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Бінарний рядок:</span>
          <span className="font-mono font-semibold text-lg">{best.binary}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">x:</span>
          <span className="font-semibold text-lg">{best.x}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-accent/20">
          <span className="text-muted-foreground">f(x):</span>
          <span className="font-bold text-2xl text-accent">{best.fitness.toFixed(4)}</span>
        </div>
      </div>
    </Card>
  );
}
