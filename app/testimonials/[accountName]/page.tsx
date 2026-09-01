import { redirect } from "next/navigation";

const LegacyTestimonialPage = async ({
  params,
}: PageProps<"/testimonials/[accountName]">) => {
  const { accountName } = await params;
  redirect(`/bio/${accountName}`);
};

export default LegacyTestimonialPage;
