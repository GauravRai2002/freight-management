import { configureStore } from "@reduxjs/toolkit";
import vehicleReducer from "./slices/vehicleSlice";
import driverReducer from "./slices/driverSlice";
import billingPartyReducer from "./slices/billingPartySlice";
import transporterReducer from "./slices/transporterSlice";
import expenseCategoryReducer from "./slices/expenseCategorySlice";
import paymentModeReducer from "./slices/paymentModeSlice";
import stockItemReducer from "./slices/stockItemSlice";
import tripReducer from "./slices/tripSlice";
import tripBookReducer from "./slices/tripBookSlice";
import driverAdvanceReducer from "./slices/driverAdvanceSlice";
import expenseReducer from "./slices/expenseSlice";
import returnTripReducer from "./slices/returnTripSlice";
import partyPaymentReducer from "./slices/partyPaymentSlice";
import marketVehPaymentReducer from "./slices/marketVehPaymentSlice";
import stockEntryReducer from "./slices/stockEntrySlice";

export const store = configureStore({
    reducer: {
        vehicles: vehicleReducer,
        drivers: driverReducer,
        billingParties: billingPartyReducer,
        transporters: transporterReducer,
        expenseCategories: expenseCategoryReducer,
        paymentModes: paymentModeReducer,
        stockItems: stockItemReducer,
        trips: tripReducer,
        tripBooks: tripBookReducer,
        driverAdvances: driverAdvanceReducer,
        expenses: expenseReducer,
        returnTrips: returnTripReducer,
        partyPayments: partyPaymentReducer,
        marketVehPayments: marketVehPaymentReducer,
        stockEntries: stockEntryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
