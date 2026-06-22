import { TrafficAnalyticsDashboard } from "@/components/analytics/TrafficAnalyticsDashboard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Website Traffic"
        title="See public website visitors, sessions, pages and activity"
        description="Track anonymous public site traffic, active sessions, page views, top pages, traffic sources, devices, approximate locations and time on page."
      />
      <TrafficAnalyticsDashboard />
    </>
  );
}
