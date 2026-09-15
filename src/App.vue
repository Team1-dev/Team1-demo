<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const todos = ref([])

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.push(text)
  newTodo.value = ''
}
</script>

<template>
  <h1>Todo</h1>
  <form @submit.prevent="addTodo">
    <input v-model="newTodo" type="text" placeholder="Add a todo" aria-label="New todo" />
    <button type="submit">Add</button>
  </form>
  <ul>
    <li v-for="(todo, index) in todos" :key="index">{{ todo }}</li>
  </ul>
</template>

<style scoped></style>
