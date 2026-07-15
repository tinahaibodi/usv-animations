import Link from "next/link";

import UsvPageShell from "@/components/site/usv-page-shell";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog | USV",
  description: "USV writing and research posts.",
};

export default function WritingIndexPage() {
  const posts = getAllPosts();

  return (
    <UsvPageShell>
      <section className="usv-band usv-blog-hero">
        <h1 className="usv-blog-title">Blog</h1>
      </section>
      <div className="usv-band">
        <hr className="usv-rule" />
      </div>

      <section className="usv-band usv-post-list">
        {posts.map((post) => (
          <article key={post.slug} className="usv-post-card">
            <p className="usv-post-date">{post.publishedAt}</p>
            <h2>
              <Link href={`/writing/${post.slug}`}>{post.listTitle ?? post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </UsvPageShell>
  );
}
