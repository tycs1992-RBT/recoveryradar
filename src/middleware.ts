import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login"
  }
});

export const config = {
  matcher: [
    "/provider-workspace/:path*",
    "/dashboard/:path*",
    "/recovery-radar/:path*",
    "/seo-page-factory/:path*",
    "/workflow-center/:path*",
    "/lead-machine/:path*",
    "/emr-shopping-radar/:path*",
    "/linkedin-prospector/:path*",
    "/executive-prospector/:path*",
    "/intelligence-bank/:path*",
    "/lead-finder/:path*",
    "/keyword-radar/:path*",
    "/seo-command-center/:path*",
    "/bot-builder/:path*",
    "/recovery-advisor-chatbot/:path*",
    "/crm/:path*",
    "/crm-import/:path*",
    "/tasks/:path*",
    "/outreach/:path*",
    "/outreach-approval/:path*",
    "/outreach-templates/:path*",
    "/content-generator/:path*",
    "/campaign-planner/:path*",
    "/analytics/:path*",
    "/audit-suggestions/:path*",
    "/settings/:path*",
    "/new-clinic-watch/:path*",
    "/visitor-intel/:path*",
    "/npi-radar/:path*"
  ]
};
