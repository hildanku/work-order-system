
import { page } from '$app/stores';
import { get } from 'svelte/store';

export class SearchParams {
    private searchParams: URLSearchParams;

    constructor() {
        this.searchParams = new URLSearchParams(get(page).url.searchParams);
    }

    private getParam<T>(key: string, defaultValue: T, parser: (value: string) => T): T {
        const value = this.searchParams.get(key);
        return value !== null ? parser(value) : defaultValue;
    }

    get page() {
        return this.getParam('page', 1, Number);
    }

    get limit() {
        return this.getParam('limit', 10, Number);
    }

    get sort() {
        return this.getParam('sort', 'created_at', String);
    }

    get order() {
        return this.getParam('order', 'DESC', String);
    }

    get search() {
        return this.getParam('q', '', String);
    }

    get basePriceMax() {
        return this.getParam('basePriceMax', 0, Number);
    }

    get basePriceMin() {
        return this.getParam('basePriceMin', 0, Number);
    }

    get category() {
        return this.getParam('cat', 0, Number);
    }
}
