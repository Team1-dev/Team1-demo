import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('adds a todo item to the list when submitted', async () => {
    const wrapper = mount(App)

    await wrapper.find('input').setValue('Buy milk')
    await wrapper.find('form').trigger('submit')

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toBe('Buy milk')
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
})
