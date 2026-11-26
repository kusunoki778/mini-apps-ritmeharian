import type { AqiCategory } from './categories';

export function AqiBadge({ category }: { category: AqiCategory }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 text-[12px] font-medium">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      {category.label}
    </span>
  );
}
