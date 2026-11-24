
import { useEffect, useState } from 'react'
import './App.css'

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Completed']

const emptyForm = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: '',
}

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taskflow-tasks')) || []
    } catch {
      return []
    }
  })

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim()) return

    if (editingId !== null) {
      setTasks(current =>
        current.map(task =>
          task.id === editingId
            ? { ...task, ...form }
            : task
        )
      )
    } else {
      setTasks(current => [
        ...current,
        {
          id: crypto.randomUUID(),
          ...form,
          status: 'To Do',
          createdAt: new Date().toISOString(),
        },
      ])
    }

    closeForm()
  }

  function editTask(task) {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
    })

    setEditingId(task.id)
    setShowForm(true)
  }

  function deleteTask(id) {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(current => current.filter(task => task.id !== id))
    }
  }

  function moveTask(id, newStatus) {
    setTasks(current =>
      current.map(task =>
        task.id === id
          ? { ...task, status: newStatus }
          : task
      )
    )
  }

  function closeForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  function updateForm(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>TaskFlow</h1>
          <p>Organise your work. Get things done.</p>
        </div>

        <button className="add-button" onClick={() => setShowForm(true)}>
          + Add Task
        </button>
      </header>

      <section className="board">
        {STATUSES.map(status => {
          const columnTasks = tasks.filter(
            task => task.status === status
          )

          return (
            <div className="column" key={status}>
              <div className="column-header">
                <h2>{status}</h2>
                <span className="task-count">
                  {columnTasks.length}
                </span>
              </div>

              <div className="task-list">
                {columnTasks.length === 0 && (
                  <p className="empty-message">No tasks yet</p>
                )}

                {columnTasks.map(task => (
                  <article className="task-card" key={task.id}>
                    <div className="task-top">
                      <h3>{task.title}</h3>
                      <span className={`priority ${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="description">
                        {task.description}
                      </p>
                    )}

                    {task.dueDate && (
                      <p className="due-date">
                        Due: {task.dueDate}
                      </p>
                    )}

                    <div className="task-actions">
                      <button onClick={() => editTask(task)}>
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="move-task">
                      <label htmlFor={`status-${task.id}`}>
                        Move to:
                      </label>

                      <select
                        id={`status-${task.id}`}
                        value={task.status}
                        onChange={e => moveTask(task.id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {showForm && (
        <div className="modal-overlay">
          <form className="task-form" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Edit Task' : 'Create New Task'}</h2>

            <label>Task Title</label>
            <input
              name="title"
              value={form.title}
              onChange={updateForm}
              placeholder="Enter task title"
              required
              autoFocus
            />

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={updateForm}
              placeholder="Describe your task..."
              rows="4"
            />

            <label>Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={updateForm}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={updateForm}
            />

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={closeForm}>
                Cancel
              </button>

              <button type="submit" className="save-button">
                {editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

export default App
