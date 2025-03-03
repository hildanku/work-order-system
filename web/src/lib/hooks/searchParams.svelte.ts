import { page } from '$app/stores'
import { get } from 'svelte/store'

export class SearchParams {
	get page() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return Number(searchParams.get('page') || '1')
	}

	get limit() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return Number(searchParams.get('limit') || '10')
	}

	get sort() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return searchParams.get('sort') ?? 'created_at'
	}

	get order() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return searchParams.get('order') ?? 'DESC'
	}

	get search() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return searchParams.get('q') ?? ''
	}

	get basePriceMax() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return Number(searchParams.get('basePriceMax')) ?? 0
	}

	get basePriceMin() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return Number(searchParams.get('basePriceMin')) ?? 0
	}

	get category() {
		const searchParams = new URLSearchParams(get(page).url.searchParams)
		return Number(searchParams.get('cat')) ?? 0
	}
}
