import styles from "./physical-world-stack-map.module.css";

const CHART_SRC = "/assets/diagram-market.png?v=4";
const CHART_WIDTH = 1040;
const CHART_HEIGHT = 584;

export default function PhysicalWorldStackMap() {
  return (
    <img
      src={CHART_SRC}
      alt="The Physical World Stack market map"
      className={styles.chart}
      width={CHART_WIDTH}
      height={CHART_HEIGHT}
    />
  );
}
