import { state, getters, mutations } from "@/store";

function createTarget(item) {
  if (item?.isDir) {
    return { path: item.path, source: item.source };
  }
  return { path: state.req.path, source: state.req.source };
}

// Create actions shared by the context menu and the sidebar/FAB.
export function buildCreateActions(t, { item = null, resetSelection = false } = {}) {
  const open = (prompt) => {
    mutations.closeHovers();
    if (resetSelection) {
      mutations.resetSelected();
    }
    mutations.showPrompt(prompt);
  };
  return [
    {
      key: "new-folder",
      icon: "create_new_folder",
      label: t("files.newFolder"),
      action: () => open({ name: "newDir", props: { base: item?.isDir ? createTarget(item) : null } }),
    },
    {
      key: "new-file",
      icon: "note_add",
      label: t("files.newFile"),
      action: () => open("newFile"),
    },
    {
      key: "upload",
      icon: "file_upload",
      label: t("general.upload"),
      action: () => {
        const target = createTarget(item);
        open({ name: "upload", props: { targetPath: target.path, targetSource: target.source } });
      },
    },
  ];
}

function showSharePrompt() {
  mutations.closeHovers();
  mutations.showPrompt({ name: "share", props: { item: state.req } });
}

function showAccessPrompt() {
  mutations.closeHovers();
  mutations.showPrompt({ name: "access", props: { sourceName: state.req.source, path: state.req.path } });
}

function hasCreateOptions() {
  const permissions = getters.permissions();
  return !!(permissions.create || permissions.share || permissions.admin);
}

export function shouldHideFileActions() {
  if (state.isSearchActive || state.shareInfo?.shareType === "upload") return true;
  return state.user?.hideSidebarFileActions || getters.isInvalidShare() || !hasCreateOptions();
}

export function toggleMultipleSelection() {
  mutations.setMultiple(true);
  mutations.closeHovers();
}

export function canShowSelectMultiple() {
  if (state.multiple || state.isSearchActive) {
    return false;
  }
  if (state.user?.showSelectMultiple) {
    return true;
  }
  return getters.isMobile();
}

export function buildFileActionItems(t) {
  const permissions = getters.permissions();
  const isShare = getters.isShare();
  const items = [];
  if (permissions.create) {
    items.push(...buildCreateActions(t, { resetSelection: true }));
  }
  if (permissions.share && !isShare) {
    items.push({ key: "share", icon: "share", label: t("general.share"), action: showSharePrompt });
  }
  if (getters.isAdmin() && !isShare) {
    items.push({ key: "access", icon: "lock", label: t("access.rules"), action: showAccessPrompt });
  }
  if (canShowSelectMultiple()) {
    items.push({ key: "select-multiple", icon: "check_circle", label: t("buttons.selectMultiple"), action: toggleMultipleSelection });
  }
  return items;
}
