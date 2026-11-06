import Link from "next/link";
import { T } from "@/components/editable-text";

/** The last invitation on the home page, before the footer. */
export function HomeFinalInvitation() {
  return (
    <section className="paper relative overflow-x-clip">
      <div className="mx-auto max-w-[640px] px-6 pb-20 pt-6 text-center lg:pb-[120px]">
        <T as="h2" id="home.final.heading" data-reveal="title" className="display text-[clamp(28px,8vw,36px)] normal-case leading-[1.1] text-espresso lg:text-[52px]" />
        <T as="p" id="home.final.text" data-reveal="up" className="mx-auto mt-6 max-w-[480px] text-[16px] leading-[1.8] text-walnut lg:text-[17px]" />
        <Link href="/contact" className="btn mt-9" data-reveal="up">
          <T id="home.final.button" />
        </Link>
      </div>
    </section>
  );
}
