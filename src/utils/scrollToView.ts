// Helper: Scroll to element using GSAP ScrollToPlugin
function scrollToElement(target: HTMLElement, offsetY = 0) {
  const y = target.getBoundingClientRect().top + window.scrollY + offsetY;

  gsap.to(document.documentElement, {
    scrollTop: y,
    duration: 0.8,
    ease: "power2.out",
  });
}

// Helper: Scroll content into view using native scrollIntoView
function scrollIntoView(container: HTMLElement) {
  container.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "start",
  });
}