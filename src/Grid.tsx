import { useEffect, useRef, useState, type ReactNode } from "react";

type Props<T> = {
  title: string;
  items: T[];
  render: (visible: T[]) => ReactNode;

  onClose: () => void;
};

const page = 40;

// Grid shows a whole list, 40 at a time: more come when the user scrolls near the end.
// It does not know what the items are: render draws the ones to show.

function Grid<T>({ title, items, render, onClose }: Props<T>) {
  const [shown, setShown] = useState(page);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const end = endRef.current;
    if (!end) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setShown((n) => n + page);
      },
      { rootMargin: "400px" },
    );
    observer.observe(end);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <main>
      <div className="grid-head">
        <button className="grid-back" onClick={onClose}>
          ← Back
        </button>
        <h2 dir="auto">{title}</h2>
        <span className="grid-count">{items.length} movies</span>
      </div>
      <div className="results">{render(items.slice(0, shown))}</div>
      {shown < items.length && <div ref={endRef} />}
    </main>
  );
}

export default Grid;
