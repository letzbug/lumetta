import type { CSSProperties } from 'react';
import type { Story } from '../types/story';

interface Props {
  story: Pick<Story, 'id' | 'title' | 'cover'>;
  showTitle?: boolean;
  size?: 'small' | 'large';
  className?: string;
  /** names the element for cover morphing between pages (View Transitions) */
  morph?: boolean;
}

/** A story rendered as a book cover: illustration, spine shadow and title typography. */
export function StoryCover({ story, showTitle = true, size = 'small', className, morph }: Props) {
  const style = {
    '--cover-deep': story.cover.palette.deep,
    '--cover-glow': story.cover.palette.glow,
    viewTransitionName: morph ? `cover-${story.id.replace(/[^a-z0-9]/gi, '')}` : undefined,
  } as CSSProperties;
  return (
    <figure className={`cover cover--${size} ${className ?? ''}`} style={style}>
      <img src={story.cover.src} alt="" draggable={false} />
      {showTitle && (
        <figcaption className="cover__title">
          <span>{story.title}</span>
        </figcaption>
      )}
    </figure>
  );
}
