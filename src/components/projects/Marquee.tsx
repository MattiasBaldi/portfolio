import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import Draggable from "gsap/Draggable";
import InertiaPlugin from "gsap/InertiaPlugin";
import { useControls } from "leva";
import { InfoIcon } from '@phosphor-icons/react'
import type { MediaItem } from "../../App.js";
gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

type MarqueeLoopProps = {
  media: MediaItem[];
  onMediaClick?: (index: number) => void;
};

export function Marquee({ media, onMediaClick }: MarqueeLoopProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isPaused, setIsPaused] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const controls = useControls(
    "Marquee",
    {
      mobileHeight: { value: 250, min: 0, max: 500, label: "Mobile Height" },
      desktopHeight: { value: 500, min: 0, max: 1000, label: "Desktop Height" },
      speed: { value: 0.5, min: 0, max: 5, step: 0.1, label: "Speed" },
      resistance: { value: 10, min: 1, max: 50, step: 1, label: "Drag Resistance" },
      minVelocity: { value: 50, min: 0, max: 200, step: 10, label: "Min Velocity" },
      repeat: { value: 5, min: 0, max: 20, step: 1, label: "Repeat" },
      gap: { value: 0, min: -20, max: 20, step: 1, label: "Gap" },
      draggable: { value: true, label: "Draggable" },
      dragSnap: { value: true, label: "Drag Snap" },
    },
    { collapsed: true }
  );

  const wrapper = useRef(null);
  const images = useRef<HTMLDivElement[]>([]);
  const [ready, setReady] = useState(false);

  // Wait for all media (including videos) to load metadata
  useEffect(() => {
    if (images.current.length !== media.length) {
      setReady(false);
      return;
    }

    const checkReady = async () => {
      // Find all video elements and wait for their metadata to load
      const videos = images.current.flatMap(div => Array.from(div.querySelectorAll('video')));

      if (videos.length > 0) {
        await Promise.all(
          videos.map(video =>
            new Promise<void>(resolve => {
              if (video.readyState >= 1) { // HAVE_METADATA or higher
                resolve();
              } else {
                // Add timeout to prevent hanging on mobile (2s)
                const timeout = setTimeout(() => resolve(), 2000);
                video.addEventListener('loadedmetadata', () => {
                  clearTimeout(timeout);
                  resolve();
                }, { once: true });
                // Force load metadata
                video.load();
              }
            })
          )
        );
      }

      // Find all image elements (including GIFs) and wait for them to load
      const imgs = images.current.flatMap(div => Array.from(div.querySelectorAll('img')));

      if (imgs.length > 0) {
        await Promise.all(
          imgs.map(img =>
            new Promise<void>(resolve => {
              if (img.complete && img.naturalWidth > 0) {
                resolve();
              } else {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
              }
            })
          )
        );
      }

      // Ensure container divs match their content width exactly (rounded to whole pixels)
      await new Promise(resolve => requestAnimationFrame(resolve));
      images.current.forEach(div => {
        const mediaElement = div.querySelector('img, video') as HTMLElement;
        if (mediaElement) {
          const width = Math.round(mediaElement.getBoundingClientRect().width);
          div.style.width = `${width}px`;
        }
      });

      // Small delay to ensure dimensions are applied
      setTimeout(() => setReady(true), 100);
    };

    checkReady();
  }, [media]);

  const togglePause = () => {
    if (timelineRef.current) {
      if (isPaused) {
        timelineRef.current.play();
      } else {
        timelineRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  // Create timeline once when ready, recreate when draggable, gap, or mobile state changes
  // Gap and isMobile affect layout calculations, so timeline needs to be recreated
  // Other controls (repeat, resistance, etc.) are set at creation time
  useGSAP(
    () => {
      if (!ready || !images.current.length || !images.current[0]) return;

      const tl = horizontalLoop(images.current, {
        repeat: controls.repeat,
        draggable: controls.draggable,
        dragSnap: controls.dragSnap,
        inertia: {
          resistance: controls.resistance,
          minVelocity: controls.minVelocity,
          allowX: true,
          allowY: false,
        },
        paused: false,
        speed: controls.speed,
        center: true,
        paddingRight: 0,
        snap: false, // Disable snap to prevent gaps at loop point
      });

      if (tl) timelineRef.current = tl;
    },
    { scope: wrapper, dependencies: [ready, controls.draggable, controls.gap, isMobile] }
  );

  // Update speed dynamically without recreating timeline (smooth animation)
  useEffect(() => {
    if (timelineRef.current && controls.speed) {
      timelineRef.current.timeScale(controls.speed);
    }
  }, [controls.speed]);

  return (
    <div className="relative">
      {/* Marquee */}
      <div
        ref={wrapper}
        onClick={(e) => e.stopPropagation()}
        className="wrapper flex overflow-hidden"
        style={{
          gap: `${controls.gap}px`,
          margin: 0,
          padding: 0,
          fontSize: 0,
          lineHeight: 0,
          WebkitFontSmoothing: 'antialiased',
          transform: 'translateZ(0)', // Force GPU acceleration for smoother rendering
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
        {media.map((mediaItem, i) => {
          const isVideo = /\.(webm|mp4|mov|m4v|ogg)$/i.test(mediaItem.src);
          const mediaHeight = isMobile ? controls.mobileHeight : controls.desktopHeight;
          const mediaStyle = {
            height: mediaHeight,
            width: 'auto',
            margin: 0,
            padding: 0,
            display: 'block',
            verticalAlign: 'top',
            imageRendering: 'crisp-edges' as const,
            backfaceVisibility: 'hidden' as const,
          };

          return (
            <div
              key={i}
              ref={(el) => {
                if (el) images.current[i] = el;
              }}
              className="relative flex-shrink-0 group"
              style={{
                height: mediaHeight,
                width: 'auto',
                margin: 0,
                padding: 0,
                backfaceVisibility: 'hidden',
                willChange: 'transform',
              }}
            >
              {isVideo ? (
                <>
                  <video
                    style={mediaStyle}
                    className="h-full w-auto block"
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={mediaItem.title || mediaItem.description || 'Project video'}
                  >
                    <source src={mediaItem.src} type="video/webm" />
                  </video>

                </>
              ) : (
                <img
                  src={mediaItem.src}
                  alt={mediaItem.title || mediaItem.description || 'Project media'}
                  style={mediaStyle}
                  className="h-full w-auto block"
                  loading="lazy"
                />
              )}

              {/* Lightbox button - shows on hover */}
  
              
    <InfoIcon
  onClick={(e) => { e.stopPropagation(); onMediaClick?.(i); }}
  size={32}
  className="
    absolute top-2 right-2 p-1 rounded
    opacity-100 lg:opacity-0 lg:group-hover:opacity-100
    transition-opacity cursor-pointer
    text-white mix-blend-difference
    hidden lg:flex
  "
/>


            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 left-3 flex gap-1 items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePause();
          }}
          className="p-1.5 text-grey-500 hover:text-grey-900 transition-colors cursor-pointer"
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 1l8 5-8 5V1z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="3" height="10" />
              <rect x="8" y="1" width="3" height="10" />
            </svg>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMediaClick?.(0);
          }}
          className="p-1.5 text-grey-500 hover:text-grey-900 transition-colors cursor-pointer"
          aria-label="View gallery"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="4" height="4" />
            <rect x="7" y="1" width="4" height="4" />
            <rect x="1" y="7" width="4" height="4" />
            <rect x="7" y="7" width="4" height="4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/*
This helper function makes a group of elements animate along the x-axis in a seamless, responsive loop.

https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/

Features:
- Uses xPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
- When each item animates to the left or right enough, it will loop back to the other side
- Optionally pass in a config object with values like "speed" (default: 1, which travels at roughly 100 pixels per second), paused (boolean),  repeat, reversed, and paddingRight.
- The returned timeline will have the following methods added to it:
- next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
- previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
- toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
- current() - returns the current index (if an animation is in-progress, it reflects the final index)
- times - an Array of the times on the timeline where each element hits the "starting" spot. There's also a label added accordingly, so "label1" is when the 2nd element reaches the start.
*/
function horizontalLoop(items: HTMLElement[], config: Record<string, unknown>): gsap.core.Timeline | undefined {
  let timeline: gsap.core.Timeline | undefined;
  items = gsap.utils.toArray(items) as HTMLElement[];
  config = config || {};
  gsap.context(() => {
    // use a context so that if this is called from within another context or a gsap.matchMedia(), we can perform proper cleanup like the "resize" event handler on the window
    let onChange = config.onChange as ((item: HTMLElement, index: number) => void) | undefined,
      lastIndex = 0,
      tl = gsap.timeline({
        repeat: config.repeat as number | undefined,
        onUpdate:
          onChange &&
          function (this: gsap.core.Timeline) {
            const i = (this.closestIndex as ((setCurrent?: boolean) => number) | undefined)?.(false);
            if (i !== undefined && lastIndex !== i) {
              lastIndex = i;
              onChange?.(items[i], i);
            }
          },
        paused: config.paused as boolean | undefined,
        defaults: { ease: "none" },
        onReverseComplete: () =>
          tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times: number[] = [],
      widths: number[] = [],
      spaceBefore: number[] = [],
      xPercents: number[] = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center as boolean | unknown[] | undefined,
      pixelsPerSecond = ((config.speed as number) || 1) * 100,
      snap =
        config.snap === false ? (v: number) => v : gsap.utils.snap((config.snap as number) || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
      timeOffset = 0,
      container =
        center === true
          ? items[0].parentNode as HTMLElement
          : (gsap.utils.toArray(center as unknown)[0] as HTMLElement | undefined) || (items[0].parentNode as HTMLElement),
      totalWidth: number = 0,
      getTotalWidth = (): number =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth *
          gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0),
      populateWidths = (): void => {
        let b1 = container.getBoundingClientRect(),
          b2: DOMRect;
        items.forEach((el: HTMLElement, i: number) => {
          widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
          xPercents[i] = snap(
            (parseFloat(gsap.getProperty(el, "x", "px") as string) / widths[i]) * 100 +
              (gsap.getProperty(el, "xPercent") as number)
          );
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, {
          // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
          xPercent: (i) => xPercents[i],
        });
        totalWidth = getTotalWidth();
      },
      timeWrap: ((value: number) => number) = (v: number) => v,
      populateOffsets = (): void => {
        timeOffset = center
          ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
          : 0;
        center &&
          times.forEach((_t: number, i: number) => {
            times[i] = timeWrap(
              (tl.labels["label" + i] as number) +
                (tl.duration() * widths[i]) / 2 / totalWidth -
                timeOffset
            );
          });
      },
      getClosest = (values: number[], value: number, wrap: number): number => {
        let i = values.length,
          closest = 1e10,
          index = 0,
          d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) {
            d = wrap - d;
          }
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = (): void => {
        let i: number, item: HTMLElement, curX: number, distanceToStart: number, distanceToLoop: number;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop =
            distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");

          // Capture width in closure for modifiers
          const itemWidth = widths[i];

          tl.to(
            item,
            {
              xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
              duration: distanceToLoop / pixelsPerSecond,
              modifiers: {
                xPercent: (xPercent) => {
                  const xPixels = (parseFloat(xPercent) / 100) * itemWidth;
                  return (Math.round(xPixels) / itemWidth) * 100;
                }
              }
            },
            0
          )
            .fromTo(
              item,
              {
                xPercent: snap(
                  ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
                ),
              },
              {
                xPercent: xPercents[i],
                duration:
                  (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false,
                modifiers: {
                  xPercent: (xPercent) => {
                    const xPixels = (parseFloat(xPercent) / 100) * itemWidth;
                    return (Math.round(xPixels) / itemWidth) * 100;
                  }
                }
              },
              distanceToLoop / pixelsPerSecond
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep: boolean): void => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable && tl.paused()
          ? tl.time(times[curIndex], true)
          : tl.progress(progress, true);
      },
      onResize = (): void => refresh(true),
      proxy: HTMLDivElement | undefined = undefined;
    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", onResize);
    function toIndex(index: number, vars?: Record<string, unknown>): gsap.core.Tween | gsap.core.Timeline | undefined {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length); // always go in the shortest direction
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        // if we're wrapping the timeline's playhead, make the proper adjustments
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars);
    }
    tl.toIndex = (index: number, vars?: Record<string, unknown>) => toIndex(index, vars);
    tl.closestIndex = (setCurrent?: boolean): number => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = (): number => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars?: Record<string, unknown>) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars?: Record<string, unknown>) => toIndex(tl.current() - 1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }

    // Draggable
    if (config.draggable && typeof Draggable === "function") {
      proxy = document.createElement("div");
      let wrap = gsap.utils.wrap(0, 1) as (value: number) => number,
        ratio: number = 0,
        startProgress: number = 0,
        draggable: Draggable = undefined as unknown as Draggable,
        dragSnap: unknown = undefined,
        lastSnap: number = 0,
        initChangeX: number = 0,
        wasPlaying: boolean = false,
        align = (): void => {
          if (draggable) {
            tl.progress(
              wrap(startProgress + (draggable.startX - draggable.x) * ratio)
            );
          }
        },
        syncIndex = (): void => tl.closestIndex(true);
      typeof InertiaPlugin === "undefined" &&
        console.warn(
          "InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club"
        );

      draggable = (Draggable.create(proxy, {
        trigger: items[0].parentNode as HTMLElement,
        type: "x",
        onPressInit(this: Draggable) {
          const x = this.x;
          gsap.killTweensOf(tl);

          /*
              Don't pause on click
          */

          // wasPlaying = !tl.paused();
          // tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        snap: (value: number): number => {
          //note: if the user presses and releases in the middle of a throw, due to the sudden correction of proxy.x in the onPressInit(), the velocity could be very large, throwing off the snap. So sense that condition and adjust for it. We also need to set overshootTolerance to 0 to prevent the inertia from causing it to shoot past and come back
          if (Math.abs(startProgress / -ratio - draggable.x) < 10) {
            return lastSnap + initChangeX;
          }
          let time = -(value * ratio) * tl.duration(),
            wrappedTime = timeWrap(time),
            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
            dif = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 &&
            (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease(this: Draggable) {
          syncIndex();
          this.isThrowing && (indexIsDirty = true);
        },
        onThrowComplete: (): void => {
          syncIndex();
          wasPlaying && tl.play();
        },
      }) as Draggable[])[0];
      tl.draggable = draggable;
    }

    // others
    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    timeline = tl;
    return () => window.removeEventListener("resize", onResize); // cleanup
  });
  return timeline;
}
