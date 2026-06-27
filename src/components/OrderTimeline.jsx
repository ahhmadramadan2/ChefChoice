const STAGES = [
  { key: "pending",     label: "Received" },
  { key: "confirmed",   label: "Confirmed" },
  { key: "preparing",   label: "Preparing" },
  { key: "ready",       label: "Ready" },
  { key: "on_the_way",  label: "On the way" },
  { key: "delivered",   label: "Delivered" },
];

function OrderTimeline({ status = "pending" }) {
  const currentIdx = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="timeline">
      {STAGES.map((s, i) => {
        const reached = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={s.key} className="timeline-step">
            <div
              className="timeline-dot"
              style={{
                background: reached ? "#ef4444" : "#e5e7eb",
                transform: isCurrent ? "scale(1.25)" : "scale(1)",
                transition: "all .25s ease",
              }}
            />
            <div
              className="timeline-label"
              style={{
                color: reached ? "#ef4444" : "#9ca3af",
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderTimeline;