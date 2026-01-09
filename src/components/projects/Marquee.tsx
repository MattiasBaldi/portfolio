import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import Draggable from "gsap/Draggable";
import InertiaPlugin from "gsap/InertiaPlugin";
import { useControls } from "leva";
gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

type MarqueeLoopProps = {
  media: string[];
};

export function Marquee({ media }: MarqueeLoopProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
      repeat: { value: 2, min: 0, max: 10, step: 1, label: "Repeat" },
      draggable: { value: true, label: "Draggable" },
      dragSnap: { value: true, label: "Drag Snap" },
    },
    { collapsed: true }
  );

  const wrapper = useRef(null);
  const images = useRef([]);
  const [ready, setReady] = useState(false);

  // Wait for all images to load
  useEffect(() => {
    const checkImages = () => {
      if (images.current.length === media.length && images.current.every(img => img)) {
        setReady(true);
      }
    };
    // Small delay to ensure refs are set
    const timer = setTimeout(checkImages, 100);
    return () => clearTimeout(timer);
  }, [media]);

  useGSAP(
    () => {
      if (!ready || !images.current.length || !images.current[0]) return;
      horizontalLoop(images.current, {
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
      });
    },

    { scope: wrapper, dependencies: [ready, controls.repeat, controls.draggable, controls.dragSnap, controls.resistance, controls.minVelocity, controls.speed] }
  );

  return (
    <div
      ref={wrapper}
      onClick={(e) => e.stopPropagation()}
      className="wrapper flex overflow-hidden"
    >
      {media.map((v, i) => (
        <img
          ref={(el) => {
            if (el) images.current[i] = el;
          }}
          key={i}
          src={v}
          style={{ height: isMobile ? controls.mobileHeight : controls.desktopHeight }}
          className=" object-cover mx-0"
        />
      ))}
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
          tl.to(
            item,
            {
              xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
              duration: distanceToLoop / pixelsPerSecond,
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
