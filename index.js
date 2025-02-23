const { ipcRenderer } = require("electron");
class Plugin {
  #ctx;
  constructor(ctx) {
    this.#ctx = ctx;
  }

  init() {
    const focusButton = document.querySelector("#focus");
    if (focusButton) {
      const button = document.createElement("div");
      button.id = "image";
      button.className = "nav-bar-location";
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"/></svg>`;
      focusButton.insertAdjacentElement("afterend", button);
    }
  }

  addClickEvent() {
    const { info } = this.#ctx;
    const button = document.querySelector("#image");
    button.addEventListener("click", () => {
      ipcRenderer.send("open-plugin-window", {
          pluginId: "image",
          htmlPath: `${info.pluginDir}/image/web/image.html`,
          options: {
            width          : 870,
            height         : 618,
            minWidth       : 870,
            minHeight      : 618,
            resizable      : false,
            title: "Image",
          },
      });
    });

  }

  onLoad() {
    this.init();
    this.addClickEvent();
  }
}

module.exports = Plugin;