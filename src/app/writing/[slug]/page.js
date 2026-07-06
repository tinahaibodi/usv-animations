import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FlywheelInline } from "@/components/flywheel/flywheel-scene";
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
          <Image
            src="/assets/article-water.png"
            alt="Ocean edge concept visual"
            width={840}
            height={560}
            priority
          />
          {post.mediaNotes?.first ? (
            <figcaption className="usv-media-caption">{post.mediaNotes.first}</figcaption>
          ) : null}
        </figure>

        <section className="usv-article-section usv-article-flow">
          {post.body.map((paragraph, index) => (
            <div key={index}>
              {index === 8 ? (
                <figure className="usv-article-media">
                  <FlywheelInline />
                  {post.mediaNotes?.second ? (
                    <figcaption className="usv-media-caption">{post.mediaNotes.second}</figcaption>
                  ) : null}
                </figure>
              ) : null}
              <p>{paragraph}</p>
            </div>
          ))}
        </section>

        <figure className="usv-article-media usv-article-flow">
          <Image
            src="/assets/article-market-map.png"
            alt="Physical world stack market map"
            width={857}
            height={593}
          />
          {post.mediaNotes?.third ? (
            <figcaption className="usv-media-caption">{post.mediaNotes.third}</figcaption>
          ) : null}
        </figure>
      </article>
    </UsvPageShell>
  );
}
