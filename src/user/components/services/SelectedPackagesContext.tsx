import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    ReactNode,
    Dispatch,
    useCallback,
  } from "react";
  import { SelectedPackage } from "../../types/services";
  
  /* ============================================================
     Types
  ============================================================ */
  
  type State = {
    selectedPackages: SelectedPackage[];
    activeServiceId: string | null;
  };
  
  type Action =
    | { type: "ADD_PACKAGE"; payload: SelectedPackage }
    | { type: "REMOVE_PACKAGE"; payload: { serviceId: string; packageId: string } }
    | { type: "CLEAR_SERVICE_PACKAGES"; payload: { serviceId: string } }
    | { type: "CLEAR_ALL" }
    | { type: "SET_ACTIVE_SERVICE"; payload: string | null };
  
  type SelectedPackagesContextValue = {
    state: State;
    dispatch: Dispatch<Action>;
  
    addPackage: (pkg: SelectedPackage) => void;
    removePackage: (serviceId: string, packageId: string) => void;
    clearServicePackages: (serviceId: string) => void;
    clearAll: () => void;
    setActiveService: (serviceId: string | null) => void;
  
    isPackageSelected: (serviceId: string, packageId: string) => boolean;
    getServicePackages: (serviceId: string) => SelectedPackage[];
  
    totalSelected: number;
    totalPrice: number;
  };
  
  /* ============================================================
     Initial State
  ============================================================ */
  
  const initialState: State = {
    selectedPackages: [],
    activeServiceId: null,
  };
  
  /* ============================================================
     Helpers
  ============================================================ */
  
  const isValidString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;
  
  const isValidSelectedPackage = (pkg: SelectedPackage): boolean =>
    !!pkg && isValidString(pkg.serviceId) && isValidString(pkg.packageId);
  
  /* ============================================================
     Reducer (UPDATED LOGIC)
  ============================================================ */
  
  function selectionReducer(state: State, action: Action): State {
    switch (action.type) {
      case "ADD_PACKAGE": {
        if (!isValidSelectedPackage(action.payload)) return state;
  
        const { serviceId } = action.payload;
  
        // 🔥 Remove any existing package of same service
        const filtered = state.selectedPackages.filter(
          (p) => p.serviceId !== serviceId
        );
  
        return {
          ...state,
          selectedPackages: [...filtered, action.payload],
        };
      }
  
      case "REMOVE_PACKAGE": {
        const { serviceId, packageId } = action.payload;
  
        if (!isValidString(serviceId) || !isValidString(packageId))
          return state;
  
        return {
          ...state,
          selectedPackages: state.selectedPackages.filter(
            (p) =>
              !(p.serviceId === serviceId && p.packageId === packageId)
          ),
        };
      }
  
      case "CLEAR_SERVICE_PACKAGES": {
        const { serviceId } = action.payload;
        if (!isValidString(serviceId)) return state;
  
        return {
          ...state,
          selectedPackages: state.selectedPackages.filter(
            (p) => p.serviceId !== serviceId
          ),
        };
      }
  
      case "CLEAR_ALL":
        return {
          ...state,
          selectedPackages: [],
        };
  
      case "SET_ACTIVE_SERVICE":
        if (
          action.payload !== null &&
          !isValidString(action.payload)
        ) {
          return state;
        }
  
        return {
          ...state,
          activeServiceId: action.payload,
        };
  
      default:
        return state;
    }
  }
  
  /* ============================================================
     Context
  ============================================================ */
  
  const SelectedPackagesContext =
    createContext<SelectedPackagesContextValue | null>(null);
  
  /* ============================================================
     Provider
  ============================================================ */
  
  export const SelectedPackagesProvider = ({
    children,
  }: {
    children: ReactNode;
  }): JSX.Element => {
    const [state, dispatch] = useReducer(selectionReducer, initialState);
  
    const addPackage = useCallback(
      (pkg: SelectedPackage) => {
        dispatch({ type: "ADD_PACKAGE", payload: pkg });
      },
      []
    );
  
    const removePackage = useCallback(
      (serviceId: string, packageId: string) => {
        dispatch({
          type: "REMOVE_PACKAGE",
          payload: { serviceId, packageId },
        });
      },
      []
    );
  
    const clearServicePackages = useCallback(
      (serviceId: string) => {
        dispatch({
          type: "CLEAR_SERVICE_PACKAGES",
          payload: { serviceId },
        });
      },
      []
    );
  
    const clearAll = useCallback(() => {
      dispatch({ type: "CLEAR_ALL" });
    }, []);
  
    const setActiveService = useCallback(
      (serviceId: string | null) => {
        dispatch({ type: "SET_ACTIVE_SERVICE", payload: serviceId });
      },
      []
    );
  
    const isPackageSelected = useCallback(
      (serviceId: string, packageId: string): boolean =>
        state.selectedPackages.some(
          (p) =>
            p.serviceId === serviceId &&
            p.packageId === packageId
        ),
      [state.selectedPackages]
    );
  
    const getServicePackages = useCallback(
      (serviceId: string): SelectedPackage[] =>
        state.selectedPackages.filter(
          (p) => p.serviceId === serviceId
        ),
      [state.selectedPackages]
    );
  
    const totalSelected = state.selectedPackages.length;
  
    const totalPrice = useMemo(() => {
      return state.selectedPackages.reduce(
        (sum, pkg) => sum + (pkg.price ?? 0),
        0
      );
    }, [state.selectedPackages]);
  
    const value = useMemo(
      () => ({
        state,
        dispatch,
        addPackage,
        removePackage,
        clearServicePackages,
        clearAll,
        setActiveService,
        isPackageSelected,
        getServicePackages,
        totalSelected,
        totalPrice,
      }),
      [
        state,
        addPackage,
        removePackage,
        clearServicePackages,
        clearAll,
        setActiveService,
        isPackageSelected,
        getServicePackages,
        totalSelected,
        totalPrice,
      ]
    );
  
    return (
      <SelectedPackagesContext.Provider value={value}>
        {children}
      </SelectedPackagesContext.Provider>
    );
  };
  
  /* ============================================================
     Hook
  ============================================================ */
  
  export const useSelectedPackages =
    (): SelectedPackagesContextValue => {
      const context = useContext(SelectedPackagesContext);
      if (!context) {
        throw new Error(
          "useSelectedPackages must be used within SelectedPackagesProvider"
        );
      }
      return context;
    };
  