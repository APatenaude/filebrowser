<template>
  <div v-if="!disableQuickToggles" class="quick-toggles" @mouseleave="hideTooltip">
    <div class="clickable" :class="{ active: user?.singleClick }" @click="toggleClick"
      @mouseenter="showTooltip($event, $t('index.toggleClick'))" @mouseleave="hideTooltip" v-if="!isInvalidShare">
      <i class="material-symbols">ads_click</i>
    </div>
    <div aria-label="Toggle Theme" v-if="darkModeTogglePossible" class="clickable"
      :class="{ active: user?.darkMode }" @click="toggleDarkMode"
      @mouseenter="showTooltip($event, $t('index.toggleDark'))" @mouseleave="hideTooltip">
      <i class="material-symbols">dark_mode</i>
    </div>
    <div class="clickable" :class="{ active: isStickySidebar }" @click="toggleSticky"
      @mouseenter="showTooltip($event, $t('index.toggleSticky'))" @mouseleave="hideTooltip" v-if="!isMobile">
      <i class="material-symbols">push_pin</i>
    </div>
  </div>
</template>

<script>
import { state, getters, mutations } from "@/store";

export default {
  name: "QuickToggles",
  computed: {
    disableQuickToggles: () => state.user?.disableQuickToggles,
    isInvalidShare: () => getters.isInvalidShare(),
    isStickySidebar: () => getters.isStickySidebar(),
    isMobile: () => getters.isMobile(),
    user: () => (state.user || {username: 'anonymous'}),
    darkModeTogglePossible: () => state.shareInfo?.enforceDarkLightMode !== "dark" && state.shareInfo?.enforceDarkLightMode !== "light",
  },
  methods: {
    toggleClick() {
      void mutations.updateCurrentUser({ singleClick: !state.user.singleClick });
    },
    toggleDarkMode() {
      mutations.toggleDarkMode();
    },
    toggleSticky() {
      // keep sidebar open if disabling sticky sidebar
      if (!state.showSidebar && state.user.stickySidebar) {
        mutations.toggleSidebar();
      }
      void mutations.updateCurrentUser({ stickySidebar: !state.user.stickySidebar });
    },
    showTooltip(event, text) {
      if (text) {
        mutations.showTooltip({
          content: text,
          x: event.clientX,
          y: event.clientY,
        });
      }
    },
    hideTooltip() {
      mutations.hideTooltip();
    },
  },
};
</script>

<style>
.quick-toggles {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  color: var(--textPrimary);
}

.quick-toggles div {
  border-radius: 10em;
  background-color: var(--surfaceSecondary);
  transform: translateZ(0);
}

.quick-toggles div i {
  font-size: 2em;
  padding: 0.25em;
  border-radius: 10em;
  cursor: pointer;
}

.quick-toggles .active {
  background-color: var(--primaryColor) !important;
  border-radius: 10em;
  color: white;
}
</style>
