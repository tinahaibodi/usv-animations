import styles from "./physical-world-stack-map.module.css";

const STACK_ROWS = [
  {
    title: "Applications",
    subtitle: "Domain-specific solutions that create impact",
    color: "#2f8f52",
    borderColor: "#5aa778",
    subtitleColor: "#b8d8c4",
    chipColor: "#eaf3ec",
    items: ["Healthcare", "Logistics", "Manufacturing", "Oceans", "Robotics"],
  },
  {
    title: "Automation & Orchestration",
    subtitle: "Software that manages fleets and workflows",
    color: "#2f8f52",
    borderColor: "#5aa778",
    subtitleColor: "#b8d8c4",
    chipColor: "#eaf3ec",
    items: ["Fleet Management", "Digital Twins", "Device OS", "Edge AI", "Data Infrastructure"],
  },
  {
    title: "Intelligence",
    subtitle: "Models and systems that understand and reason",
    color: "#2f8f52",
    borderColor: "#5aa778",
    subtitleColor: "#b8d8c4",
    chipColor: "#eaf3ec",
    items: ["Vision Models", "Robotics Models", "World Models", "Learning Systems"],
  },
  {
    title: "Physical Interface",
    subtitle: "Hardware that senses, acts, and connects",
    color: "#2f8f52",
    borderColor: "#5aa778",
    subtitleColor: "#b8d8c4",
    chipColor: "#eaf3ec",
    items: ["Sensors", "Cameras", "Robots", "Drones", "Edge Devices", "Embedded Compute"],
  },
  {
    title: "Infrastructure",
    subtitle: "The foundational systems that enable scale",
    color: "#2f8f52",
    borderColor: "#5aa778",
    subtitleColor: "#b8d8c4",
    chipColor: "#eaf3ec",
    items: ["Silicon", "Connectivity", "Compute", "Energy", "Batteries", "Data Centers"],
  },
];

export default function PhysicalWorldStackMap() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className={styles.frame}>
        <div className={styles.map}>
          <div className={styles.head}>
            <div className={styles.title}>The Physical World Stack</div>
            <div className={styles.subtitle}>
              A market map of the layers powering intelligent physical systems - from foundational
              infrastructure to domain applications.
            </div>
          </div>

          <div className={styles.rule} />

          <div className={styles.rows}>
            {STACK_ROWS.map((row) => (
              <section
                className={styles.row}
                key={row.title}
                style={{ borderColor: row.borderColor }}
              >
                <div className={styles.label} style={{ backgroundColor: row.color }}>
                  <div className={styles.labelTitle}>{row.title}</div>
                  <div
                    className={styles.labelSubtitle}
                    style={{ color: row.subtitleColor }}
                  >
                    {row.subtitle}
                  </div>
                </div>

                <div className={styles.chips}>
                  {row.items.map((item, index) => (
                    <div className={styles.chipWrap} key={item}>
                      {index > 0 ? <div className={styles.divider} /> : null}
                      <div className={styles.chip} style={{ color: row.chipColor }}>
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className={styles.cornerBrand}>USV</div>
      </div>
    </>
  );
}
