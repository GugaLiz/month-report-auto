import dayjs from 'dayjs'

/**
 * 日期转时间戳（秒）
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {number} Unix时间戳（秒）
 */
export function dateToTimestamp(dateStr) {
  const date = dayjs(dateStr).startOf('day')
  return Math.floor(date.valueOf() / 1000)
}

/**
 * 日期转结束时间戳（当天23:59:59）
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {number} Unix时间戳（秒）
 */
export function dateToEndTimestamp(dateStr) {
  const date = dayjs(dateStr).endOf('day')
  return Math.floor(date.valueOf() / 1000)
}

/**
 * 时间戳转日期字符串
 * @param {number} timestamp - Unix时间戳（秒）
 * @returns {string} 日期字符串 (YYYY-MM-DD)
 */
export function timestampToDate(timestamp) {
  return dayjs(timestamp * 1000).format('YYYY-MM-DD')
}

/**
 * 获取当月第一天
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {string} 月初日期 (YYYY-MM-DD)
 */
export function getMonthStart(dateStr) {
  return dayjs(dateStr).startOf('month').format('YYYY-MM-DD')
}

/**
 * 获取当月最后一天
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {string} 月末日期 (YYYY-MM-DD)
 */
export function getMonthEnd(dateStr) {
  return dayjs(dateStr).endOf('month').format('YYYY-MM-DD')
}

/**
 * 获取当前日期
 * @returns {string} 当前日期 (YYYY-MM-DD)
 */
export function getCurrentDate() {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * 获取当月第一天和最后一天
 * @returns {Object} { start: string, end: string }
 */
export function getCurrentMonthRange() {
  const now = dayjs()
  return {
    start: now.startOf('month').format('YYYY-MM-DD'),
    end: now.endOf('month').format('YYYY-MM-DD')
  }
}

/**
 * 格式化日期显示
 * @param {string} dateStr - 日期字符串
 * @param {string} format - 格式化模板，默认 'YYYY年MM月DD日'
 * @returns {string} 格式化后的日期
 */
export function formatDate(dateStr, format = 'YYYY年MM月DD日') {
  return dayjs(dateStr).format(format)
}

/**
 * 获取两个日期之间相差的天数
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {number} 相差天数
 */
export function getDaysDiff(startDate, endDate) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  return end.diff(start, 'day')
}

/**
 * 获取日期范围内的所有日期
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Array<string>} 日期数组
 */
export function getDateRange(startDate, endDate) {
  const dates = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)
  
  while (current.isBefore(end) || current.isSame(end)) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  
  return dates
}
