import { revalidatePath } from "next/cache";

export const revalidateCreatorPaths = (slug: string) => {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bio");
  revalidatePath("/dashboard/offers");
  revalidatePath("/dashboard/analytics");
  revalidatePath(`/bio/${slug}`);
};
