import { describe, it, expect, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a todo item to the list when submitted', async () => {
    const wrapper = mount(App)

    await wrapper.find('input').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(1)
    expect(items[0].find('label').text()).toBe('Buy milk')
  })

  it('clears the input after adding a todo', async () => {
    const wrapper = mount(App)

    await wrapper.find('input').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('input').element.value).toBe('')
  })

  it('does not add empty todos', async () => {
    const wrapper = mount(App)

    await wrapper.find('input').setValue('   ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('marks a todo item as done when its checkbox is checked', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)

    expect(checkbox.element.checked).toBe(true)
    expect(wrapper.find('li').classes()).toContain('done')
  })

  it('removes a todo item from the list when deleted', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    await wrapper.find('[aria-label="Delete Buy milk"]').trigger('click')

    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('shows how many todo items are left', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('input[type="text"]').setValue('Walk dog')
    await wrapper.find('form').trigger('submit')

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)

    expect(wrapper.find('p').text()).toBe('1 item left')
  })

  it('shows only active or completed todos when filtered', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('input[type="text"]').setValue('Walk dog')
    await wrapper.find('form').trigger('submit')

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)

    const buttons = wrapper.findAll('button')
    const activeFilter = buttons.find((button) => button.text() === 'Active')
    const completedFilter = buttons.find((button) => button.text() === 'Completed')

    await activeFilter.trigger('click')
    expect(wrapper.findAll('li').map((item) => item.find('label').text())).toEqual(['Walk dog'])

    await completedFilter.trigger('click')
    expect(wrapper.findAll('li').map((item) => item.find('label').text())).toEqual(['Buy milk'])
  })

  it('removes all completed todos when clear completed is clicked', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('input[type="text"]').setValue('Walk dog')
    await wrapper.find('form').trigger('submit')

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true)

    const buttons = wrapper.findAll('button')
    const clearCompleted = buttons.find((button) => button.text() === 'Clear completed')
    await clearCompleted.trigger('click')

    expect(wrapper.findAll('li').map((item) => item.find('label').text())).toEqual(['Walk dog'])
  })

  it('edits a todo item text on double click', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    await wrapper.find('li span').trigger('dblclick')
    const editInput = wrapper.find('li input[type="text"]')
    await editInput.setValue('Buy oat milk')
    await editInput.trigger('keyup.enter')

    expect(wrapper.find('li label').text()).toBe('Buy oat milk')
  })

  it('does not clear a todo item when edited to an empty value', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    await wrapper.find('li span').trigger('dblclick')
    const editInput = wrapper.find('li input[type="text"]')
    await editInput.setValue('   ')
    await editInput.trigger('keyup.enter')

    expect(wrapper.find('li label').text()).toBe('Buy milk')
  })

  it('cancels an edit on escape without saving', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    await wrapper.find('li span').trigger('dblclick')
    const editInput = wrapper.find('li input[type="text"]')
    await editInput.setValue('Buy oat milk')
    await editInput.trigger('keyup.esc')
    await editInput.trigger('blur')

    expect(wrapper.find('li label').text()).toBe('Buy milk')
  })

  it('keeps editing the right todo when an earlier row is deleted', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('input[type="text"]').setValue('Walk dog')
    await wrapper.find('form').trigger('submit')

    await wrapper.findAll('li span')[1].trigger('dblclick')
    await wrapper.find('[aria-label="Delete Buy milk"]').trigger('click')

    const editInput = wrapper.find('li input[type="text"]')
    await editInput.setValue('Walk the dog')
    await editInput.trigger('keyup.enter')

    expect(wrapper.find('li label').text()).toBe('Walk the dog')
  })

  it('reorders todos when one is dragged onto another', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('input[type="text"]').setValue('Walk dog')
    await wrapper.find('form').trigger('submit')

    const items = wrapper.findAll('li')
    await items[0].trigger('dragstart')
    await items[1].trigger('drop')

    expect(wrapper.findAll('li').map((item) => item.find('label').text())).toEqual([
      'Walk dog',
      'Buy milk',
    ])
  })

  it('highlights a todo as overdue when its due date has passed', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('input[type="date"]').setValue('2000-01-01')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('li').classes()).toContain('overdue')
  })

  it('does not highlight a todo without a due date', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('li').classes()).not.toContain('overdue')
  })

  it('does not highlight a completed todo even if its due date has passed', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('input[type="date"]').setValue('2000-01-01')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('input[type="checkbox"]').setValue(true)

    expect(wrapper.find('li').classes()).not.toContain('overdue')
  })

  it('keeps todos after the page is reloaded', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    const reloaded = mount(App)
    const items = reloaded.findAll('li')
    expect(items).toHaveLength(1)
    expect(items[0].find('label').text()).toBe('Buy milk')
  })

  it('follows the system dark mode setting', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = (query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: () => {},
    })

    const wrapper = mount(App)

    expect(wrapper.find('.app').classes()).toContain('dark')

    window.matchMedia = originalMatchMedia
  })
})
