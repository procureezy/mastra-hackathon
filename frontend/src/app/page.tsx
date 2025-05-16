import CrmLayout from "@/components/CrmLayout";
import { mastraClient } from "@/lib/mastra";
import { TwitterListAnalysis } from "@/types/twitter-list";

export default async function Home() {
  try {
    // Get a reference to the x-summarizer agent
    const agent = await mastraClient.getAgent("x-summarizer");

    // Generate analysis using the agent
    const result = await agent.generate({
      messages: [
        {
          role: "user",
          content: "Analyze this Twitter list: https://x.com/i/lists/1885044904994234805",
        },
      ],
    });

    // Parse the response
    const data = JSON.parse(result.text) as TwitterListAnalysis;

    // Render the CRM layout with the analyzed data
    return <CrmLayout data={data} />;
  } catch (error) {
    console.error("Error calling x-summarizer agent:", error);
    return (
      <div className="p-4 text-red-600">
        Error analyzing Twitter list. Please try again later.
      </div>
    );
  }
}
