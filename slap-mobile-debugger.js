(function () {
  // Preserve original console.log and alert
  const originalLog = console.log;
  const originalAlert = window.alert;

  class MobileDebugger {
    constructor(options = {}) {
      // Default options
      this.options = {
        suppressConsole: false,
        suppressAlerts: false,
        position: "top-right", // Default position
        margin: 10, // Margin in pixels
        theme: {
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          buttonBackground: "#333",
          buttonColor: "#fff",
        },
        ...options,
      };

      this.logs = [];
      this.overlayVisible = false;

      this.injectStyles();
      this.initializeDebugger();

      // Apply suppression or capture methods
      if (this.options.suppressConsole) {
        this.overrideConsole();
      } else {
        this.captureConsole();
      }

      if (this.options.suppressAlerts) {
        this.overrideAlerts();
      } else {
        this.captureAlerts();
      }

      // Throttle logs to prevent UI freezing
      this.addLogThrottled = this.throttle(this.addLog.bind(this), 100);
    }

    // Inject CSS styles
    injectStyles() {
      const style = document.createElement("style");
      const theme = this.options.theme;

      style.innerHTML = `
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .hamburger-button, .close-button {
            position: fixed;
            z-index: 9999;
            background: ${theme.buttonBackground};
            color: ${theme.buttonColor};
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 5px;
          }
          .debugger-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${theme.background};
            color: ${theme.color};
            overflow-y: scroll;
            z-index: 9998;
            padding: 20px;
          }
          .debugger-log {
            padding: 10px;
            border-bottom: 1px solid #444;
          }
          .debugger-log:nth-child(odd) {
            background: #222;
          }
        `;
      document.head.appendChild(style);
    }

    // Initialize debugger UI
    initializeDebugger() {
      // Create floating open and close buttons
      this.hamburgerButton = this.createButton(
        "☰",
        this.toggleOverlay.bind(this),
        "hamburger-button"
      );
      this.closeButton = this.createButton(
        "✖",
        this.toggleOverlay.bind(this),
        "close-button"
      );
      this.overlay = this.createOverlay();

      // Append elements using DocumentFragment
      const fragment = document.createDocumentFragment();
      fragment.appendChild(this.hamburgerButton);
      fragment.appendChild(this.closeButton); // Close button floats outside overlay
      fragment.appendChild(this.overlay);
      document.body.appendChild(fragment);

      // Position buttons dynamically
      this.setButtonPosition(this.hamburgerButton);
      this.setButtonPosition(this.closeButton);
    }

    // Create a button with a class name
    createButton(text, onClick, className) {
      const button = document.createElement("button");
      button.innerText = text;
      button.classList.add(className); // Apply CSS class
      button.addEventListener("click", onClick);
      return button;
    }

    // Create overlay container
    createOverlay() {
      const overlay = document.createElement("div");
      overlay.classList.add("debugger-overlay");
      overlay.style.display = "none";

      this.logsContainer = document.createElement("div");
      overlay.appendChild(this.logsContainer);

      return overlay;
    }

    // Position buttons dynamically
    setButtonPosition(element) {
      const margin = this.options.margin + "px";
      const [vertical, horizontal] = this.options.position.split("-");
      element.style[vertical] = margin;
      element.style[horizontal] = margin;
    }

    // Suppress console logs but capture them
    overrideConsole() {
      const instance = this;
      console.log = function (...args) {
        instance.addLogThrottled("LOG: " + args.join(" "));
      };
    }

    // Suppress alerts but capture them
    overrideAlerts() {
      const instance = this;
      window.alert = function (msg) {
        instance.addLogThrottled("ALERT: " + msg);
      };
    }

    // Capture console logs without suppressing
    captureConsole() {
      const instance = this;
      console.log = function (...args) {
        instance.addLogThrottled("LOG: " + args.join(" "));
        originalLog.apply(console, args); // Keep default behavior
      };
    }

    // Capture alerts without suppressing
    captureAlerts() {
      const instance = this;
      window.alert = function (msg) {
        instance.addLogThrottled("ALERT: " + msg);
        originalAlert(msg); // Keep default behavior
      };
    }

    // Add log to overlay
    addLog(message) {
      const log = document.createElement("div");
      log.classList.add("debugger-log");
      log.innerText = message;
      this.logsContainer.appendChild(log);
      this.logs.push(message);
    }

    // Toggle overlay visibility
    toggleOverlay() {
      this.overlayVisible = !this.overlayVisible;
      this.overlay.style.display = this.overlayVisible ? "block" : "none";
    }

    // Throttle function for logs
    throttle(func, delay) {
      let lastCall = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          func(...args);
        }
      };
    }

    // Clear all logs
    clearLogs() {
      this.logs = [];
      this.logsContainer.innerHTML = "";
    }

    // Export logs as JSON
    exportLogs() {
      return JSON.stringify(this.logs, null, 2);
    }

    // Get logs array
    getLogs() {
      return this.logs;
    }

    // Toggle suppression dynamically
    toggleSuppression(type, enabled) {
      if (type === "console") {
        enabled ? this.overrideConsole() : this.captureConsole();
      } else if (type === "alert") {
        enabled ? this.overrideAlerts() : this.captureAlerts();
      }
    }
  }

  // Expose MobileDebugger globally
  window.MobileDebugger = MobileDebugger;
})();
