import { useRef, type ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  onSeeAll?: () => void;
};

//Row is one category: its name, then its posters side by side

function Row({ title, onSeeAll, children }: Props) {
  const postersRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const posters = postersRef.current;
    if (!posters) return;
    posters.scrollBy({ left: direction * posters.clientWidth * 0.8 });
  }

  return (
    <section className="row">
      <div className="row-head">
        <h2 dir="auto">{title}</h2>
        {onSeeAll && (
          <button className="see-all" onClick={onSeeAll}>
            See all ›
          </button>
        )}
      </div>

      <div className="row-body">
        <button
          className="row-arrow left"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
          ‹
        </button>
        <div className="row-posters" ref={postersRef}>
          {children}
        </div>
        <button
          className="row-arrow right"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default Row;
