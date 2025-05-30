import { Card, Text, Badge } from "@tremor/react";

interface TestResultsSummaryProps {
  fuzzTestsPassed: boolean;
  invariantTestsPassed: boolean;
}

export default function TestResultsSummary({ fuzzTestsPassed, invariantTestsPassed }: TestResultsSummaryProps) {
  return (
    <Card className="mt-4">
      <Text className="font-bold mb-2">Latest Test Results</Text>
      <div className="flex space-x-4">
        <Badge color={fuzzTestsPassed ? "emerald" : "red"}>
          Fuzz Tests: {fuzzTestsPassed ? "Passed" : "Failed"}
        </Badge>
        <Badge color={invariantTestsPassed ? "emerald" : "red"}>
          Invariant Tests: {invariantTestsPassed ? "Passed" : "Failed"}
        </Badge>
      </div>
    </Card>
  );
}
