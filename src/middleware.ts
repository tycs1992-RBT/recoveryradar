import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login"
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lead-machine/:path*",
    "/linkedin-prospector/:path*",
    "/executive-prospector/:path*",
    "/intelligence-bank/:path*",
    "/lead-finder/:path*",
    "/keyword-radar/:path*",
    "/seo-command-center/:path*",
    "/bot-builder/:path*",
    "/recovery-advisor-chatbot/:path*",
    "/crm/:path*",
    "/tasks/:path*",
    "/outreach/:path*",
    "/outreach-templates/:path*",
    "/content-generator/:path*",
    "/campaign-planner/:path*",
    "/analytics/:path*",
    "/audit-suggestions/:path*",
    "/settings/:path*"
  ]
};
