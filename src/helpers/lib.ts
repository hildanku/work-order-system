export function generateOrderCode(lastOrderNumber: number | null = null): string {

    const today = new Date()
    const datePart = today.toISOString().split('T')[0].replace(/-/g, '')
    // YYYYMMDD

    let newOrderNumber = lastOrderNumber ? lastOrderNumber + 1 : 1

    const orderNumberPart = String(newOrderNumber).padStart(3, '0')

    return `WO-${datePart}-${orderNumberPart}`
}
