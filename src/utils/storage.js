/**
 * 本地存储工具类
 */

const STORAGE_PREFIX = 'month_report_'

/**
 * Cookie 存储键
 */
export const STORAGE_KEYS = {
  COOKIE: `${STORAGE_PREFIX}worktile_cookie`,
  PROJECT_IDS: `${STORAGE_PREFIX}project_ids`,
  MEMBER_ID: `${STORAGE_PREFIX}member_id`,
  HISTORY: `${STORAGE_PREFIX}history`
}

/**
 * 保存数据到 localStorage
 * @param {string} key - 键名
 * @param {any} value - 值
 */
export function setStorage(key, value) {
  try {
    const jsonValue = JSON.stringify(value)
    localStorage.setItem(key, jsonValue)
    return true
  } catch (error) {
    console.error('保存到本地存储失败:', error)
    return false
  }
}

/**
 * 从 localStorage 获取数据
 * @param {string} key - 键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储的值或默认值
 */
export function getStorage(key, defaultValue = null) {
  try {
    const jsonValue = localStorage.getItem(key)
    return jsonValue ? JSON.parse(jsonValue) : defaultValue
  } catch (error) {
    console.error('从本地存储读取失败:', error)
    return defaultValue
  }
}

/**
 * 删除 localStorage 中的数据
 * @param {string} key - 键名
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('删除本地存储失败:', error)
    return false
  }
}

/**
 * 清空所有存储
 */
export function clearAllStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('清空本地存储失败:', error)
    return false
  }
}

/**
 * 保存 Cookie
 * @param {string} cookie - Cookie 字符串
 */
export function saveCookie(cookie) {
  return setStorage(STORAGE_KEYS.COOKIE, cookie)
}

/**
 * 获取 Cookie
 * @returns {string|null} Cookie 字符串
 */
export function getCookie() {
  return getStorage(STORAGE_KEYS.COOKIE, null)
}

/**
 * 保存项目 ID 列表
 * @param {Array<string>} projectIds - 项目 ID 数组
 */
export function saveProjectIds(projectIds) {
  return setStorage(STORAGE_KEYS.PROJECT_IDS, projectIds)
}

/**
 * 获取项目 ID 列表
 * @returns {Array<string>} 项目 ID 数组
 */
export function getProjectIds() {
  return getStorage(STORAGE_KEYS.PROJECT_IDS, [
    '66a9fd0526a6ce0007bc2c73',
    '621ed84824cdc85eafdf9195'
  ])
}

/**
 * 保存成员 ID
 * @param {string} memberId - 成员 ID
 */
export function saveMemberId(memberId) {
  return setStorage(STORAGE_KEYS.MEMBER_ID, memberId)
}

/**
 * 获取成员 ID
 * @returns {string} 成员 ID
 */
export function getMemberId() {
  return getStorage(STORAGE_KEYS.MEMBER_ID, '0fa3263e47624b1e8b40e278a93bd074')
}

/**
 * 保存历史记录
 * @param {Object} record - 历史记录对象
 */
export function saveHistory(record) {
  const history = getHistory()
  const newRecord = {
    ...record,
    timestamp: Date.now(),
    id: generateId()
  }
  history.unshift(newRecord)
  
  // 最多保留 20 条历史记录
  if (history.length > 20) {
    history.length = 20
  }
  
  return setStorage(STORAGE_KEYS.HISTORY, history)
}

/**
 * 获取历史记录列表
 * @returns {Array<Object>} 历史记录数组
 */
export function getHistory() {
  return getStorage(STORAGE_KEYS.HISTORY, [])
}

/**
 * 删除指定历史记录
 * @param {string} id - 记录 ID
 */
export function deleteHistory(id) {
  const history = getHistory()
  const filtered = history.filter(item => item.id !== id)
  return setStorage(STORAGE_KEYS.HISTORY, filtered)
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
