<script setup>
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'todos'

const newTodo = ref('')
const todos = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))

watch(
  todos,
  (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
  { deep: true },
)

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.push({ text, done: false })
  newTodo.value = ''
}

function deleteTodo(index) {
  todos.value.splice(index, 1)
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
</script>

<template>
  <h1>Todo</h1>
  <form @submit.prevent="addTodo">
    <input v-model="newTodo" type="text" placeholder="Add a todo" aria-label="New todo" />
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
    <li v-for="{ todo, index } in filteredTodos" :key="index" :class="{ done: todo.done }">
      <label>
        <input type="checkbox" v-model="todo.done" :aria-label="`Mark ${todo.text} as done`" />
        {{ todo.text }}
      </label>
      <button type="button" @click="deleteTodo(index)" :aria-label="`Delete ${todo.text}`">
        Delete
      </button>
    </li>
  </ul>
  <p>{{ remaining }} item{{ remaining === 1 ? '' : 's' }} left</p>
</template>

<style scoped>
.done {
  text-decoration: line-through;
}

.active {
  font-weight: bold;
}
</style>
