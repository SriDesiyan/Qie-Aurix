import AllocationChart from "@/components/AllocationChart";
import Card from "@/components/Card";
import PerformanceChart from "@/components/PerformanceChart";
import SwapForm from "@/components/SwapForm";
import Typography from "@/components/Typography";
import { useHydrated } from "@/hooks";

export default function Home() {
  const { hasHydrated } = useHydrated();
  return (
    <div className="max-w-[1240px] w-full m-auto h-full px-4 pt-6">
      <Typography variant="headlineH4" className="mb-6 dark:text-white">
        Hedge Fund Pool
      </Typography>

      <div className="grid grid-cols-[auto_350px] gap-6">
        <div className="flex gap-4 w-full flex-col">
          {/* <Card>
            <Typography variant="headlineH6">Performance</Typography>

            <div className="pt-6">
              <PerformanceChart />
            </div>
          </Card> */}

          <Card>
            <Typography variant="headlineH6">Allocation</Typography>
            <div className="pt-6">
              <AllocationChart />
            </div>
          </Card>
        </div>
        <div className="flex w-full flex-col">
          {hasHydrated && <SwapForm />}
        </div>
      </div>
    </div>
  );
}
