import Link from "next/link";
import { notFound } from "next/navigation";

import { EdgeFlowInline } from "@/components/flywheel/flywheel-scene";
import FlywheelStackRadial from "@/components/flywheel/flywheel-stack-radial";
import PhysicalWorldStackMap from "@/components/market-map/physical-world-stack-map";
import UsvPageShell from "@/components/site/usv-page-shell";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found | USV" };
  }

  return {
    title: `${post.title} | USV`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <UsvPageShell>
      <article className="usv-article usv-band">
        <header className="usv-article-header usv-article-flow">
          <p className="usv-post-date">{post.publishedAt}</p>
          <h1>{post.title}</h1>
          <Link href="/writing" className="usv-back-link">
            Back to Blog
          </Link>
        </header>

        <figure className="usv-article-media usv-article-media--lead usv-article-flow">
          <EdgeFlowInline />
        </figure>

        <section className="usv-article-section usv-article-flow">
          {post.body.map((paragraph, index) => (
            <div key={index}>
              {index === 8 ? (
                <figure className="usv-article-media">
                  <FlywheelStackRadial />
                </figure>
              ) : null}
              <p>{paragraph}</p>
            </div>
          ))}
        </section>

        <figure className="usv-article-media usv-article-media--market-map usv-article-flow">
          <PhysicalWorldStackMap />
        </figure>
      </article>
    </UsvPageShell>
  );
}
