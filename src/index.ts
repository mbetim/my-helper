import { app, dialog, Menu, shell, Tray } from "electron";
import ElectronStore from "electron-store";
import Path from "path";
import { spawn } from "child_process";

interface Store {
  codeProjects: { name: string; path: string }[];
}

let tray: Tray | null = null;
const store = new ElectronStore<Store>({
  schema: {
    codeProjects: { type: "array", default: [] },
  },
});

const openLink = async (link: string) => shell.openExternal(link);

const addCodeProject = () => {
  const resultDialog = dialog.showOpenDialogSync({ properties: ["openDirectory"] });

  if (!resultDialog) return;

  const [path] = resultDialog;
  const name = Path.basename(path);
  const oldProjects = store.get("codeProjects");

  store.set("codeProjects", [...oldProjects, { name, path }]);
  renderTray();
};

const openCodeProject = (path: string) => spawn("code", [path], { shell: true });

const removeCodeProject = (index: number) => {
  const oldProjects = store.get("codeProjects");

  store.set(
    "codeProjects",
    oldProjects.filter((_, i) => i !== index)
  );

  renderTray();
};

const renderTray = () => {
  if (!tray) return;
  console.log("Rendering Tray");

  const codeProjects = store.get("codeProjects");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Grammarly",
      submenu: [
        { label: "New document", click: () => openLink("https://app.grammarly.com/docs/new") },
        { label: "My Grammarly", click: () => openLink("https://app.grammarly.com/") },
      ],
    },
    { type: "separator" },
    ...codeProjects.map(({ name, path }, i) => ({
      label: name,
      submenu: [
        { label: "Open", click: () => openCodeProject(path) },
        { label: "Remove", click: () => removeCodeProject(i) },
      ],
    })),
    { label: "Add a project", click: addCodeProject },
    { type: "separator" },
    { role: "quit" },
  ]);

  tray.setToolTip("My helper");
  tray.setContextMenu(contextMenu);
};

app.on("ready", () => {
  console.log("App ready");

  tray = new Tray(Path.resolve(__dirname, "assets", "icon.png"));
  renderTray();
});
