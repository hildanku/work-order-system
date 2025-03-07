
import type { HTMLInputAttributes } from 'svelte/elements'
import type { Writable } from 'svelte/store'

export type DropdownItem<T = string> = { label: string; value: T }

export type AsyncComboboxProps<T> = {
    class?: string
    items: Writable<DropdownItem[]>
    placeholder?: string
    open?: boolean
    loadFn: (search: string) => Promise<DropdownItem<string>[]>
    onSelect?: (originalData: T) => void
} & HTMLInputAttributes
