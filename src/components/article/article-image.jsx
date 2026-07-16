import styles from "./article-image.module.css";

export default function ArticleImage({ src, alt, width, height, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${styles.image}${className ? ` ${className}` : ""}`}
      width={width}
      height={height}
    />
  );
}

export function ArticleVideo({ src, alt, width, height, className }) {
  return (
    <video
      className={`${styles.image}${className ? ` ${className}` : ""}`}
      src={src}
      width={width}
      height={height}
      autoPlay
      muted
      loop
      playsInline
      aria-label={alt}
    />
  );
}
