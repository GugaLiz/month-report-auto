// 等待所有依赖加载完成
document.addEventListener('DOMContentLoaded', () => {
  const { createApp, ref, computed, onMounted } = Vue
  const ElementPlusIconsVue = window.ElementPlusIconsVue

  // 节假日数据
  const HOLIDAYS_2026 = {
    '2026-01-01': '元旦',
    '2026-01-02': '元旦',
    '2026-01-03': '元旦',
    '2026-02-17': '春节',
    '2026-02-18': '春节',
    '2026-02-19': '春节',
    '2026-02-20': '春节',
    '2026-02-21': '春节',
    '2026-02-22': '春节',
    '2026-02-23': ' 春节',
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

  // K线分类规则
  const K_LINE_RULES = {
    K1: ['剑网3'],
    K2: ['剑网一', '剑网2', '剑侠情缘', '剑侠世界'],
    K3: ['尘白'],
    K8: ['解限机'],
    SSG: ['SEED', '星砂岛']
  }

  const K_LINE_ORDER = ['K1', 'K2', 'K3', 'K8', 'SSG']

  // 工具函数
  const utils = {
    // 日期转时间戳
    dateToTimestamp(dateStr) {
      const date = dayjs(dateStr).startOf('day')
      return Math.floor(date.valueOf() / 1000)
    },

    dateToEndTimestamp(dateStr) {
      const date = dayjs(dateStr).endOf('day')
      return Math.floor(date.valueOf() / 1000)
    },

    // 获取当月范围
    getCurrentMonthRange() {
      const now = dayjs()
      return {
        start: now.startOf('month').format('YYYY-MM-DD'),
        end: now.endOf('month').format('YYYY-MM-DD')
      }
    },

    // 格式化日期
    formatDate(dateStr, format = 'M月') {
      return dayjs(dateStr).format(format)
    },

    // 判断是否为周末
    isWeekend(dateStr) {
      const day = dayjs(dateStr).day()
      return day === 0 || day === 6
    },

    // 判断是否为节假日
    isHoliday(dateStr) {
      return !!HOLIDAYS_2026[dateStr]
    },

    // 获取日期范围
    getDateRange(startDate, endDate) {
      const dates = []
      let current = dayjs(startDate)
      const end = dayjs(endDate)
      
      while (current.isBefore(end) || current.isSame(end)) {
        dates.push(current.format('YYYY-MM-DD'))
        current = current.add(1, 'day')
      }
      
      return dates
    },

    // 计算工作日
    calculateWorkDays(startDate, endDate) {
      const dates = this.getDateRange(startDate, endDate)
      let workDays = 0
      
      dates.forEach(date => {
        if (!this.isWeekend(date) && !this.isHoliday(date)) {
          workDays++
        }
      })
      
      return workDays
    },

    // K线分类
    classifyTask(title) {
      if (!title) return 'OTHER'
      
      for (const kLine of K_LINE_ORDER) {
        const keywords = K_LINE_RULES[kLine]
        if (keywords.some(keyword => title.includes(keyword))) {
          return kLine
        }
      }
      
      return 'OTHER'
    },

    // 小时转天数
    hoursToDays(hours) {
      return Math.round((hours / 8) * 10) / 10
    },

    // 本地存储
    storage: {
      get(key, defaultValue = null) {
        try {
          const value = localStorage.getItem(key)
          return value ? JSON.parse(value) : defaultValue
        } catch {
          return defaultValue
        }
      },
      set(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
          return true
        } catch {
          return false
        }
      }
    }
  }

  // API 请求
  const api = {
    // 获取工时数据
    async fetchWorkloadData(startDate, endDate, cookie, projectIds, memberId) {
      const params = {
        created_at: {
          start: utils.dateToTimestamp(startDate),
          end: utils.dateToEndTimestamp(endDate)
        },
        reported_at: {
          start: null,
          end: null
        },
        project_ids: projectIds,
        member_ids: [memberId],
        group_by: 'day',
        entry_type: 1,
        type_ids: []
      }

      const response = await axios.post(
        'https://webxsj.worktile.com/api/mission-vnext/workload/report/workload-day-detail/group',
        params,
        {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Cookie': cookie
          }
        }
      )
      
      return response.data
    },

    // 解析工时数据
    parseWorkloadData(data) {
      if (!data || !data.data || !data.data.references) {
        throw new Error('数据格式错误')
      }

      const references = data.data.references
      const tasks = references.tasks || []
      const entries = references.entries || []

      // 构建任务工时映射表
      const taskTimeMap = {}
      entries.forEach(entry => {
        const taskId = entry.task_id
        const duration = entry.duration || 0
        taskTimeMap[taskId] = (taskTimeMap[taskId] || 0) + duration
      })

      // 提取任务列表
      const taskList = tasks.map(task => ({
        id: task._id,
        title: task.title,
        parentTitle: task.parent?.title || '',
        hours: taskTimeMap[task._id] || 0
      }))

      // 按父任务分组
      const groupedByParent = {}
      taskList.forEach(task => {
        const parentTitle = task.parentTitle || '未分类'
        if (!groupedByParent[parentTitle]) {
          groupedByParent[parentTitle] = {
            parentTitle,
            totalHours: 0
          }
        }
        groupedByParent[parentTitle].totalHours += task.hours
      })

      // 转换为数组并排序
      const workList = Object.values(groupedByParent)
        .filter(item => item.totalHours > 0)
        .sort((a, b) => b.totalHours - a.totalHours)

      return {
        tasks: taskList,
        taskTimeMap,
        workList
      }
    }
  }

  // 创建应用
  const app = createApp({
    setup() {
      // 状态
      const startDate = ref('')
      const endDate = ref('')
      const workDays = ref(null)
      const loading = ref(false)
      const hasData = ref(false)
      const workTableData = ref([])
      const kLineStats = ref([])
      const evaluations = ref([])
      const parsedData = ref(null)
      const showSettings = ref(false)

      // 设置
      const settings = ref({
        cookie: utils.storage.get('worktile_cookie', ''),
        memberId: utils.storage.get('member_id', '0fa3263e47624b1e8b40e278a93bd074'),
        projectIds: utils.storage.get('project_ids', [
          '66a9fd0526a6ce0007bc2c73',
          '621ed84824cdc85eafdf9195'
        ])
      })

      const projectIdsText = computed({
        get: () => settings.value.projectIds.join(','),
        set: (val) => {
          settings.value.projectIds = val.split(',').map(id => id.trim()).filter(id => id)
        }
      })

      // 方法
      const quickSelectMonth = () => {
        const range = utils.getCurrentMonthRange()
        startDate.value = range.start
        endDate.value = range.end
        updateWorkDays()
      }

      const updateWorkDays = () => {
        if (startDate.value && endDate.value) {
          workDays.value = utils.calculateWorkDays(startDate.value, endDate.value)
        }
      }

      const saveSettings = () => {
        if (!settings.value.cookie) {
          ElementPlus.ElMessage.warning('请输入 Cookie')
          return
        }
        
        utils.storage.set('worktile_cookie', settings.value.cookie)
        utils.storage.set('member_id', settings.value.memberId)
        utils.storage.set('project_ids', settings.value.projectIds)
        
        ElementPlus.ElMessage.success('设置已保存')
        showSettings.value = false
      }

      const fetchData = async () => {
        if (!startDate.value || !endDate.value) {
          ElementPlus.ElMessage.warning('请选择日期范围')
          return
        }
        
        if (!settings.value.cookie) {
          ElementPlus.ElMessage.warning('请先配置 Cookie')
          showSettings.value = true
          return
        }
        
        try {
          loading.value = true
          
          const rawData = await api.fetchWorkloadData(
            startDate.value,
            endDate.value,
            settings.value.cookie,
            settings.value.projectIds,
            settings.value.memberId
          )
          
          parsedData.value = api.parseWorkloadData(rawData)
          
          generateWorkTable()
          generateKLineStats()
          updateWorkDays()
          
          hasData.value = true
          ElementPlus.ElMessage.success('数据获取成功')
          
        } catch (error) {
          ElementPlus.ElMessage.error('获取数据失败: ' + error.message)
          console.error(error)
        } finally {
          loading.value = false
        }
      }

      const generateWorkTable = () => {
        const month = utils.formatDate(startDate.value, 'M月')
        workTableData.value = parsedData.value.workList.map(item => ({
          time: month,
          workItem: item.parentTitle,
          owner: '',
          progress: '100%',
          selfEval: ''
        }))
      }

      const generateKLineStats = () => {
        const kLineHours = {}
        parsedData.value.tasks.forEach(task => {
          const kLine = utils.classifyTask(task.parentTitle)
          const hours = task.hours || 0
          kLineHours[kLine] = (kLineHours[kLine] || 0) + hours
        })

        const stats = []
        for (const kLine of K_LINE_ORDER) {
          const hours = kLineHours[kLine] || 0
          if (hours > 0) {
            const days = utils.hoursToDays(hours)
            stats.push({ name: kLine, days, hours })
          }
        }

        if (kLineHours.OTHER) {
          const days = utils.hoursToDays(kLineHours.OTHER)
          stats.push({ name: '其他', days, hours: kLineHours.OTHER })
        }

        const totalDays = stats.reduce((sum, item) => sum + item.days, 0)
        const totalHours = stats.reduce((sum, item) => sum + item.hours, 0)
        stats.push({ name: '总计', days: totalDays, hours: totalHours, isTotal: true })

        kLineStats.value = stats
      }

      const generateEvaluation = () => {
        const workItems = parsedData.value.workList.map(item => item.parentTitle)
        
        evaluations.value = [
          `本月主要完成了${workItems.length}个重点项目的开发工作，包括${workItems.slice(0, 3).join('、')}等。在工作中注重代码质量和用户体验，积极与团队成员协作，确保项目按时交付。同时，不断学习新技术，提升自身的技术能力。`,
          
          `本月工作饱和度较高，完成了${workItems.length}个业务需求的前端开发。在开发过程中，严格遵循开发规范，保证代码可维护性。积极响应业务方需求变更，灵活调整开发计划。遇到技术难题时，主动寻求解决方案并与同事交流讨论。`,
          
          `本月按时完成了所有分配的开发任务，项目进度符合预期。在技术实现上追求最佳实践，注重性能优化和用户体验。工作中保持良好的沟通，及时同步项目进展通过本月的项目实践，进一步提升了前端开发能力和问题解决能力。`
        ]
        
        ElementPlus.ElMessage.success('已生成3个自评参考版本')
      }

      const copyWorkTable = () => {
        const header = '| 时间 | 主要工作事项 | 负责人 | 完成进度 | 个人自评 |\n|------|-------------|--------|---------|---------|'
        const rows = workTableData.value.map(row => 
          `| ${row.time} | ${row.workItem} | ${row.owner} | ${row.progress} | ${row.selfEval} |`
        ).join('\n')
        
        const text = header + '\n' + rows
        copyText(text)
      }

      const copyKLineStats = () => {
        const text = kLineStats.value.map(item => 
          `${item.name}: ${item.days}天`
        ).join('\n')
        copyText(text)
      }

      const copyText = async (text) => {
        try {
          await navigator.clipboard.writeText(text)
          ElementPlus.ElMessage.success('已复制到剪贴板')
        } catch (error) {
          ElementPlus.ElMessage.error('复制失败')
        }
      }

      onMounted(() => {
        quickSelectMonth()
        document.getElementById('app').classList.add('loaded')
      })

      return {
        startDate,
        endDate,
        workDays,
        loading,
        hasData,
        workTableData,
        kLineStats,
        evaluations,
        showSettings,
        settings,
        projectIdsText,
        quickSelectMonth,
        saveSettings,
        fetchData,
        generateEvaluation,
        copyWorkTable,
        copyKLineStats,
        copyText
      }
    }
  })

  // 注册 Element Plus
  app.use(ElementPlus)
  
  // 注册图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.mount('#app')
})
