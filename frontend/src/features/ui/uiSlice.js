import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMenuOpen: false,
  isAnoSidebarOpen: false,
  isCadetSidebarOpen: false,
  isSUOSidebarOpen: false,    // ✅ Naya state SUO ke liye
  isAlumniSidebarOpen: false, // ✅ Naya state Alumni ke liye
  activeAboutCard: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMenu(state) {
      state.isMenuOpen = !state.isMenuOpen;
    },
    closeMenu(state) {
      state.isMenuOpen = false;
    },
    toggleAnoSidebar(state) {
      state.isAnoSidebarOpen = !state.isAnoSidebarOpen;
    },
    closeAnoSidebar(state) {
      state.isAnoSidebarOpen = false;
    },
    toggleCadetSidebar(state) {
      state.isCadetSidebarOpen = !state.isCadetSidebarOpen;
    },
    closeCadetSidebar(state) {
      state.isCadetSidebarOpen = false;
    },
    // ✅ SUO Reducers
    toggleSUOSidebar(state) {
      state.isSUOSidebarOpen = !state.isSUOSidebarOpen;
    },
    closeSUOSidebar(state) {
      state.isSUOSidebarOpen = false;
    },
    // ✅ Alumni Reducers
    toggleAlumniSidebar(state) {
      state.isAlumniSidebarOpen = !state.isAlumniSidebarOpen;
    },
    closeAlumniSidebar(state) {
      state.isAlumniSidebarOpen = false;
    },
    openAboutCard(state, action) {
      state.activeAboutCard = action.payload;
    },
    closeAboutCard(state) {
      state.activeAboutCard = null;
    },
  },
});

export const {
  toggleMenu,
  closeMenu,
  toggleAnoSidebar,
  closeAnoSidebar,
  toggleCadetSidebar,
  closeCadetSidebar,
  toggleSUOSidebar,
  closeSUOSidebar,
  toggleAlumniSidebar,
  closeAlumniSidebar,
  openAboutCard,
  closeAboutCard,
} = uiSlice.actions;

export default uiSlice.reducer;