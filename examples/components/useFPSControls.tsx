import { useThree } from "@react-three/fiber";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

export enum WalkDirection {
  RIGHT,
  LEFT,
  FORWRD,
  BACKWARD,
}

export function useFPSControls(
  lockedRef: MutableRefObject<boolean>,
  onJump: () => void,
  onStartWalk: (direction: WalkDirection) => void,
  onEndWalk: (direction: WalkDirection) => void,
  onRotate: (y: number, x: number) => void,
  mouseSpeed: number
) {
  useKeyboard(
    lockedRef,
    useMemo(
      () => ({
        KeyW: (down) =>
          down
            ? onStartWalk(WalkDirection.FORWRD)
            : onEndWalk(WalkDirection.FORWRD),
        KeyS: (down) =>
          down
            ? onStartWalk(WalkDirection.BACKWARD)
            : onEndWalk(WalkDirection.BACKWARD),
        KeyA: (down) =>
          down
            ? onStartWalk(WalkDirection.LEFT)
            : onEndWalk(WalkDirection.LEFT),
        KeyD: (down) =>
          down
            ? onStartWalk(WalkDirection.RIGHT)
            : onEndWalk(WalkDirection.RIGHT),
        Space: (down) => {
          if (down) {
            onJump();
          }
        },
      }),
      [onJump, onStartWalk, onEndWalk]
    )
  );
  useLockedMouse(
    lockedRef,
    useCallback(
      (x: number, y: number) => onRotate(-x * mouseSpeed, -y * mouseSpeed),
      []
    )
  );
}

function useKeyboard(
  lockedRef: MutableRefObject<boolean>,
  map: { [code in string]: (down: boolean) => void }
) {
  useEffect(() => {
    const listener = (down: boolean, e: KeyboardEvent) => {
      if (lockedRef.current && e.code in map && !e.repeat) {
        map[e.code](down);
      }
    };

    const downListener = listener.bind(null, true);
    const upListener = listener.bind(null, false);
    window.addEventListener("keydown", downListener);
    window.addEventListener("keyup", upListener);
    return () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
  }, [map]);
}

function useLockedMouse(
  lockedRef: MutableRefObject<boolean>,
  onMouseMove: (x: number, y: number) => void
) {
  useEffect(() => {
    const mouseMoveListener = (e: MouseEvent) => {
      if (lockedRef.current) {
        const x = e.movementX / window.innerWidth;
        const y = e.movementY / window.innerHeight;
        onMouseMove(x, y);
      }
    };
    window.addEventListener("mousemove", mouseMoveListener);
    return () => window.removeEventListener("mousemove", mouseMoveListener);
  }, [onMouseMove]);
}

export function useLockedRef(
  onLock: (() => void) | undefined,
  onUnlock: (() => void) | undefined
) {
  const canvas = useThree((s) => s.gl.domElement);
  const lockedRef = useRef(document.pointerLockElement === canvas);
  useEffect(() => {
    const pointerLockListener = () => {
      const locked = document.pointerLockElement === canvas;
      lockedRef.current = locked;
      if (locked) {
        onLock && onLock();
      } else {
        onUnlock && onUnlock();
      }
    };
    document.addEventListener("pointerlockchange", pointerLockListener);
    return () =>
      document.removeEventListener("pointerlockchange", pointerLockListener);
  }, [onLock, onUnlock]);
  return lockedRef;
}
