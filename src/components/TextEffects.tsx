// components/TextEffects.tsx
import type { CSSProperties } from "react";

/*
 * Letter hover effects (RollText, WaveText): each splits its text into letters that move on
 * their own, hidden from screen readers, which read the whole text from an sr-only copy. They
 * are CSS (styles.css): they play when the element marked `letter-fx` around them is hovered
 * or focused.
 */

function Letters({ text, className }: { text: string; className: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={className}>
        {[...text].map((char, i) => (
          <span key={i} data-char={char} style={{ "--i": i } as CSSProperties}>
            {char}
          </span>
        ))}
      </span>
    </>
  );
}

/** On hover, letter by letter, the text rolls up and away as a copy rolls up into its place. */
export function RollText({ text }: { text: string }) {
  return <Letters text={text} className="letter-roll" />;
}

/** On hover (and when its chip becomes the current one), a wave runs through the letters. */
export function WaveText({ text }: { text: string }) {
  return <Letters text={text} className="letter-wave" />;
}
