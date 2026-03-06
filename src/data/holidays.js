/**
 * 节假日数据配置
 * 格式：{ '日期': '节假日名称' }
 */

// 2026年节假日
export const HOLIDAYS_2026 = {
  '2026-01-01': '元旦',
  '2026-01-02': '元旦',
  '2026-01-03': '元旦',
  '2026-02-17': '春节',
  '2026-02-18': '春节',
  '2026-02-19': '春节',
  '2026-02-20': '春节',
  '2026-02-21': '春节',
  '2026-02-22': '春节',
  '2026-02-23': '春节',
  '2026-04-05': '清明节',
  '2026-04-06': '清明节',
  '2026-04-07': '清明节',
  '2026-05-01': '劳动节',
  '2026-05-02': '劳动节',
  '2026-05-03': '劳动节',
  '2026-05-04': '劳动节',
  '2026-05-05': '劳动节',
  '2026-06-19': '端午节',
  '2026-06-20': '端午节',
  '2026-06-21': '端午节',
  '2026-09-27': '中秋节',
  '2026-10-01': '国庆节',
  '2026-10-02': '国庆节',
  '2026-10-03': '国庆节',
  '2026-10-04': '国庆节',
  '2026-10-05': '国庆节',
  '2026-10-06': '国庆节',
  '2026-10-07': '国庆节',
  '2026-10-08': '国庆节'
}

// 2027年节假日（可继续补充）
export const HOLIDAYS_2027 = {
  '2027-01-01': '元旦',
  '2027-01-02': '元旦',
  '2027-01-03': '元旦',
  // ... 其他节假日待补充
}

// 所有年份节假日汇总
export const ALL_HOLIDAYS = {
  2026: HOLIDAYS_2026,
  2027: HOLIDAYS_2027
}

/**
 * 获取指定年份的节假日列表
 * @param {number} year - 年份
 * @returns {Object} 节假日对象
 */
export function getHolidaysByYear(year) {
  return ALL_HOLIDAYS[year] || {}
}

/**
 * 判断指定日期是否为节假日
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {boolean} 是否为节假日
 */
export function isHoliday(dateStr) {
  const year = parseInt(dateStr.substring(0, 4))
  const holidays = getHolidaysByYear(year)
  return !!holidays[dateStr]
}

/**
 * 获取节假日名称
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {string|null} 节假日名称
 */
export function getHolidayName(dateStr) {
  const year = parseInt(dateStr.substring(0, 4))
  const holidays = getHolidaysByYear(year)
  return holidays[dateStr] || null
}
