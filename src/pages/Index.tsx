import Navbar from "./_components/navbar.tsx";
import Hero from "./_components/hero.tsx";
import Stats from "./_components/stats.tsx";
import Story from "./_components/story.tsx";
import Highlights from "./_components/highlights.tsx";
import ReviewsPreview from "./_components/reviews-preview.tsx";
import Locations from "./_components/locations.tsx";
import Footer from "./_components/footer.tsx";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Story />
      <Highlights />
      <ReviewsPreview />
      <Locations />
      <Footer />
    </div>
  );
}
