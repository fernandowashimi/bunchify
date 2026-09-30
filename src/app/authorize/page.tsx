import { AuthorizeScreen } from "@/components/authorize-screen";

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AuthorizeScreen error={error} />;
}
