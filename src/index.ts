import { app, Menu, shell, Tray } from "electron";
import path from "path";

let tray: Tray | null = null;

const openLink = async (link: string) => shell.openExternal(link);

const createTray = () => {
  console.log("Ready");
  tray = new Tray(path.resolve(__dirname, "assets", "icon.png"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Grammarly",
      submenu: [
        { label: "New document", click: () => openLink("https://app.grammarly.com/docs/new") },
        { label: "My Grammarly", click: () => openLink("https://app.grammarly.com/") },
      ],
    },
    { type: "separator" },
    { role: "quit" },
  ]);

  tray.setToolTip("My helper");
  tray.setContextMenu(contextMenu);
};

app.on("ready", createTray);
