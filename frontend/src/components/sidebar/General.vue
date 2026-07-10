<template>
  <div class="card headline-card">
    <div v-if="isDataLoaded && shouldShowLogin" class="card-wrapper user-card">
      <div v-if="settingsAllowed" class="inner-card user-card__profile">
        <a href="/settings#profile-main" class="person-button action button"
          @click.prevent="navigateTo('/settings', '#profile-main')"
          @mouseenter="showTooltip($event, $t('index.settingsHover'))" @mouseleave="hideTooltip">
          <i class="material-symbols person-button__icon">person</i>
          <span class="person-button__name">{{ user.username }}</span>
          <i aria-label="settings" class="material-symbols person-button__icon">settings</i>
        </a>
      </div>
      <div v-else-if="user.username === 'anonymous' && shouldShowLogin" @click="navigateToLogin"
        class="inner-card user-card__profile">
        <button type="button" class="person-button action button" aria-label="Login">
          <i class="material-symbols-outlined">login</i> {{ $t("general.login") }}
        </button>
      </div>
      <div v-else-if="user.username !== 'anonymous'" class="inner-card user-card__profile">
        <button class="person-button action button" type="button">
          <i class="material-symbols person-button__icon">person</i>
          <span class="person-button__name">{{ user.username }}</span>
        </button>
      </div>

      <div class="inner-card" v-if="canLogout" @click="logout">
        <button type="button" aria-label="logout-button" class="logout-button action button"
          @mouseenter="showTooltip($event, $t('general.logout'))" @mouseleave="hideTooltip">
          <i class="material-symbols">exit_to_app</i>
        </button>
      </div>
    </div>

    <!-- Sidebar file actions -->
    <transition v-if="shareInfo.shareType !== 'upload'" name="expand" @before-enter="beforeEnter" @enter="enter"
      @leave="leave">
      <div v-if="!hideSidebarFileActions && isListingView" class="card-wrapper file-actions-inline" data-testid="sidebar-file-actions">
        <action
          v-for="item in fileActionItems"
          :key="item.key"
          :icon="item.icon"
          :label="item.label"
          :data-testid="`sidebar-file-action-${item.key}`"
          @action="item.action"
        />
      </div>
    </transition>
    <!-- Hidden marker for tests to detect when file actions should be available -->
    <div v-if="isDataLoaded && isListingView && shareInfo.shareType !== 'upload'"
         data-testid="file-actions-ready"
         style="display: none;"
         :data-hidden="hideSidebarFileActions">
    </div>
  </div>

  <!-- Sidebar Links Component (replaces sources) -->
  <SidebarLinks />
</template>

<script>
import * as auth from "@/utils/auth";
import { globalVars } from "@/utils/constants";
import { state, getters, mutations } from "@/store";
import SidebarLinks from "./Links.vue";
import Action from "@/components/Action.vue";
import { url } from "@/utils";
import { buildFileActionItems, shouldHideFileActions } from "@/utils/fileActions";

