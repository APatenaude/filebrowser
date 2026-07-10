<template>
  <button
    v-if="show"
    type="button"
    class="file-actions-fab"
    aria-label="File-Actions"
    data-testid="file-actions-fab"
    @click="openContextMenu"
  >
    <i class="material-symbols">add</i>
  </button>
</template>

<script>
import { state, getters, mutations } from "@/store";
import { shouldHideFileActions } from "@/utils/fileActions";

export default {
  name: "FileActionsFab",
  computed: {
    show() {
      if (!getters.isMobile() || getters.currentView() !== "listingView") return false;
      if (state.shareInfo?.shareType === "upload") return false;
      if (getters.currentPromptName() !== "") return false;
      return !shouldHideFileActions();
    },
  },
  methods: {
    openContextMenu() {
      mutations.resetSelected();
      mutations.showPrompt({
        name: "ContextMenu",
        props: {
          showCentered: true,
          createOnly: true,
        },
      });
    },
  },
};
</script>

<style>
.file-actions-fab {
  position: fixed;
  right: 1em;
  bottom: 3.5em;
  z-index: 3;
  width: 3.5em;
  height: 3.5em;
  border-radius: 50%;
  background-color: var(--primaryColor);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.file-actions-fab i {
  font-size: 1.5em;
}

body.rtl .file-actions-fab {
  right: auto;
  left: 1em;
}
</style>
