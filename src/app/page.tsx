import Dashboard from "../components/Dashboard";
import { loadServerListings } from "../lib/server-listings";
import { AppProvider } from "../lib/AppContext";

export const dynamic = "force-dynamic";

export default async function Home() {
  const listings = await loadServerListings();

  return (
    <AppProvider>
      <Dashboard initialListings={listings} />
    </AppProvider>
  );
}
