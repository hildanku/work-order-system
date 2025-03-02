export const recalculatePage = (currentPage: number, totalRow: number, deletedDataLength: number, limit: number) => {
    let page = currentPage
    const totalItem = totalRow - deletedDataLength
    const totalPage = Math.ceil(totalItem / limit)
    const diffPage = totalPage - page
    if (diffPage < 0) {
        page = page - Math.abs(diffPage)
    }

    return page
}
