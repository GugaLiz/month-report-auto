import dayjs from 'dayjs'
import { getDateRange } from './date.js'
import { isHoliday } from '../data/holidays.js'

/**
 * 判断是否为周末
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {boolean} 是否为周末
 */
export function isWeekend(dateStr) {
  const day = dayjs(dateStr).day()
  return day === 0 || day === 6
}

/**
 * 计算指定日期范围内的工作日天数
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {number} 工作日天数
 */
export function calculateWorkDays(startDate, endDate) {
  const dates = getDateRange(startDate, endDate)
  let workDays = 0
  
  dates.forEach(date => {
    // 跳过周末
    if (isWeekend(date)) {
      return
    }
    
    // 跳过法定节假日
    if (isHoliday(date)) {
      return
    }
    
    workDays++
  })
  
  return workDays
}

/**
 * 计算某个月的工作日天数
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {number} 工作日天数
 */
export function calculateMonthWorkDays(year, month) {
  const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
  const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')
  return calculateWorkDays(startDate, endDate)
}

/**
 * 获取日期范围内的详细日历信息
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Array<Object>} 日历信息数组
 */
export function getCalendarInfo(startDate, endDate) {
  const dates = getDateRange(startDate, endDate)
  
  return dates.map(date => {
    const isWeekendDay = isWeekend(date)
    const isHolidayDay = isHoliday(date)
    const isWorkDay = !isWeekendDay && !isHolidayDay
    
    return {
      date,
      day: dayjs(date).format('DD'),
      dayOfWeek: getDayOfWeekName(date),
      isWeekend: isWeekendDay,
      isHoliday: isHolidayDay,
      isWorkDay: isWorkDay,
      holidayName: isHolidayDay ? getHolidayName(date) : null
    }
  })
}

/**
 * 获取星期名称
 * @param {string} dateStr - 日期字符串
 * @returns {string} 星期名称
 */
export function getDayOfWeekName(dateStr) {
  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const day = dayjs(dateStr).day()
  return weekNames[day]
}

/**
 * 统计日期范围内的天数类型
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Object} 统计结果
 */
export function countDayTypes(startDate, endDate) {
  const dates = getDateRange(startDate, endDate)
  
  let totalDays = dates.length
  let workDays = 0
  let weekendDays = 0
  let holidayDays = 0
  
  dates.forEach(date => {
    if (isWeekend(date)) {
      weekendDays++
    } else if (isHoliday(date)) {
      holidayDays++
    } else {
      workDays++
    }
  })
  
  return {
    totalDays,
    workDays,
    weekendDays,
    holidayDays
  }
}
