import { useState } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [tasks, setTasks] = useState([]);

  const [activePage, setActivePage] = useState("Overview");

  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    category: "Personal",
    priority: "Medium",
    reminder: "",
  });

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();

    if (!user.name || !user.email || !user.phone) {
      alert("Please fill all details");
      return;
    }

    setIsLoggedIn(true);
  };

  // ADD TASK
  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      alert("Enter a task title");
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      reminder: newTask.reminder,
      completed: false,
    };

    setTasks((prev) => [...prev, task]);

    setNewTask({
      title: "",
      category: "Personal",
      priority: "Medium",
      reminder: "",
    });

    setShowModal(false);
  };

  // COMPLETE TASK
  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // DELETE TASK
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // LOGOUT
  const logout = () => {
    setIsLoggedIn(false);

    setUser({
      name: "",
      email: "",
      phone: "",
    });

    setTasks([]);
    setActivePage("Overview");
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-logo">✦</div>

          <p className="login-label">
            YOUR PERSONAL AI ASSISTANT
          </p>

          <h1>
            Welcome to <span>FocusAI</span>
          </h1>

          <p className="login-subtitle">
            Build your day. Focus harder. Get things done.
          </p>

          <form onSubmit={handleLogin}>

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={user.name}
              onChange={(e) =>
                setUser({
                  ...user,
                  name: e.target.value,
                })
              }
            />

            <label>Gmail</label>

            <input
              type="email"
              placeholder="Enter your Gmail"
              value={user.email}
              onChange={(e) =>
                setUser({
                  ...user,
                  email: e.target.value,
                })
              }
            />

            <label>Phone Number</label>

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={user.phone}
              onChange={(e) =>
                setUser({
                  ...user,
                  phone: e.target.value,
                })
              }
            />

            <button className="login-button">
              Enter FocusAI →
            </button>

          </form>

        </div>

      </div>
    );
  }

  // STATISTICS
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const highPriority = tasks.filter(
    (task) =>
      task.priority === "High" &&
      !task.completed
  ).length;

  const productivity =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  // OVERVIEW
  const Overview = () => (
    <>
      <header className="topbar">

        <div>
          <p className="greeting-small">
            YOUR PERSONAL AI ASSISTANT
          </p>

          <h1>
            Good morning, {user.name} 👋
          </h1>

          <p className="subtitle">
            Let's turn your plans into meaningful progress.
          </p>
        </div>

        <div className="profile">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>

      </header>

      <section className="stats-grid">

        <div className="stat-card">
          <span>Total Tasks</span>
          <h2>{totalTasks}</h2>
          <p>Your workspace tasks</p>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <h2>{completedTasks}</h2>
          <p>Tasks completed</p>
        </div>

        <div className="stat-card">
          <span>High Priority</span>
          <h2>{highPriority}</h2>
          <p>Needs attention</p>
        </div>

        <div className="stat-card">
          <span>Productivity</span>
          <h2>{productivity}%</h2>
          <p>Completion rate</p>
        </div>

      </section>

      <section className="dashboard-grid">

        <div className="panel">

          <div className="panel-header">

            <div>
              <p className="section-label">
                TODAY
              </p>

              <h2>
                Your Focus
              </h2>
            </div>

            <button
              className="add-task"
              onClick={() => setShowModal(true)}
            >
              + Add Task
            </button>

          </div>

          {tasks.length === 0 ? (

            <div className="empty-state">

              <div>✦</div>

              <h3>
                No tasks yet
              </h3>

              <p>
                Create your first task and let FocusAI organize your day.
              </p>

              <button
                className="ai-button"
                onClick={() => setShowModal(true)}
              >
                + Create First Task
              </button>

            </div>

          ) : (

            <TaskList />

          )}

        </div>

        <div className="panel ai-panel">

          <div className="ai-big-icon">
            ✦
          </div>

          <p className="section-label">
            AI INSIGHT
          </p>

          <h2>
            Smart Recommendation
          </h2>

          {highPriority > 0 ? (

            <p>
              You have {highPriority} high-priority task
              {highPriority > 1 ? "s" : ""} waiting.
              Focus on them first to reduce your workload.
            </p>

          ) : (

            <p>
              No urgent tasks right now.
              You're in control of your day.
            </p>

          )}

          <button
            className="ai-button"
            onClick={() => setActivePage("AI Planner")}
          >
            ✦ Open AI Planner
          </button>

        </div>

      </section>

      <section className="bottom-grid">

        <div className="panel">

          <p className="section-label">
            PROGRESS
          </p>

          <h2>
            Today's Productivity
          </h2>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${productivity}%`,
              }}
            />

          </div>

          <div className="progress-details">
            <span>
              {completedTasks} completed
            </span>

            <span>
              {pendingTasks} remaining
            </span>
          </div>

        </div>

        <div className="panel quote-panel">

          <div className="quote-icon">
            “
          </div>

          <p>
            Small progress every day leads to remarkable results.
          </p>

          <span>
            — FocusAI Daily Motivation
          </span>

        </div>

      </section>
    </>
  );

  // TASK LIST
  const TaskList = () => (
    <div className="task-list">

      {tasks.map((task) => (

        <div
          className={`task-card ${
            task.completed ? "completed" : ""
          }`}
          key={task.id}
        >

          <button
            className={`task-check ${
              task.completed ? "checked" : ""
            }`}
            onClick={() => toggleTask(task.id)}
          >
            {task.completed ? "✓" : ""}
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

              {task.reminder && (
                <span className="reminder">
                  ⏰ {task.reminder}
                </span>
              )}

            </div>

          </div>

          <button
            className="delete-task"
            onClick={() => deleteTask(task.id)}
            title="Delete task"
          >
            🗑
          </button>

        </div>

      ))}

    </div>
  );

  // MY TASKS
  const MyTasks = () => (
    <div>

      <div className="page-heading">
        <p className="section-label">
          WORKSPACE
        </p>

        <h1>
          My Tasks
        </h1>

        <p>
          Manage everything you've planned.
        </p>
      </div>

      <div className="panel">

        <div className="panel-header">

          <h2>
            All Tasks ({totalTasks})
          </h2>

          <button
            className="add-task"
            onClick={() => setShowModal(true)}
          >
            + Add Task
          </button>

        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks created</h3>
            <p>Create a task to get started.</p>
          </div>
        ) : (
          <TaskList />
        )}

      </div>

    </div>
  );

  // AI PLANNER
  const AIPlanner = () => {

    const pending = tasks
      .filter((task) => !task.completed)
      .sort((a, b) => {

        const order = {
          High: 1,
          Medium: 2,
          Low: 3,
        };

        return order[a.priority] - order[b.priority];

      });

    return (
      <div>

        <div className="page-heading">

          <p className="section-label">
            INTELLIGENCE
          </p>

          <h1>
            AI Planner ✦
          </h1>

          <p>
            Your tasks organized by priority.
          </p>

        </div>

        <div className="panel ai-panel">

          <h2>
            Smart Daily Plan
          </h2>

          <p>
            FocusAI recommends completing high-priority
            tasks before medium and low-priority work.
          </p>

        </div>

        <div className="task-list">

          {pending.length === 0 ? (

            <div className="panel empty-state">
              <div>✦</div>
              <h3>Nothing pending</h3>
              <p>
                Create a task and FocusAI will build your plan.
              </p>
            </div>

          ) : (

            pending.map((task, index) => (

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

                    {task.reminder && (
                      <span className="reminder">
                        ⏰ {task.reminder}
                      </span>
                    )}

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>
    );
  };

  // SCHEDULE
  const Schedule = () => (
    <div>

      <div className="page-heading">

        <p className="section-label">
          TIME MANAGEMENT
        </p>

        <h1>
          Schedule
        </h1>

        <p>
          Your upcoming task reminders.
        </p>

      </div>

      <div className="panel">

        {tasks.filter((task) => task.reminder).length === 0 ? (

          <div className="empty-state">

            <div>◷</div>

            <h3>
              No reminders set
            </h3>

            <p>
              Add a reminder when creating a task.
            </p>

          </div>

        ) : (

          tasks
            .filter((task) => task.reminder)
            .map((task) => (

              <div
                className="task-card"
                key={task.id}
              >

                <div className="task-info">

                  <h3>
                    {task.title}
                  </h3>

                  <div className="task-meta">
                    <span>
                      ⏰ {task.reminder}
                    </span>

                    <span
                      className={`priority ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                </div>

              </div>

            ))

        )}

      </div>

    </div>
  );

  // ANALYTICS
  const Analytics = () => (
    <div>

      <div className="page-heading">

        <p className="section-label">
          PERFORMANCE
        </p>

        <h1>
          Analytics
        </h1>

        <p>
          Understand your productivity.
        </p>

      </div>

      <section className="stats-grid">

        <div className="stat-card">
          <span>Total Tasks</span>
          <h2>{totalTasks}</h2>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <h2>{completedTasks}</h2>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <h2>{pendingTasks}</h2>
        </div>

        <div className="stat-card">
          <span>Success Rate</span>
          <h2>{productivity}%</h2>
        </div>

      </section>

      <div className="panel">

        <h2>
          Productivity Overview
        </h2>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${productivity}%`,
            }}
          />

        </div>

        <p>
          You have completed {completedTasks} out of{" "}
          {totalTasks} tasks.
        </p>

      </div>

    </div>
  );

  // SETTINGS
  const Settings = () => (
    <div>

      <div className="page-heading">

        <p className="section-label">
          ACCOUNT
        </p>

        <h1>
          Settings
        </h1>

        <p>
          Manage your FocusAI profile.
        </p>

      </div>

      <div className="panel settings-panel">

        <div className="profile-large">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p>{user.phone}</p>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </div>
  );

  // PAGE SWITCHER
  const renderPage = () => {

    if (activePage === "Overview") {
      return <Overview />;
    }

    if (activePage === "My Tasks") {
      return <MyTasks />;
    }

    if (activePage === "AI Planner") {
      return <AIPlanner />;
    }

    if (activePage === "Schedule") {
      return <Schedule />;
    }

    if (activePage === "Analytics") {
      return <Analytics />;
    }

    if (activePage === "Settings") {
      return <Settings />;
    }

    return <Overview />;
  };

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

          {[
            ["Overview", "⌂"],
            ["My Tasks", "✓"],
            ["AI Planner", "✦"],
            ["Schedule", "◷"],
            ["Analytics", "◈"],
          ].map(([name, icon]) => (

            <button
              key={name}
              className={`nav-item ${
                activePage === name ? "active" : ""
              }`}
              onClick={() => setActivePage(name)}
            >
              <span>{icon}</span>
              {name}
            </button>

          ))}

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
                Ready to plan your day
              </p>
            </div>

          </div>

          <button
            className={`nav-item ${
              activePage === "Settings" ? "active" : ""
            }`}
            onClick={() => setActivePage("Settings")}
          >
            <span>⚙</span>
            Settings
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main-content">

        {renderPage()}

      </main>


      {/* ADD TASK MODAL */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
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
                onClick={() => setShowModal(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={addTask}>

              <label>
                Task Title
              </label>

              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    title: e.target.value,
                  })
                }
                autoFocus
              />

              <label>
                Category
              </label>

              <select
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    category: e.target.value,
                  })
                }
              >
                <option>Personal</option>
                <option>College</option>
                <option>Project</option>
                <option>Learning</option>
                <option>Work</option>
              </select>

              <label>
                Priority
              </label>

              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    priority: e.target.value,
                  })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <label>
                Reminder
              </label>

              <input
                type="datetime-local"
                value={newTask.reminder}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    reminder: e.target.value,
                  })
                }
              />

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
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

export default App;