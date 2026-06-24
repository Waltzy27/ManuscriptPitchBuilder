import { Switch, Route, Router, useParams } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import HomePage from "./pages/home";
import ProjectLayout from "./pages/project-layout";
import StoryIdentityPage from "./pages/story-identity";
import CharactersPage from "./pages/characters";
import LocationsPage from "./pages/locations";
import MechanicsPage from "./pages/mechanics";
import AuthorBioPage from "./pages/author-bio";
import SectionWeightsPage from "./pages/section-weights";
import PitchPreviewPage from "./pages/pitch-preview";
import NotFound from "./pages/not-found";

function ProjectRoutes() {
  const params = useParams<{ id: string; page?: string }>();
  const page = params.page || "story-identity";

  const pageMap: Record<string, React.ComponentType> = {
    "story-identity": StoryIdentityPage,
    "characters": CharactersPage,
    "locations": LocationsPage,
    "mechanics": MechanicsPage,
    "author-bio": AuthorBioPage,
    "weights": SectionWeightsPage,
    "pitch-preview": PitchPreviewPage,
  };

  const PageComponent = pageMap[page] || StoryIdentityPage;

  return (
    <ProjectLayout>
      <PageComponent />
    </ProjectLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/project/:id" component={ProjectRoutes} />
          <Route path="/project/:id/:page" component={ProjectRoutes} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
