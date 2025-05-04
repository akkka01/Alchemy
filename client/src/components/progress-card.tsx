import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressItem {
  name: string;
  percentage: number;
}

interface ProgressCardProps {
  progress: ProgressItem[];
}

export function ProgressCard({ progress }: ProgressCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden mb-6 border-t-2 border-t-accent-400">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Your Learning Progress</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {progress.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <span className="text-sm text-gray-500">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-2.5" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
