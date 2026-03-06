/**
 * K线分类规则和计算工具
 */

/**
 * K线分类规则
 */
export const K_LINE_RULES = {
  K1: ['剑网3', '剑网三'],
  K2: ['剑网一', '剑网1', '剑网2', '剑网二', '剑侠情缘', '剑侠世界'],
  K3: ['尘白'],
  K8: ['解限机', '解限'],
  SSG: ['SEED', 'seed', '星砂岛']
}

/**
 * K线分类顺序（用于优先级匹配）
 */
const K_LINE_ORDER = ['K1', 'K2', 'K3', 'K8', 'SSG']

/**
 * 根据任务标题判断所属 K线
 * @param {string} title - 任务标题
 * @returns {string} K线类型（K1/K2/K3/K8/SSG/OTHER）
 */
export function classifyTask(title) {
  if (!title) return 'OTHER'
  
  // 按优先级顺序匹配
  for (const kLine of K_LINE_ORDER) {
    const keywords = K_LINE_RULES[kLine]
    if (keywords.some(keyword => title.includes(keyword))) {
      return kLine
    }
  }
  
  return 'OTHER'
}

/**
 * 计算各 K线的工时（小时）
 * @param {Array<Object>} tasks - 任务列表
 * @param {Object} taskTimeMap - 任务工时映射 { taskId: hours }
 * @returns {Object} K线工时统计 { K1: 16, K2: 40, ... }
 */
export function calculateKLineHours(tasks, taskTimeMap) {
  const kLineHours = {}
  
  tasks.forEach(task => {
    const title = task.parentTitle || task.title || ''
    const kLine = classifyTask(title)
    const hours = taskTimeMap[task.id] || 0
    
    kLineHours[kLine] = (kLineHours[kLine] || 0) + hours
  })
  
  return kLineHours
}

/**
 * 将工时转换为天数
 * @param {number} hours - 工时（小时）
 * @param {number} hoursPerDay - 每天工作小时数，默认8小时
 * @returns {number} 天数（保留一位小数）
 */
export function hoursToDays(hours, hoursPerDay = 8) {
  return Math.round((hours / hoursPerDay) * 10) / 10
}

/**
 * 计算各 K线的工作天数
 * @param {Array<Object>} tasks - 任务列表
 * @param {Object} taskTimeMap - 任务工时映射
 * @returns {Object} K线天数统计 { K1: 2, K2: 5, ... }
 */
export function calculateKLineDays(tasks, taskTimeMap) {
  const kLineHours = calculateKLineHours(tasks, taskTimeMap)
  const kLineDays = {}
  
  for (const [kLine, hours] of Object.entries(kLineHours)) {
    kLineDays[kLine] = hoursToDays(hours)
  }
  
  return kLineDays
}

/**
 * 格式化 K线统计结果用于显示
 * @param {Object} kLineDays - K线天数统计
 * @param {number} vacationDays - 年假天数，默认0
 * @param {number} compensatoryDays - 调休天数，默认0
 * @param {number} parentalLeaveDays - 育儿假天数，默认0
 * @returns {Array<Object>} 格式化后的数组 [{ name: 'K1', days: 2 }, ...]
 */
export function formatKLineStats(kLineDays, vacationDays = 0, compensatoryDays = 0, parentalLeaveDays = 0) {
  const stats = []
  
  // 添加 K线统计
  for (const kLine of K_LINE_ORDER) {
    const days = kLineDays[kLine] || 0
    if (days > 0) {
      stats.push({
        name: kLine,
        days: days,
        hours: days * 8
      })
    }
  }
  
  // 添加其他项目
  if (kLineDays.OTHER) {
    stats.push({
      name: '其他',
      days: kLineDays.OTHER,
      hours: kLineDays.OTHER * 8
    })
  }
  
  // 添加年假
  if (vacationDays > 0) {
    stats.push({
      name: '年假',
      days: vacationDays,
      hours: vacationDays * 8
    })
  }
  
  // 添加调休
  if (compensatoryDays > 0) {
    stats.push({
      name: '调休',
      days: compensatoryDays,
      hours: compensatoryDays * 8
    })
  }
  
  // 添加育儿假
  if (parentalLeaveDays > 0) {
    stats.push({
      name: '育儿假',
      days: parentalLeaveDays,
      hours: parentalLeaveDays * 8
    })
  }
  
  // 计算总计
  const totalDays = stats.reduce((sum, item) => sum + item.days, 0)
  stats.push({
    name: '总计',
    days: totalDays,
    hours: totalDays * 8,
    isTotal: true
  })
  
  return stats
}

/**
 * 获取 K线的显示颜色
 * @param {string} kLine - K线名称
 * @returns {string} 颜色代码
 */
export function getKLineColor(kLine) {
  const colorMap = {
    K1: '#409EFF',
    K2: '#67C23A',
    K3: '#E6A23C',
    K8: '#F56C6C',
    SSG: '#909399',
    OTHER: '#C0C4CC',
    '年假': '#409EFF',
    '调休': '#67C23A',
    '总计': '#303133'
  }
  return colorMap[kLine] || '#C0C4CC'
}
