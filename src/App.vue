<script setup>
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'todos'

const newTodo = ref('')
const newDueDate = ref('')
const todos = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))

watch(
  todos,
  (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
  { deep: true },
)

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.push({ text, done: false, dueDate: newDueDate.value || null })
  newTodo.value = ''
  newDueDate.value = ''
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.done) return false
  const today = new Date().toISOString().slice(0, 10)
  return todo.dueDate < today
}

function deleteTodo(index) {
  todos.value.splice(index, 1)
}

function clearCompleted() {
  todos.value = todos.value.filter((todo) => !todo.done)
}

const draggedIndex = ref(null)

function startDrag(index) {
  draggedIndex.value = index
}

function dropAt(index) {
  if (draggedIndex.value === null || draggedIndex.value === index) return
  const [moved] = todos.value.splice(draggedIndex.value, 1)
  todos.value.splice(index, 0, moved)
  draggedIndex.value = null
}

const editingTodo = ref(null)
const editingText = ref('')

function startEditing(todo) {
  editingTodo.value = todo
  editingText.value = todo.text
}

function focusOnMount(element) {
  element?.focus()
}

function saveEdit(todo) {
  if (editingTodo.value !== todo) return
  const text = editingText.value.trim()
  if (text) todo.text = text
  editingTodo.value = null
}

function cancelEdit() {
  editingTodo.value = null
}

const remaining = computed(() => todos.value.filter((todo) => !todo.done).length)

const filter = ref('all')

const filteredTodos = computed(() => {
  return todos.value
    .map((todo, index) => ({ todo, index }))
    .filter(({ todo }) => {
      if (filter.value === 'active') return !todo.done
      if (filter.value === 'completed') return todo.done
      return true
    })
})

const darkModeQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
const prefersDark = ref(darkModeQuery?.matches ?? false)
darkModeQuery?.addEventListener('change', (event) => {
  prefersDark.value = event.matches
})
</script>

<template>
  <div class="app" :class="{ dark: prefersDark }">
  <h1>Todo</h1>
  <form @submit.prevent="addTodo">
    <input v-model="newTodo" type="text" placeholder="Add a todo" aria-label="New todo" />
    <input v-model="newDueDate" type="date" aria-label="Due date" />
    <button type="submit">Add</button>
  </form>
  <div role="group" aria-label="Filter todos">
    <button
      type="button"
      :aria-pressed="filter === 'all'"
      :class="{ active: filter === 'all' }"
      @click="filter = 'all'"
    >
      All
    </button>
    <button
      type="button"
      :aria-pressed="filter === 'active'"
      :class="{ active: filter === 'active' }"
      @click="filter = 'active'"
    >
      Active
    </button>
    <button
      type="button"
      :aria-pressed="filter === 'completed'"
      :class="{ active: filter === 'completed' }"
      @click="filter = 'completed'"
    >
      Completed
    </button>
  </div>
  <ul>
    <li
      v-for="{ todo, index } in filteredTodos"
      :key="index"
      :class="{ done: todo.done, overdue: isOverdue(todo) }"
      draggable="true"
      @dragstart="startDrag(index)"
      @dragover.prevent
      @drop="dropAt(index)"
    >
      <label v-if="editingTodo !== todo">
        <input type="checkbox" v-model="todo.done" :aria-label="`Mark ${todo.text} as done`" />
        <span @dblclick="startEditing(todo)">{{ todo.text }}</span>
        <span v-if="todo.dueDate" class="due-date">Due {{ todo.dueDate }}</span>
      </label>
      <input
        v-else
        :ref="focusOnMount"
        type="text"
        v-model="editingText"
        :aria-label="`Edit ${todo.text}`"
        @blur="saveEdit(todo)"
        @keyup.enter="saveEdit(todo)"
        @keyup.esc="cancelEdit"
      />
      <button type="button" @click="deleteTodo(index)" :aria-label="`Delete ${todo.text}`">
        Delete
      </button>
    </li>
  </ul>
  <div class="footer">
    <p>{{ remaining }} item{{ remaining === 1 ? '' : 's' }} left</p>
    <button type="button" @click="clearCompleted">Clear completed</button>
  </div>
  </div>
</template>

<style>
body {
  margin: 0;
  min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #1e2328;
  }
}

@media (prefers-color-scheme: light) {
  body {
    background: #f4f6f8;
  }
}
</style>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  --bg: #f4f6f8;
  --surface: #fff;
  --border: #d7dce1;
  --border-strong: #e5e9ec;
  --text: #2c3e50;
  --text-muted: #6b7280;
  --text-done: #9aa5ad;

  max-width: 32rem;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  color: var(--text);
}

.app.dark {
  --bg: #1e2328;
  --surface: #262b31;
  --border: #3a4047;
  --border-strong: #343a40;
  --text: #e5e9ec;
  --text-muted: #9aa5ad;
  --text-done: #6b7280;
}

h1 {
  margin: 0 0 1rem;
  color: var(--text);
}

form {
  margin: 0 0 1rem;
  display: flex;
  gap: 0.5rem;
}

form input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--surface);
  color: var(--text);
}

form input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.2);
}

button {
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  padding: 0.5rem 0.9rem;
  font-size: 0.95rem;
  color: var(--text);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

button:hover {
  background: var(--bg);
}

form button[type='submit'] {
  background: #42b883;
  border-color: #42b883;
  color: #fff;
}

form button[type='submit']:hover {
  background: #369e70;
}

[role='group'] {
  margin: 0 0 1rem;
  display: flex;
  gap: 0.5rem;
}

[role='group'] button.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
  font-weight: 600;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

li label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

li input[type='checkbox'] {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #42b883;
}

li input[type='text'] {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid #42b883;
  border-radius: 6px;
  font-size: 1rem;
  background: var(--surface);
  color: var(--text);
}

li.done span {
  color: var(--text-done);
}

li button[aria-label^='Delete'] {
  border-color: transparent;
  background: transparent;
  color: #c0392b;
}

li button[aria-label^='Delete']:hover {
  background: #fdecea;
  border-color: #f5c6c0;
}

.footer {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer p {
  margin: 0;
  color: var(--text-muted);
}

.done {
  text-decoration: line-through;
}

.overdue {
  color: red;
}
</style>
