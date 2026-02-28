import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../features/ui/uiSlice";
import chatReducer from "./chatSlice";
import meetingsReducer from "./meetingSlice";
import quizReducer from "./quizSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    chat: chatReducer,
    meetings: meetingsReducer,
    quiz: quizReducer,
  },
});
