import Starter from "@/components/Starter";
import MockExperience from "@/components/mock/MockExperience";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return Object.hasOwn(await searchParams, "mock")
    ? { title: "maj$q · Montréal after hours", description: "Less planning. More living. Explore your next evening in Montréal." }
    : {};
}

export default async function Home({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return Object.hasOwn(params, "mock") ? <MockExperience /> : <Starter />;
}
