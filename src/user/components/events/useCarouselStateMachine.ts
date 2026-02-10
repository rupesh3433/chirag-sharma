import { useReducer, useEffect, useCallback } from "react";

type DeviceType = "mobile" | "desktop";
type Phase = "IDLE" | "TRANSITION";
type Direction = "NEXT" | "PREV" | null;

interface CarouselState {
  currentIndex: number;
  visualOrder: number[];
  phase: Phase;
  direction: Direction;
  device: DeviceType;
  total: number;
}

type CarouselEvent =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO"; index: number }
  | { type: "ANIMATION_END" }
  | { type: "SET_DEVICE"; device: DeviceType }
  | { type: "RESET"; index: number; total: number }
  | { type: "UPDATE_TOTAL"; total: number }; // NEW: For handling tab changes

function computeVisualOrder(centerIndex: number, total: number): number[] {
  if (total === 0) return [];
  
  if (total === 1) {
    return [0, 0, 0, 0, 0];
  }
  
  const mod = (n: number) => ((n % total) + total) % total;
  
  return [
    mod(centerIndex - 2),
    mod(centerIndex - 1),
    centerIndex,
    mod(centerIndex + 1),
    mod(centerIndex + 2),
  ];
}

function carouselReducer(
  state: CarouselState,
  event: CarouselEvent
): CarouselState {
  switch (event.type) {
    case "NEXT": {
      if (state.phase === "TRANSITION") return state;
      const newIndex = (state.currentIndex + 1) % state.total;
      return {
        ...state,
        currentIndex: newIndex,
        visualOrder: computeVisualOrder(newIndex, state.total),
        phase: "TRANSITION",
        direction: "NEXT",
      };
    }

    case "PREV": {
      if (state.phase === "TRANSITION") return state;
      const newIndex = (state.currentIndex - 1 + state.total) % state.total;
      return {
        ...state,
        currentIndex: newIndex,
        visualOrder: computeVisualOrder(newIndex, state.total),
        phase: "TRANSITION",
        direction: "PREV",
      };
    }

    case "GO_TO": {
      if (state.phase === "TRANSITION") return state;
      if (event.index === state.currentIndex) return state;
      
      // Ensure index is within bounds
      const safeIndex = event.index < state.total ? event.index : 0;
      
      const delta = (safeIndex - state.currentIndex + state.total) % state.total;
      const direction = delta <= state.total / 2 ? "NEXT" : "PREV";
      
      return {
        ...state,
        currentIndex: safeIndex,
        visualOrder: computeVisualOrder(safeIndex, state.total),
        phase: "TRANSITION",
        direction,
      };
    }

    case "ANIMATION_END": {
      return {
        ...state,
        phase: "IDLE",
        direction: null,
      };
    }

    case "SET_DEVICE": {
      return {
        ...state,
        device: event.device,
      };
    }

    case "RESET": {
      if (state.currentIndex === event.index && state.total === event.total) {
        return state;
      }
      
      // Ensure index is within bounds
      const safeIndex = event.total > 0 ? Math.min(event.index, event.total - 1) : 0;
      
      return {
        ...state,
        currentIndex: safeIndex,
        total: event.total,
        visualOrder: computeVisualOrder(safeIndex, event.total),
        phase: "IDLE",
        direction: null,
      };
    }

    case "UPDATE_TOTAL": {
      if (event.total === state.total) return state;
      
      // Adjust current index if it's out of bounds for new total
      const safeIndex = event.total > 0 ? Math.min(state.currentIndex, event.total - 1) : 0;
      
      return {
        ...state,
        total: event.total,
        currentIndex: safeIndex,
        visualOrder: computeVisualOrder(safeIndex, event.total),
        phase: "IDLE",
        direction: null,
      };
    }

    default:
      return state;
  }
}

export function useCarouselStateMachine(
  initialIndex: number,
  total: number,
  device: DeviceType
) {
  const [state, dispatch] = useReducer(
    carouselReducer,
    {
      currentIndex: total > 0 ? Math.min(initialIndex, total - 1) : 0,
      visualOrder: computeVisualOrder(Math.min(initialIndex, total - 1), total),
      phase: "IDLE" as Phase,
      direction: null,
      device,
      total,
    }
  );

  useEffect(() => {
    dispatch({ type: "SET_DEVICE", device });
  }, [device]);

  // Update animation timer to match new duration (400ms)
  useEffect(() => {
    if (state.phase === "TRANSITION") {
      const timer = setTimeout(() => {
        dispatch({ type: "ANIMATION_END" });
      }, 400); // Reduced from 700ms to match new duration
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.visualOrder]);

  // Handle tab changes when total changes
  useEffect(() => {
    if (total !== state.total) {
      dispatch({ type: "UPDATE_TOTAL", total });
    }
  }, [total, state.total]);

  useEffect(() => {
    dispatch({ type: "RESET", index: initialIndex, total });
  }, [initialIndex, total]);

  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const prev = useCallback(() => dispatch({ type: "PREV" }), []);
  const goTo = useCallback((index: number) => {
    dispatch({ type: "GO_TO", index });
  }, []);

  return {
    state,
    next,
    prev,
    goTo,
  };
}