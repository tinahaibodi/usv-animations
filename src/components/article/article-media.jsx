import ArticleImage from "@/components/article/article-image";
import { EdgeFlowInline } from "@/components/flywheel/flywheel-scene";
import FlywheelStackRadial from "@/components/flywheel/flywheel-stack-radial";
import PhysicalWorldStackMap from "@/components/market-map/physical-world-stack-map";
import { ObliterateShatterInline } from "@/components/obliterate/obliterate-shatter";

export function ArticleHeaderMedia({ media }) {
  if (!media) return null;

  if (media.type === "edge-flow") {
    return <EdgeFlowInline />;
  }

  if (media.type === "obliterate-shatter") {
    return <ObliterateShatterInline />;
  }

  if (media.type === "image") {
    return (
      <ArticleImage
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
      />
    );
  }

  return null;
}

export function ArticleInlineMedia({ media }) {
  if (!media) return null;

  if (media.type === "flywheel-stack") {
    return <FlywheelStackRadial />;
  }

  return null;
}

export function ArticleFooterMedia({ media }) {
  if (!media) return null;

  if (media.type === "market-map") {
    return <PhysicalWorldStackMap />;
  }

  if (media.type === "image") {
    return (
      <ArticleImage
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
      />
    );
  }

  return null;
}
