import Dashboard from "../components/Dashboard";
import { loadServerListings } from "../lib/server-listings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const listings = await loadServerListings();

  return <Dashboard initialListings={listings} />;
}
