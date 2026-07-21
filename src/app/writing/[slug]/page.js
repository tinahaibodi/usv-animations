import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleImage from "@/components/article/article-image";
import {
  ArticleFooterMedia,
  ArticleHeaderMedia,
  ArticleInlineMedia,
} from "@/components/article/article-media";
import ObliteratePlaybook from "@/components/obliterate/obliterate-playbook";
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

function ArticleBody({ post }) {
  if (post.blocks) {
    return (
      <section className="usv-article-section usv-article-flow">
        {post.blocks.map((block, index) => {
          if (block.type === "heading") {
            return <h2 key={index}>{block.text}</h2>;
          }

          if (block.type === "obliterate-playbook") {
            return (
              <figure key={index} className="usv-article-media">
                <ObliteratePlaybook alt={block.alt} />
              </figure>
            );
          }

          if (block.type === "image") {
            const mediaClassName = block.wide
              ? "usv-article-media usv-article-media--wide"
              : "usv-article-media";
            return (
              <figure key={index} className={mediaClassName}>
                <ArticleImage
                  src={block.src}
                  alt={block.alt}
                  width={block.width}
                  height={block.height}
                />
              </figure>
            );
          }

          return <p key={index}>{block.text}</p>;
        })}
      </section>
    );
  }

  const inlineMedia = post.media?.inline ?? [];

  return (
    <section className="usv-article-section usv-article-flow">
      {post.body.map((paragraph, index) => (
        <div key={index}>
          {inlineMedia.map((media) =>
            media.afterParagraph === index ? (
              <figure key={`${media.type}-${index}`} className="usv-article-media">
                <ArticleInlineMedia media={media} />
              </figure>
            ) : null,
          )}
          <p>{paragraph}</p>
        </div>
      ))}
    </section>
  );
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headerMedia = post.media?.header;
  const footerMedia = post.media?.footer;
  const footerClassName =
    footerMedia?.type === "market-map"
      ? "usv-article-media usv-article-media--market-map usv-article-flow"
      : "usv-article-media usv-article-flow";

  return (
    <UsvPageShell>
      <article className="usv-article usv-band">
        <header className="usv-article-header usv-article-flow">
          <p className="usv-post-date">{post.publishedAt}</p>
          <h1>{post.title}</h1>
          {post.subtitle ? <p className="usv-article-subtitle">{post.subtitle}</p> : null}
          <Link href="/writing" className="usv-back-link">
            Back to Blog
          </Link>
        </header>

        {headerMedia ? (
          <figure className="usv-article-media usv-article-media--lead usv-article-flow">
            <ArticleHeaderMedia media={headerMedia} />
          </figure>
        ) : null}

        <ArticleBody post={post} />

        {footerMedia ? (
          <figure className={footerClassName}>
            <ArticleFooterMedia media={footerMedia} />
          </figure>
        ) : null}
      </article>
    </UsvPageShell>
  );
}
