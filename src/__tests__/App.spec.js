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

  it('keeps todos after the page is reloaded', async () => {
    const wrapper = mount(App)

    await wrapper.find('input[type="text"]').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    const reloaded = mount(App)
    const items = reloaded.findAll('li')
    expect(items).toHaveLength(1)
    expect(items[0].find('label').text()).toBe('Buy milk')
  })
})
