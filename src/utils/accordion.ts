export function getTitleOffset(container: HTMLElement): number | undefined {
  const dateIndex = container.querySelector(".date-index");
  const titleDescription = container.querySelector(".title-description");
  if (!dateIndex || !titleDescription) return undefined;
  const dateRect = dateIndex.getBoundingClientRect();
  const titleRect = titleDescription.getBoundingClientRect();
  return dateRect.left - titleRect.left;
}

// Helper: Calculate mobile title offset to align with date-index
export function getMobileTitleOffset(container: HTMLElement): { x: number; y: number } | undefined {
  const dateIndex = container.querySelector(".date-index");
  const mobileTitle = container.querySelector(".mobile-title");
  if (!dateIndex || !mobileTitle) return undefined;
  const dateRect = dateIndex.getBoundingClientRect();
  const mobileTitleRect = mobileTitle.getBoundingClientRect();
  return {
    x: dateRect.left - mobileTitleRect.left,
    y: -(mobileTitleRect.top - dateRect.top),
  };
}

export function getVisibleHeight(element: Element | null): number | undefined {
  if (!element) return undefined
  if (window.getComputedStyle(element).display === "none") return undefined
  return element.getBoundingClientRect().height
}