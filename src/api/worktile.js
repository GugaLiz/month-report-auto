import axios from 'axios'
import { dateToTimestamp, dateToEndTimestamp } from '../utils/date.js'
import { getCookie, getProjectIds, getMemberId } from '../utils/storage.js'

/**
 * API 基础配置
 * 开发环境使用代理，生产环境使用完整 URL
 */
const API_BASE_URL = import.meta.env.DEV ? '' : 'https://webxsj.worktile.com'

/**
 * 创建 axios 实例
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  },
  withCredentials: false
})

/**
 * 请求拦截器 - 添加 Cookie
 */
apiClient.interceptors.request.use(
  config => {
    const cookie = getCookie()
    if (cookie) {
      // 在开发环境中，通过自定义头传递 Cookie（代理会将其转换为真正的 Cookie 头）
      config.headers['x-worktile-cookie'] = cookie
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器 - 统一处理错误
 */
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求失败:', error)
    return Promise.reject(error)
  }
)

/**
 * 获取工时数据
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 工时数据
 */
export async function fetchWorkloadData(startDate, endDate) {
  const params = {
    created_at: {
      start: dateToTimestamp(startDate),
      end: dateToEndTimestamp(endDate)
    },
    reported_at: {
      start: null,
      end: null
    },
    project_ids: getProjectIds(),
    member_ids: [getMemberId()],
    group_by: 'day',
    entry_type: 1,
    type_ids: []
  }

  try {
    const response = await apiClient.post(
      '/api/mission-vnext/workload/report/workload-day-detail/group',
      params
    )
    return response
  } catch (error) {
    throw new Error(`获取工时数据失败: ${error.message}`)
  }
}

/**
 * 解析工时数据
 * @param {Object} data - API 返回的原始数据
 * @returns {Object} 解析后的数据
 */
export function parseWorkloadData(data) {
  if (!data || !data.data || !data.data.references) {
    throw new Error('数据格式错误')
  }

  const references = data.data.references
  const tasks = references.tasks || []
  const entries = references.entries || []

  // 构建任务工时映射表 { taskId: totalHours }
  const taskTimeMap = {}
  entries.forEach(entry => {
    const taskId = entry.task_id
    const duration = entry.duration || 0
    taskTimeMap[taskId] = (taskTimeMap[taskId] || 0) + duration
  })

  // 提取任务列表（去重和增强信息）
  const taskList = tasks.map(task => ({
    id: task._id,
    title: task.title,
    identifier: task.identifier,
    parentId: task.parent_id,
    parentTitle: task.parent?.title || '',
    projectId: task.project_id,
    hours: taskTimeMap[task._id] || 0
  }))

  // 按父任务分组
  const groupedByParent = {}
  taskList.forEach(task => {
    const parentTitle = task.parentTitle || '未分类'
    if (!groupedByParent[parentTitle]) {
      groupedByParent[parentTitle] = {
        parentTitle,
        tasks: [],
        totalHours: 0
      }
    }
    groupedByParent[parentTitle].tasks.push(task)
    groupedByParent[parentTitle].totalHours += task.hours
  })

  // 转换为数组并排序
  const workList = Object.values(groupedByParent)
    .filter(item => item.totalHours > 0)
    .sort((a, b) => b.totalHours - a.totalHours)

  return {
    tasks: taskList,
    taskTimeMap,
    workList,
    entries,
    rawData: data
  }
}

/**
 * 测试 Cookie 是否有效
 * @returns {Promise<boolean>} Cookie 是否有效
 */
export async function testCookie() {
  try {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    await fetchWorkloadData(dateStr, dateStr)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 导出原始 axios 实例（用于其他自定义请求）
 */
export { apiClient }
