import { useLayoutEffect, type RefObject } from 'react';

// Text enlargement can outgrow a composed, fixed-height scene. Keep the copy
// readable and scrollable while the persistent semantic project index stays put.
export function useIntroReflow(host: RefObject<HTMLDivElement | null>, locale: string) {
  useLayoutEffect(() => {
    const stage = host.current?.parentElement;
    const intro = stage?.querySelector<HTMLElement>('.scene-introduction');
    if (!stage || !intro) return;
    const measure = () => {
      const children = [...intro.children] as HTMLElement[];
      const padding = parseFloat(getComputedStyle(intro).paddingTop);
      const height = Math.max(...children.map(child => child.offsetTop + child.offsetHeight + parseFloat(getComputedStyle(child).marginBottom))) - padding;
      const footer = stage.querySelector<HTMLElement>('.scene-bottom');
      stage.style.setProperty('--intro-room', `${Math.max(140, (footer?.offsetTop ?? innerHeight - 140) - 120)}px`);
      stage.dataset.textReflow = String(height > innerHeight * (innerWidth <= 700 ? .4 : .52));
    };
    const observer = new ResizeObserver(measure);
    [...intro.children].forEach(child => observer.observe(child));
    window.addEventListener('resize', measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [host, locale]);
}
