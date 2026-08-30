import { notFound } from "next/navigation";
import { connection } from "next/server";
import { WidgetType } from "@/generated/prisma/client";
import { parseCollectionFormConfiguration } from "@/app/dashboard/forms/new/_lib/collectionForm";
import { prisma } from "@/lib/prisma";
import FeedbackWizard from "../_components/FeedbackWizard";

const PublicCollectionFormPage = async ({
  params,
}: PageProps<"/forms/[publicKey]">) => {
  await connection();
  const { publicKey } = await params;
  const widget = await prisma.widget.findFirst({
    where: { publicKey, type: WidgetType.COLLECTION, isActive: true },
    select: {
      publicKey: true,
      config: true,
      site: {
        select: {
          organization: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!widget) {
    notFound();
  }

  const configuration = parseCollectionFormConfiguration(widget.config);
  if (!configuration) {
    notFound();
  }

  return (
    <FeedbackWizard
      configuration={configuration}
      creatorName={widget.site.organization.name}
      creatorPath={`/testimonials/${widget.site.organization.slug}`}
      publicKey={widget.publicKey}
    />
  );
};

export default PublicCollectionFormPage;
