import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  // =========================
  // LOGIN / USER MANAGEMENT
  // =========================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("focusai_current_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loginForm, setLoginForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loginError, setLoginError] = useState("");

  // =========================
  // TASKS
  // =========================

  const [tasks, setTasks] = useState(() => {
    const savedUser = localStorage.getItem("focusai_current_user");

    if (!savedUser) {
      return [];
    }

    try {
      const currentUser = JSON.parse(savedUser);
      return currentUser.tasks || [];
    } catch {
      return [];
    }
  });

  // =========================
  // UI STATES
  // =========================

  const [activePage, setActivePage] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    category: "Personal",
    priority: "Medium",
    reminder: "",
  });

  // =========================
  // SAVE USER DATA
  // =========================

  useEffect(() => {
    if (!user?.email) return;

    const userKey = `focusai_user_${user.email}`;

    const updatedUser = {
      ...user,
      tasks,
    };

    localStorage.setItem(userKey, JSON.stringify(updatedUser));
    localStorage.setItem(
      "focusai_current_user",
      JSON.stringify(updatedUser)
    );
  }, [tasks]);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (event) => {
    event.preventDefault();

    setLoginError("");

    const name = loginForm.name.trim();
    const email = loginForm.email.trim().toLowerCase();
    const phone = loginForm.phone.trim();

    if (!name || !email || !phone) {
      setLoginError("Please fill all details.");
      return;
    }

    if (!email.includes("@")) {
      setLoginError("Please enter a valid Gmail address.");
      return;
    }

    if (phone.length < 10) {
      setLoginError("Please enter a valid phone number.");
      return;
    }

    const userKey = `focusai_user_${email}`;
    const existingUser = localStorage.getItem(userKey);

    if (existingUser) {
      // =========================
      // EXISTING USER
      // =========================

      try {
        const savedData = JSON.parse(existingUser);

        setUser(savedData);
        setTasks(savedData.tasks || []);

        localStorage.setItem(
          "focusai_current_user",
          JSON.stringify(savedData)
        );
      } catch {
        setLoginError("Unable to load your saved account.");
      }
    } else {
      // =========================
      // NEW USER
      // =========================

      const newUser = {
        name,
        email,
        phone,
        tasks: [],
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        userKey,
        JSON.stringify(newUser)
      );

      localStorage.setItem(
        "focusai_current_user",
        JSON.stringify(newUser)
      );

      setUser(newUser);
      setTasks([]);
    }

    setLoginForm({
      name: "",
      email: "",
      phone: "",
    });
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("focusai_current_user");

    setUser(null);
    setTasks([]);
    setActivePage("Overview");
    setShowProfile(false);
  };

  // =========================
  // ADD TASK
  // =========================

  const addTask = (event) => {
    event.preventDefault();

    if (!newTask.title.trim()) {
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      category: newTask.category,
      priority: newTask.priority,
      reminder: newTask.reminder || "",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((currentTasks) => [
      ...currentTasks,
      task,
    ]);

    setNewTask({
      title: "",
      category: "Personal",
      priority: "Medium",
      reminder: "",
    });

    setShowModal(false);
  };

  // =========================
  // TOGGLE TASK
  // =========================

  const toggleTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== id
      )
    );
  };

  // =========================
  // TASK STATISTICS
  // =========================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const remainingTasks =
    totalTasks - completedTasks;

  const highPriorityTasks = tasks.filter(
    (task) =>
      task.priority === "High" &&
      !task.completed
  ).length;

  const mediumPriorityTasks = tasks.filter(
    (task) =>
      task.priority === "Medium" &&
      !task.completed
  ).length;

  const lowPriorityTasks = tasks.filter(
    (task) =>
      task.priority === "Low" &&
      !task.completed
  ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  // =========================
  // AI PLANNER SORTING
  // =========================

  const plannedTasks = useMemo(() => {
    const priorityValue = {
      High: 1,
      Medium: 2,
      Low: 3,
    };

    return [...tasks]
      .filter((task) => !task.completed)
      .sort(
        (a, b) =>
          priorityValue[a.priority] -
          priorityValue[b.priority]
      );
  }, [tasks]);

  // =========================
  // REMINDER CHECK
  // =========================

  useEffect(() => {
    const checkReminders = () => {
      if (!user?.email) return;

      const now = new Date();

      tasks.forEach((task) => {
        if (
          !task.reminder ||
          task.completed
        ) {
          return;
        }

        const reminderTime =
          new Date(task.reminder);

        const difference =
          Math.abs(
            now.getTime() -
              reminderTime.getTime()
          );

        // 30 second reminder window
        if (difference < 30000) {
          const reminderKey = `focusai_reminder_${user.email}_${task.id}_${task.reminder}`;

          const alreadyShown =
            localStorage.getItem(
              reminderKey
            );

          if (!alreadyShown) {
            localStorage.setItem(
              reminderKey,
              "shown"
            );

            if (
              "Notification" in window &&
              Notification.permission ===
                "granted"
            ) {
              new Notification(
                "FocusAI Reminder",
                {
                  body: task.title,
                }
              );
            } else {
              alert(
                `⏰ FocusAI Reminder\n\n${task.title}`
              );
            }
          }
        }
      });
    };

    const interval = setInterval(
      checkReminders,
      15000
    );

    return () =>
      clearInterval(interval);
  }, [tasks, user]);

  // =========================
  // REQUEST NOTIFICATION
  // =========================

  const enableNotifications = async () => {
    if (
      "Notification" in window &&
      Notification.permission !==
        "granted"
    ) {
      await Notification.requestPermission();
    }
  };

  // =========================
  // FORMAT REMINDER
  // =========================

  const formatReminder = (reminder) => {
    if (!reminder) {
      return "No reminder";
    }

    const date = new Date(reminder);

    if (Number.isNaN(date.getTime())) {
      return "No reminder";
    }

    return date.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!user) {
    return (
      <div className="login-page">

        <div className="login-glow glow-one"></div>
        <div className="login-glow glow-two"></div>

        <div className="login-card">

          <div className="login-brand">
            <div className="brand-icon">
              ✦
            </div>

            <div>
              <h1>FocusAI</h1>
              <p>
                Productivity Assistant
              </p>
            </div>
          </div>

          <div className="login-heading">
            <span>
              WELCOME TO YOUR WORKSPACE
            </span>

            <h2>
              Let's get focused.
            </h2>

            <p>
              Enter your details to access
              your personal productivity
              workspace.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <label>
              Your Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={loginForm.name}
              onChange={(event) =>
                setLoginForm({
                  ...loginForm,
                  name:
                    event.target.value,
                })
              }
            />

            <label>
              Gmail
            </label>

            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm({
                  ...loginForm,
                  email:
                    event.target.value,
                })
              }
            />

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={loginForm.phone}
              onChange={(event) =>
                setLoginForm({
                  ...loginForm,
                  phone:
                    event.target.value,
                })
              }
            />

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >
              Continue to FocusAI
              <span>→</span>
            </button>

          </form>

          <div className="login-info">
            <span>🔐</span>
            <p>
              Your workspace is saved
              automatically for your Gmail.
            </p>
          </div>

        </div>

      </div>
    );
  }

  // =========================
  // OVERVIEW
  // =========================

  const renderOverview = () => (
    <>
      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Tasks</span>
            <div className="stat-icon purple">
              ✓
            </div>
          </div>

          <h2>{totalTasks}</h2>

          <p>
            Tasks in your workspace
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Completed</span>

            <div className="stat-icon green">
              ✓
            </div>
          </div>

          <h2>{completedTasks}</h2>

          <p>
            Great progress today
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>High Priority</span>

            <div className="stat-icon red">
              !
            </div>
          </div>

          <h2>{highPriorityTasks}</h2>

          <p>
            Needs your attention
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Productivity</span>

            <div className="stat-icon blue">
              ↗
            </div>
          </div>

          <h2>{progress}%</h2>

          <p>
            Today's completion rate
          </p>
        </div>

      </section>

      <section className="dashboard-grid">

        <div className="panel tasks-panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                TODAY
              </p>

              <h2>
                Today's Focus
              </h2>
            </div>

            <button
              className="add-task"
              onClick={() =>
                setShowModal(true)
              }
            >
              + Add Task
            </button>

          </div>

          <TaskList
            tasks={tasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            formatReminder={
              formatReminder
            }
          />

        </div>

        <div className="panel ai-panel">

          <div className="ai-header">

            <div className="ai-big-icon">
              ✦
            </div>

            <div>
              <p className="section-label">
                AI INSIGHT
              </p>

              <h2>
                Smart Recommendation
              </h2>
            </div>

          </div>

          {highPriorityTasks > 0 ? (
            <>
              <div className="ai-message">
                <p>
                  You have{" "}
                  <strong>
                    {highPriorityTasks}
                  </strong>{" "}
                  high-priority task
                  {highPriorityTasks > 1
                    ? "s"
                    : ""}{" "}
                  waiting. Focus on
                  important work first.
                </p>
              </div>

              <div className="recommendation">

                <span>✦</span>

                <div>
                  <strong>
                    Suggested Focus
                  </strong>

                  <p>
                    {plannedTasks[0]
                      ?.title ||
                      "Create your first task"}
                  </p>
                </div>

              </div>
            </>
          ) : (
            <>
              <div className="ai-message">
                <p>
                  Your workspace is looking
                  good. Add tasks and I'll
                  help you prioritize them.
                </p>
              </div>

              <div className="recommendation">
                <span>⚡</span>

                <div>
                  <strong>
                    AI Strategy
                  </strong>

                  <p>
                    Create tasks with
                    priorities to get smarter
                    recommendations.
                  </p>
                </div>
              </div>
            </>
          )}

          <button
            className="ai-button"
            onClick={() =>
              setShowPlanner(true)
            }
          >
            ✦ Open AI Planner
          </button>

        </div>

      </section>

      <section className="bottom-grid">

        <div className="panel progress-panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                PROGRESS
              </p>

              <h2>
                Today's Productivity
              </h2>
            </div>

            <span className="percentage">
              {progress}%
            </span>

          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>

          <div className="progress-details">

            <span>
              {completedTasks} completed
            </span>

            <span>
              {remainingTasks} remaining
            </span>

          </div>

        </div>

        <div className="panel quote-panel">

          <div className="quote-icon">
            “
          </div>

          <p>
            Small progress every day leads
            to remarkable results.
          </p>

          <span>
            — FocusAI Daily Motivation
          </span>

        </div>

      </section>
    </>
  );

  // =========================
  // MY TASKS
  // =========================

  const renderMyTasks = () => (
    <div className="page-panel">

      <div className="page-title-row">

        <div>
          <p className="section-label">
            WORKSPACE
          </p>

          <h2>
            My Tasks
          </h2>

          <p>
            Manage all your personal tasks.
          </p>
        </div>

        <button
          className="add-task"
          onClick={() =>
            setShowModal(true)
          }
        >
          + Add Task
        </button>

      </div>

      <TaskList
        tasks={tasks}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
        formatReminder={
          formatReminder
        }
      />

    </div>
  );

  // =========================
  // AI PLANNER
  // =========================

  const renderPlanner = () => (
    <div className="page-panel">

      <div className="page-title-row">

        <div>
          <p className="section-label">
            AI PLANNER
          </p>

          <h2>
            Smart Daily Plan ✦
          </h2>

          <p>
            Your tasks are automatically
            organized by priority.
          </p>
        </div>

      </div>

      {plannedTasks.length === 0 ? (
        <div className="empty-state">
          <div>✦</div>

          <h3>
            Nothing to plan
          </h3>

          <p>
            Add some tasks and assign
            priorities.
          </p>
        </div>
      ) : (
        <>
          <div className="ai-message">
            <p>
              Focus on high-priority work
              first. Once completed, move
              to medium and low-priority
              tasks.
            </p>
          </div>

          <div className="planner-list">

            {plannedTasks.map(
              (task, index) => (
                <div
                  className="planner-item"
                  key={task.id}
                >

                  <div className="planner-number">
                    {index + 1}
                  </div>

                  <div className="task-info">
                    <h3>
                      {task.title}
                    </h3>

                    <div className="task-meta">
                      <span>
                        {task.category}
                      </span>

                      <span
                        className={`priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.reminder && (
                      <small>
                        ⏰{" "}
                        {formatReminder(
                          task.reminder
                        )}
                      </small>
                    )}
                  </div>

                  <button
                    className="task-check"
                    onClick={() =>
                      toggleTask(
                        task.id
                      )
                    }
                  >
                    ✓
                  </button>

                </div>
              )
            )}

          </div>
        </>
      )}

    </div>
  );

  // =========================
  // SCHEDULE
  // =========================

  const renderSchedule = () => {
    const scheduledTasks = tasks
      .filter((task) => task.reminder)
      .sort(
        (a, b) =>
          new Date(a.reminder) -
          new Date(b.reminder)
      );

    return (
      <div className="page-panel">

        <div className="page-title-row">

          <div>
            <p className="section-label">
              SCHEDULE
            </p>

            <h2>
              Task Reminders
            </h2>

            <p>
              Your upcoming task reminders.
            </p>
          </div>

        </div>

        {scheduledTasks.length === 0 ? (
          <div className="empty-state">
            <div>◷</div>

            <h3>
              No reminders
            </h3>

            <p>
              Add a reminder while creating
              a task.
            </p>
          </div>
        ) : (
          <div className="schedule-list">

            {scheduledTasks.map(
              (task) => (
                <div
                  className="schedule-item"
                  key={task.id}
                >

                  <div className="schedule-icon">
                    ⏰
                  </div>

                  <div className="task-info">

                    <h3>
                      {task.title}
                    </h3>

                    <p>
                      {formatReminder(
                        task.reminder
                      )}
                    </p>

                    <div className="task-meta">
                      <span>
                        {task.category}
                      </span>

                      <span
                        className={`priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                  </div>

                  <button
                    className={`task-check ${
                      task.completed
                        ? "checked"
                        : ""
                    }`}
                    onClick={() =>
                      toggleTask(
                        task.id
                      )
                    }
                  >
                    {task.completed
                      ? "✓"
                      : ""}
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </div>
    );
  };

  // =========================
  // ANALYTICS
  // =========================

  const renderAnalytics = () => (
    <div className="page-panel">

      <div className="page-title-row">

        <div>
          <p className="section-label">
            ANALYTICS
          </p>

          <h2>
            Productivity Analytics
          </h2>

          <p>
            Understand your current
            productivity.
          </p>
        </div>

      </div>

      <div className="analytics-grid">

        <div className="analytics-card">
          <span>Total</span>
          <strong>
            {totalTasks}
          </strong>
        </div>

        <div className="analytics-card">
          <span>Completed</span>
          <strong>
            {completedTasks}
          </strong>
        </div>

        <div className="analytics-card">
          <span>Remaining</span>
          <strong>
            {remainingTasks}
          </strong>
        </div>

        <div className="analytics-card">
          <span>Completion Rate</span>
          <strong>
            {progress}%
          </strong>
        </div>

      </div>

      <div className="analytics-section">

        <h3>
          Priority Breakdown
        </h3>

        <div className="priority-bars">

          <div className="priority-row">
            <span>High</span>

            <div className="analytics-bar">
              <div
                className="high-bar"
                style={{
                  width:
                    totalTasks === 0
                      ? "0%"
                      : `${
                          (highPriorityTasks /
                            totalTasks) *
                          100
                        }%`,
                }}
              ></div>
            </div>

            <strong>
              {highPriorityTasks}
            </strong>
          </div>

          <div className="priority-row">
            <span>Medium</span>

            <div className="analytics-bar">
              <div
                className="medium-bar"
                style={{
                  width:
                    totalTasks === 0
                      ? "0%"
                      : `${
                          (mediumPriorityTasks /
                            totalTasks) *
                          100
                        }%`,
                }}
              ></div>
            </div>

            <strong>
              {mediumPriorityTasks}
            </strong>
          </div>

          <div className="priority-row">
            <span>Low</span>

            <div className="analytics-bar">
              <div
                className="low-bar"
                style={{
                  width:
                    totalTasks === 0
                      ? "0%"
                      : `${
                          (lowPriorityTasks /
                            totalTasks) *
                          100
                        }%`,
                }}
              ></div>
            </div>

            <strong>
              {lowPriorityTasks}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );

  // =========================
  // SETTINGS
  // =========================

  const renderSettings = () => (
    <div className="page-panel">

      <div className="page-title-row">

        <div>
          <p className="section-label">
            SETTINGS
          </p>

          <h2>
            Account Settings
          </h2>

          <p>
            Manage your FocusAI profile.
          </p>
        </div>

      </div>

      <div className="settings-card">

        <div className="settings-profile">

          <div className="large-avatar">
            {user.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div>
            <h3>
              {user.name}
            </h3>

            <p>
              {user.email}
            </p>

            <p>
              📱 {user.phone}
            </p>
          </div>

        </div>

        <button
          className="notification-button"
          onClick={
            enableNotifications
          }
        >
          🔔 Enable Browser Reminders
        </button>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </div>
  );

  // =========================
  // CURRENT PAGE
  // =========================

  const renderPage = () => {
    switch (activePage) {
      case "My Tasks":
        return renderMyTasks();

      case "AI Planner":
        return renderPlanner();

      case "Schedule":
        return renderSchedule();

      case "Analytics":
        return renderAnalytics();

      case "Settings":
        return renderSettings();

      default:
        return renderOverview();
    }
  };

  // =========================
  // MAIN APP
  // =========================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            ✦
          </div>

          <div>
            <h2>
              FocusAI
            </h2>

            <span>
              Productivity Assistant
            </span>
          </div>

        </div>

        <nav className="navigation">

          <p className="nav-label">
            WORKSPACE
          </p>

          <button
            className={`nav-item ${
              activePage === "Overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Overview")
            }
          >
            <span>⌂</span>
            Overview
          </button>

          <button
            className={`nav-item ${
              activePage === "My Tasks"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("My Tasks")
            }
          >
            <span>✓</span>
            My Tasks
          </button>

          <button
            className={`nav-item ${
              activePage ===
              "AI Planner"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("AI Planner")
            }
          >
            <span>✦</span>
            AI Planner
          </button>

          <button
            className={`nav-item ${
              activePage ===
              "Schedule"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Schedule")
            }
          >
            <span>◷</span>
            Schedule
          </button>

          <button
            className={`nav-item ${
              activePage ===
              "Analytics"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Analytics")
            }
          >
            <span>◈</span>
            Analytics
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="ai-mini-card">

            <div className="ai-icon">
              ✦
            </div>

            <div>
              <strong>
                AI Focus Mode
              </strong>

              <p>
                {remainingTasks > 0
                  ? `${remainingTasks} task${
                      remainingTasks >
                      1
                        ? "s"
                        : ""
                    } remaining`
                  : "All tasks completed"}
              </p>
            </div>

          </div>

          <button
            className={`nav-item ${
              activePage === "Settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <p className="greeting-small">
              YOUR PERSONAL AI ASSISTANT
            </p>

            <h1>
              Good morning,{" "}
              {user.name}{" "}
              <span>👋</span>
            </h1>

            <p className="subtitle">
              Let's turn your plans into
              meaningful progress.
            </p>

          </div>

          <div className="top-actions">

            <button
              className="icon-button"
              onClick={() =>
                setActivePage(
                  "Schedule"
                )
              }
              title="Reminders"
            >
              🔔
            </button>

            <button
              className="profile"
              onClick={() =>
                setShowProfile(
                  !showProfile
                )
              }
            >

              <div className="avatar">
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user.name}
                </strong>

                <span>
                  {user.email}
                </span>
              </div>

            </button>

          </div>

        </header>

        {/* PROFILE DROPDOWN */}

        {showProfile && (
          <div className="profile-dropdown">

            <div className="dropdown-user">
              <div className="large-avatar">
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user.name}
                </strong>

                <span>
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActivePage(
                  "Settings"
                );
                setShowProfile(false);
              }}
            >
              ⚙ Settings
            </button>

            <button
              onClick={handleLogout}
            >
              ↪ Logout
            </button>

          </div>
        )}

        {/* PAGE CONTENT */}

        {renderPage()}

      </main>

      {/* AI PLANNER MODAL */}

      {showPlanner && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowPlanner(false)
          }
        >

          <div
            className="task-modal ai-planner-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <p className="section-label">
                  AI PLANNER
                </p>

                <h2>
                  Smart Daily Plan ✦
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowPlanner(false)
                }
              >
                ×
              </button>

            </div>

            <div className="ai-message">

              <p>
                Your tasks have been
                analyzed. Focus on
                high-priority work first,
                then move to medium and
                low-priority tasks.
              </p>

            </div>

            {plannedTasks.length ===
            0 ? (
              <div className="empty-state">

                <div>✦</div>

                <h3>
                  No active tasks
                </h3>

                <p>
                  Add a task to let FocusAI
                  create your plan.
                </p>

              </div>
            ) : (
              <div className="task-list">

                {plannedTasks.map(
                  (task, index) => (
                    <div
                      className="task-card"
                      key={task.id}
                    >

                      <div className="planner-number">
                        {index + 1}
                      </div>

                      <div className="task-info">

                        <h3>
                          {task.title}
                        </h3>

                        <div className="task-meta">

                          <span>
                            {task.category}
                          </span>

                          <span
                            className={`priority ${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>

                        </div>

                        {task.reminder && (
                          <small>
                            ⏰{" "}
                            {formatReminder(
                              task.reminder
                            )}
                          </small>
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

            <button
              className="ai-button"
              onClick={() =>
                setShowPlanner(false)
              }
            >
              ✓ Got it — Start Focusing
            </button>

          </div>

        </div>
      )}

      {/* ADD TASK MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="task-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <p className="section-label">
                  TASK MANAGEMENT
                </p>

                <h2>
                  Create New Task
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={addTask}
            >

              <label>
                Task Title
              </label>

              <input
                type="text"
                placeholder="e.g. Complete my ML project"
                value={
                  newTask.title
                }
                onChange={(event) =>
                  setNewTask({
                    ...newTask,
                    title:
                      event.target
                        .value,
                  })
                }
                autoFocus
              />

              <label>
                Category
              </label>

              <select
                value={
                  newTask.category
                }
                onChange={(event) =>
                  setNewTask({
                    ...newTask,
                    category:
                      event.target
                        .value,
                  })
                }
              >
                <option>
                  Personal
                </option>

                <option>
                  College
                </option>

                <option>
                  Project
                </option>

                <option>
                  Learning
                </option>

                <option>
                  Work
                </option>
              </select>

              <label>
                Priority
              </label>

              <select
                value={
                  newTask.priority
                }
                onChange={(event) =>
                  setNewTask({
                    ...newTask,
                    priority:
                      event.target
                        .value,
                  })
                }
              >
                <option>
                  High
                </option>

                <option>
                  Medium
                </option>

                <option>
                  Low
                </option>
              </select>

              <label>
                ⏰ Reminder
              </label>

              <input
                type="datetime-local"
                value={
                  newTask.reminder
                }
                onChange={(event) =>
                  setNewTask({
                    ...newTask,
                    reminder:
                      event.target
                        .value,
                  })
                }
              />

              <small className="form-help">
                Set a reminder for this
                task. FocusAI will remind
                you when the time arrives.
              </small>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-task"
                >
                  + Create Task
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

// =========================
// TASK LIST COMPONENT
// =========================

function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  formatReminder,
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">

        <div>✦</div>

        <h3>
          No tasks yet
        </h3>

        <p>
          Add your first task and start
          being productive.
        </p>

      </div>
    );
  }

  return (
    <div className="task-list">

      {tasks.map((task) => (
        <div
          className={`task-card ${
            task.completed
              ? "completed"
              : ""
          }`}
          key={task.id}
        >

          <button
            className={`task-check ${
              task.completed
                ? "checked"
                : ""
            }`}
            onClick={() =>
              toggleTask(task.id)
            }
          >
            {task.completed
              ? "✓"
              : ""}
          </button>

          <div className="task-info">

            <h3>
              {task.title}
            </h3>

            <div className="task-meta">

              <span>
                {task.category}
              </span>

              <span
                className={`priority ${task.priority.toLowerCase()}`}
              >
                {task.priority}
              </span>

            </div>

            {task.reminder && (
              <small className="task-reminder">
                ⏰{" "}
                {formatReminder(
                  task.reminder
                )}
              </small>
            )}

          </div>

          <button
            className="delete-task"
            onClick={() =>
              deleteTask(task.id)
            }
            title="Delete task"
          >
            🗑
          </button>

        </div>
      ))}

    </div>
  );
}

export default App;