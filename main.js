function app() {
    return {
      showSettingsPage: false,
      openModal: false,
      username: "",
      bannerImage: "",
      colors: [
        {
          label: "#3182ce",
          value: "blue",
        },
        {
          label: "#38a169",
          value: "green",
        },
        {
          label: "#805ad5",
          value: "purple",
        },
        {
          label: "#e53e3e",
          value: "red",
        },
        {
          label: "#dd6b20",
          value: "orange",
        },
        {
          label: "#5a67d8",
          value: "indigo",
        },
        {
          label: "#319795",
          value: "teal",
        },
        {
          label: "#718096",
          value: "gray",
        },
        {
          label: "#d69e2e",
          value: "yellow",
        },
      ],
      colorSelected: {
        label: "#3182ce",
        value: "blue",
      },
      dateDisplay: "toDateString",
      boards: ["Todo", "In Progress", "Review", "Done"],
      task: {
        name: "",
        boardName: "",
        date: new Date(),
      },
      editTask: {},
      tasks: [],
      formatDateDisplay(date) {
        if (this.dateDisplay === "toDateString")
          return new Date(date).toDateString();
        if (this.dateDisplay === "toLocaleDateString")
          return new Date(date).toLocaleDateString("en-GB");
        return new Date().toLocaleDateString("en-GB");
      },
      showModal(board) {
        this.task.boardName = board;
        this.openModal = true;
        setTimeout(() => this.$refs.taskName.focus(), 200);
      },
      saveEditTask(task) {
        if (task.name == "") return;
        let taskIndex = this.tasks.findIndex((t) => t.uuid === task.uuid);
        this.tasks[taskIndex].name = task.name;
        this.tasks[taskIndex].date = new Date();
        this.tasks[taskIndex].edit = false;
        // Get the existing data
        let existing = JSON.parse(localStorage.getItem("TG-tasks"));
        // Add new data to localStorage Array
        existing[taskIndex].name = task.name;
        existing[taskIndex].date = new Date();
        existing[taskIndex].edit = false;
        // Save back to localStorage
        localStorage.setItem("TG-tasks", JSON.stringify(existing));
        this.dispatchCustomEvents("flash", "Task detail updated");
      },
      getTasks() {
        // Get Default Settings
        const themeFromLocalStorage = JSON.parse(
          localStorage.getItem("TG-theme")
        );
        this.dateDisplay =
          localStorage.getItem("TG-dateDisplay") || "toLocaleDateString";
        this.username = localStorage.getItem("TG-username") || "";
        this.bannerImage = localStorage.getItem("TG-bannerImage") || "";
        this.colorSelected = themeFromLocalStorage || {
          label: "#3182ce",
          value: "blue",
        };
        if (localStorage.getItem("TG-tasks")) {
          const tasksFromLocalStorage = JSON.parse(
            localStorage.getItem("TG-tasks")
          );
          this.tasks = tasksFromLocalStorage.map((t) => {
            return {
              id: t.id,
              uuid: t.uuid,
              name: t.name,
              status: t.status,
              boardName: t.boardName,
              date: t.date,
              edit: false,
            };
          });
        } else {
          this.tasks = [];
        }
      },
      addTask() {
        if (this.task.name == "") return;
        // data to save
        const taskData = {
          uuid: this.generateUUID(),
          name: this.task.name,
          status: "pending",
          boardName: this.task.boardName,
          date: new Date(),
        };
        // Save to localStorage
        this.saveDataToLocalStorage(taskData, "TG-tasks");
        // Refetch all tasks
        this.getTasks();
        // Show Flash message
        this.dispatchCustomEvents("flash", "New task added");
        // Reset the form
        this.task.name = "";
        this.task.boardName = "";
        // close the modal
        this.openModal = false;
      },
      saveSettings() {
        // data to save
        const theme = JSON.stringify(this.colorSelected);
        // Save to localStorage
        localStorage.setItem("TG-username", this.username);
        localStorage.setItem("TG-theme", theme);
        localStorage.setItem("TG-bannerImage", this.bannerImage);
        localStorage.setItem("TG-dateDisplay", this.dateDisplay);
        // Show Flash message
        this.dispatchCustomEvents("flash", "Settings updated");
        // Back to Main Page
        this.showSettingsPage = false;
      },
      onDragStart(event, uuid) {
        event.dataTransfer.setData("text/plain", uuid);
        event.target.classList.add("opacity-5");
      },
      onDragOver(event) {
        event.preventDefault();
        return false;
      },
      onDragEnter(event) {
        event.target.classList.add("bg-gray-200");
      },
      onDragLeave(event) {
        event.target.classList.remove("bg-gray-200");
      },
      onDrop(event, boardName) {
        event.stopPropagation(); // Stops some browsers from redirecting.
        event.preventDefault();
        event.target.classList.remove("bg-gray-200");
        // console.log('Dropped', this);
        const id = event.dataTransfer.getData("text");
        const draggableElement = document.getElementById(id);
        const dropzone = event.target;
        dropzone.appendChild(draggableElement);
        // Update
        // Get the existing data
        let existing = JSON.parse(localStorage.getItem("TG-tasks"));
        let taskIndex = existing.findIndex((t) => t.uuid === id);
        // Add new data to localStorage Array
        existing[taskIndex].boardName = boardName;
        existing[taskIndex].date = new Date();
        // Save back to localStorage
        localStorage.setItem("TG-tasks", JSON.stringify(existing));
        // Get Updated Tasks
        this.getTasks();
        // Show flash message
        this.dispatchCustomEvents("flash", "Task moved to " + boardName);
        event.dataTransfer.clearData();
      },
      saveDataToLocalStorage(data, keyName) {
        var a = [];
        // Parse the serialized data back into an aray of objects
        a = JSON.parse(localStorage.getItem(keyName)) || [];
        // Push the new data (whether it be an object or anything else) onto the array
        a.push(data);
        // Re-serialize the array back into a string and store it in localStorage
        localStorage.setItem(keyName, JSON.stringify(a));
      },
      generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            var r = (Math.random() * 16) | 0,
              v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      },
      dispatchCustomEvents(eventName, message) {
        let customEvent = new CustomEvent(eventName, {
          detail: {
            message: message,
          },
        });
        window.dispatchEvent(customEvent);
      },
      greetText() {
        var d = new Date();
        var time = d.getHours();
        // From: https://1loc.dev/ (Uppercase the first character of each word in a string)
        const uppercaseWords = (str) =>
          str
            .split(" ")
            .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
            .join(" ");
        let name = localStorage.getItem("TG-username") || "";
        if (time < 12) {
          return "Good morning, " + uppercaseWords(name);
        } else if (time < 17) {
          return "Good afternoon, " + uppercaseWords(name);
        } else {
          return "Good evening, " + uppercaseWords(name);
        }
      },
    };
  }
  