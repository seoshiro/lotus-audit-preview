import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Focused adaptation of React Bits SplitText (David Haz, 2026), fetched from
// https://reactbits.dev/r/SplitText-TS-CSS.json on 2026-11-04.
// Keeps its font-ready splitting, word entrance and reversible cleanup.
// Omits looping, letter hover springs and a separate requestAnimationFrame loop.
// License: public/licenses/react-bits.txt (MIT + Commons Clause).
gsap.registerPlugin(SplitText);

export function RevealText({ text, reduced, tag: Tag = 'h1', className = '', id }: {
  text: string;
  reduced: boolean;
  tag?: 'h1' | 'h2';
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    let active = true;
    let split: SplitText | undefined;
    let context: gsap.Context | undefined;
    void document.fonts.ready.then(() => {
      if (!active || !ref.current || reduced) return;
      context = gsap.context(() => {
        split = SplitText.create(ref.current!, {
          type: 'words,lines', autoSplit: true, mask: 'words',
          onSplit: self => gsap.fromTo(self.words,
            { yPercent: 105, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.62, stagger: 0.045, ease: 'power3.out', clearProps: 'transform,opacity' }),
        });
      }, ref.current);
    });
    return () => { active = false; context?.revert(); split?.revert(); };
  }, [text, reduced]);
  return <Tag ref={ref} id={id} className={className}>{text}</Tag>;
}
