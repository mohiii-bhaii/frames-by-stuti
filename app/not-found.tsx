import Link from "next/link";
import { SiteChrome } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="paper flex min-h-[70vh] flex-col items-center justify-center bg-walnut px-6 pb-16 pt-28 text-center text-cream">
        <h1 className="script text-[56px]">this frame is missing</h1>
        <p className="mt-4">The page you were looking for could not be found.</p>
        <Link href="/" className="btn mt-8">
          Back to home
        </Link>
      </section>
    </SiteChrome>
  );
}
