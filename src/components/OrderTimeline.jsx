
function OrderTimeline({ stage }) {
  const stages = ["Cart", "Confirmed", "Being Prepared", "Ready"];

  return (
    <div className="timeline">
      {stages.map((s, index) => (
        <div
          key={s}
          className={
            "timeline-step " + (index <= stage ? "timeline-step-active" : "")
          }
        >
          <div className="timeline-circle" />
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

export default OrderTimeline;
