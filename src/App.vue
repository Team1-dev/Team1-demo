<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([])

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.push({ text, done: false })
  newTodo.value = ''
}

function deleteTodo(index) {
  todos.value.splice(index, 1)
}
</script>

<template>
  <h1>Todo</h1>
  <form @submit.prevent="addTodo">
    <input v-model="newTodo" type="text" placeholder="Add a todo" aria-label="New todo" />
    <button type="submit">Add</button>
  </form>
  <ul>
    <li v-for="(todo, index) in todos" :key="index" :class="{ done: todo.done }">
      <label>
        <input type="checkbox" v-model="todo.done" :aria-label="`Mark ${todo.text} as done`" />
        {{ todo.text }}
      </label>
      <button type="button" @click="deleteTodo(index)" :aria-label="`Delete ${todo.text}`">
        Delete
      </button>
    </li>
  </ul>
</template>

<style scoped>
.done {
  text-decoration: line-through;
}
</style>
