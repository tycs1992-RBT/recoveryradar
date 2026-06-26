import { SeoPageFactory } from "@/components/seo/SeoPageFactory";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SeoPageFactoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Publish pages"
        title="SEO Page Factory"
        description="Generate, review, approve and publish high-intent ABA software landing pages. Published pages go live at /topics/[slug], join the sitemap, and route visitors to the calculator, quiz and Provider Portal."
      />
      <SeoPageFactory />
    </>
  );
}