export default {
  name: "SidebarGeneral",
  components: {
    SidebarLinks,
    Action,
  },
  data() {
    return {};
  },
  computed: {
    // Check if data is loaded before showing user info
    isDataLoaded() {
      if (getters.isShare()) {
        // For shares, wait for shareInfo to be loaded
        return state.shareInfo !== null && state.shareInfo !== undefined;
      }
      // For regular files, user should be loaded
      return state.user !== null && state.user !== undefined;
    },
    shareInfo: () => state.shareInfo,
    hideSidebarFileActions: () => shouldHideFileActions(),
    fileActionItems() {
      return buildFileActionItems(this.$t);
    },
    settingsAllowed: () => !state.user?.disableSettings,
    isSettings: () => getters.isSettings(),
    isStickySidebar: () => getters.isStickySidebar(),
    isMobile: () => getters.isMobile(),
    isListingView: () => getters.currentView() === "listingView",
    user: () => (state.user || {username: 'anonymous'}),
    isShare: () => getters.isShare(),
    active: () => getters.isSidebarVisible(),
    canLogout: () => !globalVars.noAuth && state.user?.username !== 'anonymous',
    route: () => state.route,
    realtimeActive: () => state.realtimeActive,
    shouldShowLogin() {
      if (getters.isShare()) {
        // Don't show login until shareInfo is fully loaded
        if (state.shareInfo?.disableLoginOption) {
          return false;
        }
      }
      return true;
    },
  },
  watch: {
    route() {
      if (!getters.isLoggedIn()) {
        return;
      }
      if (!this.isStickySidebar && !state.shareInfo?.singleFileShare) {
        mutations.closeSidebar();
      }
    },
  },
  methods: {
    checkLogin() {
      return getters.isLoggedIn() && !getters.routePath().startsWith("/share");
    },
    navigateTo(path,hash) {
      mutations.setPreviousHistoryItem({
        name: state.req.name,
        source: state.req.source,
        path: state.req.path,
        isShare: getters.isShare()
      });
      this.$router.push({ path: path, hash: hash });
      mutations.closeTopPrompt();
    },
    navigateToLogin() {
      this.$router.push({ path: "/login", query: { redirect: this.$route.path } });
    },
    // Show the help overlay
    help() {
      mutations.showPrompt("help");
    },

    // Logout the user
    async logout() {
      const isShare = getters.isShare();
      let sharePath;

      if (isShare && state.shareInfo?.hash) {
        const shareBase = `/public/share/${state.shareInfo.hash}`;
        const subPath = state.req?.path && state.req.path !== '/'
          ? url.removeLeadingSlash(state.req.path)
          : '';
        sharePath = subPath ? `${shareBase}/${url.encodedPath(subPath)}` : shareBase;
      }
      await auth.logout();
      window.location.href = sharePath || '/login';
    },
    beforeEnter(el) {
      el.style.maxHeight = '0';
      el.style.opacity = '0';
    },
    enter(el, done) {
      requestAnimationFrame(() => {
        el.style.transition = 'max-height 0.2s ease, opacity 0.15s ease';
        el.style.maxHeight = `${el.scrollHeight}px`;
        el.style.opacity = '1';
        const onTransitionEnd = () => {
          el.style.maxHeight = '';
          el.removeEventListener('transitionend', onTransitionEnd);
          done();
        };
        el.addEventListener('transitionend', onTransitionEnd);
      });
    },
    leave(el, done) {
      requestAnimationFrame(() => {
        el.style.maxHeight = `${el.scrollHeight}px`;
        void el.offsetHeight;
        el.style.maxHeight = '0';
        el.style.opacity = '0';

        const onTransitionEnd = () => {
          done();
          el.removeEventListener('transitionend', onTransitionEnd);
        };
        el.addEventListener('transitionend', onTransitionEnd);
      });
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

.user-card {
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center;
  width: 100%;
  color: var(--textPrimary);
}

.user-card > .user-card__profile {
  flex: 1 1 0;
  min-width: 0;
}

.sources {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 1em;
}

.sources .inner-card {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
}

button.action {
  border-radius: 0.5em;
  transform: translateZ(0);
}

.inner-card {
  display: flex;
  align-items: center;
  padding: 0px !important;
}

.card-wrapper {
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0em !important;
  border-radius: 1em;
}

.headline-card {
  padding: 1em;
}

.person-button {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  padding-right: 0;
  justify-content: flex-start;
  align-items: center;
  gap: 0.3em;
}

.person-button__icon {
  flex-shrink: 0;
}

.person-button__name {
  min-width: 0;
  flex: 1 1 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions-inline {
  align-items: stretch !important;
  gap: 0.25em;
  margin-top: 0.5em;
}

.file-actions-inline .action {
  padding: 0.25em !important;
  display: flex !important;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5em;
  width: 100%;
  box-sizing: border-box;
}

.file-actions-inline .action i {
  padding: 0 !important;
}
</style>
