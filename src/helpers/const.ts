export const LIMIT = 10
export const SORT = 'created_at'
export const ORDER = 'DESC'
export const AVATAR_UPLOAD_PATH = './src/public/avatar'
export const PRODUCT_UPLOAD_PATH = './src/public/product/'
export const ROLE = ['production_manager', 'operator'] as const
export const ROLE_OBJ = {
    production_manager: 'Production Manager',
    operator: 'Operator'
}
export const WORK_ORDER_STATUS = ['pending', 'in_progress', 'completed', 'canceled'] as const
export const WORK_ORDER_STATUS_OBJ = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    canceled: 'Canceled',
}
