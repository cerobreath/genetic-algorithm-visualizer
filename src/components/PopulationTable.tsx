import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Individual } from "@/lib/geneticAlgorithm";

interface PopulationTableProps {
  population: Individual[];
  generation: number;
}

export function PopulationTable({ population, generation }: PopulationTableProps) {
  if (population.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Поточна популяція</h2>
        <p className="text-muted-foreground">Ініціалізуйте популяцію для початку</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Поточна популяція (Покоління {generation})
      </h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="font-mono">Бінарний рядок</TableHead>
              <TableHead>x</TableHead>
              <TableHead>f(x)</TableHead>
              <TableHead>Норм. якість</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {population.map((individual, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">{individual.binary}</TableCell>
                <TableCell>{individual.x}</TableCell>
                <TableCell>{individual.fitness.toFixed(4)}</TableCell>
                <TableCell>{individual.normalizedFitness.toFixed(6)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
