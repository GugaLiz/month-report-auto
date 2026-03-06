<template>
  <div class="app-container">
    <el-container>
      <el-header class="app-header">
        <h1>📊 月报填写工具</h1>
        <el-button type="primary" link @click="showSettings = true">
          <el-icon><Setting /></el-icon>
          设置
        </el-button>
      </el-header>

      <el-main class="app-main">
        <!-- 日期选择区域 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span>📅 选择日期范围</span>
            </div>
          </template>
          
          <div class="date-selector">
            <el-date-picker
              v-model="startDate"
              type="date"
              placeholder="开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px"
            />
            <span class="date-separator">至</span>
            <el-date-picker
              v-model="endDate"
              type="date"
              placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px"
            />
            <el-button type="primary" @click="quickSelectMonth">
              本月
            </el-button>
            <el-button type="success" :loading="loading" @click="fetchData">
              <el-icon><Search /></el-icon>
              获取工时数据
            </el-button>
          </div>

          <div v-if="workDays !== null" class="work-days-info">
            <el-tag type="info" size="large">
              本月工作日: <strong>{{ workDays }}</strong> 天
            </el-tag>
          </div>
        </el-card>

        <!-- 结果展示区域 -->
        <div v-if="hasData" class="results-container">
          <!-- 重点工作清单 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>📝 重点工作清单</span>
                <el-button type="primary" size="small" @click="copyWorkTable">
                  <el-icon><CopyDocument /></el-icon>
                  复制清单
                </el-button>
              </div>
            </template>
            
            <el-table 
              :data="workTableData" 
              border 
              stripe
              style="width: 100%"
            >
              <el-table-column prop="workItem" label="主要工作事项" min-width="400" />
            </el-table>
          </el-card>

          <!-- K线用时统计 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>📈 K线用时统计</span>
                <el-button type="primary" size="small" @click="copyKLineStats">
                  <el-icon><CopyDocument /></el-icon>
                  复制详细统计
                </el-button>
              </div>
            </template>
            
            <div class="kline-stats-section">
              <div class="stats-title">详细统计：</div>
              <div class="kline-stats">
                <div 
                  v-for="item in kLineStats" 
                  :key="item.name"
                  class="kline-item"
                  :class="{ 'kline-total': item.isTotal }"
                >
                  <span class="kline-name">{{ item.name }}:</span>
                  <span class="kline-value">{{ item.days }}天</span>
                  <span class="kline-hours">({{ item.hours }}小时)</span>
                </div>
              </div>

              <!-- 工时总结（精简版） -->
              <div class="stats-summary">
                <div class="summary-header">
                  <div class="stats-title">工时总结（精简版）：</div>
                  <el-button type="primary" size="small" @click="copyKLineSummary">
                    <el-icon><CopyDocument /></el-icon>
                    复制总结
                  </el-button>
                </div>
                
                <!-- 调休年假输入 -->
                <div class="extra-inputs">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="input-label">调休（天）：</span>
                    <el-input-number 
                      v-model="compensatoryDays" 
                      :min="0" 
                      :max="30"
                      :precision="1"
                      :step="0.5"
                      size="small"
                      style="width: 120px"
                    />
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="input-label">年假（天）：</span>
                    <el-input-number 
                      v-model="vacationDays" 
                      :min="0" 
                      :max="30"
                      :precision="1"
                      :step="0.5"
                      size="small"
                      style="width: 120px"
                    />
                  </div>
                  
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="input-label">育儿假（天）：</span>
                    <el-input-number 
                      v-model="parentalLeaveDays" 
                      :min="0" 
                      :max="30"
                      :precision="1"
                      :step="0.5"
                      size="small"
                      style="width: 120px"
                    />
                  </div>
                </div>

                <div class="summary-list">
                  <div v-for="(item, index) in kLineSummary" :key="index">
                    {{ item }}
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 工时明细 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>📋 工时明细</span>
                <el-button type="primary" size="small" @click="copyWorkDetail">
                  <el-icon><CopyDocument /></el-icon>
                  复制明细
                </el-button>
              </div>
            </template>
            
            <el-table 
              :data="workDetailData" 
              border 
              stripe
              style="width: 100%"
            >
              <el-table-column prop="kLine" label="K线分类" width="100" />
              <el-table-column prop="requirement" label="需求标题" min-width="350" />
              <el-table-column prop="hours" label="工时（小时）" width="120" align="right" />
              <el-table-column prop="days" label="工时（天）" width="100" align="right" />
            </el-table>
          </el-card>

          <!-- 工作自评 -->
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>💬 工作自评参考</span>
                <el-button type="primary" size="small" @click="generateEvaluation">
                  <el-icon><MagicStick /></el-icon>
                  生成自评
                </el-button>
              </div>
            </template>
            
            <div v-if="evaluations.length > 0" class="evaluations">
              <div 
                v-for="(evaluation, index) in evaluations" 
                :key="index"
                class="evaluation-item"
              >
                <div class="evaluation-header">
                  <el-tag>版本 {{ index + 1 }}</el-tag>
                  <el-button 
                    type="primary" 
                    size="small" 
                    link 
                    @click="copyText(evaluation)"
                  >
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-button>
                </div>
                <div class="evaluation-content">{{ evaluation }}</div>
              </div>
            </div>
            <el-empty v-else description="点击上方按钮生成工作自评" />
          </el-card>
        </div>

        <!-- 空状态 -->
        <el-empty 
          v-if="!hasData && !loading" 
          description="选择日期范围后，点击获取工时数据开始" 
        />
      </el-main>
    </el-container>

    <!-- 设置对话框 -->
    <el-dialog 
      v-model="showSettings" 
      title="设置" 
      width="600px"
    >
      <el-form label-width="120px">
        <el-form-item label="Worktile Cookie">
          <el-input
            v-model="settings.cookie"
            type="textarea"
            :rows="4"
            placeholder="请输入从浏览器获取的 Cookie"
          />
          <div class="form-tip">
            获取方法：打开浏览器开发者工具 → Network → 复制请求头中的 Cookie
          </div>
        </el-form-item>
        
        <el-form-item label="成员 ID">
          <el-input 
            v-model="settings.memberId" 
            placeholder="成员ID"
          />
        </el-form-item>
        
        <el-form-item label="项目 ID">
          <el-input
            v-model="projectIdsText"
            type="textarea"
            :rows="3"
            placeholder="项目ID（多个用逗号分隔）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
        <el-button type="danger" @click="testCookieValid">测试 Cookie</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Search, CopyDocument, MagicStick } from '@element-plus/icons-vue'
import { fetchWorkloadData, parseWorkloadData, testCookie } from './api/worktile.js'
import { getCurrentMonthRange, formatDate } from './utils/date.js'
import { calculateKLineDays, formatKLineStats, classifyTask } from './utils/kline.js'
import { calculateWorkDays } from './utils/workday.js'
import { 
  getCookie, 
  saveCookie, 
  getMemberId, 
  saveMemberId,
  getProjectIds,
  saveProjectIds
} from './utils/storage.js'

// 日期选择
const startDate = ref('')
const endDate = ref('')
const workDays = ref(null)

// 数据状态
const loading = ref(false)
const hasData = ref(false)
const workTableData = ref([])
const kLineStats = ref([])
const evaluations = ref([])
const workDetailData = ref([])
const kLineSummary = ref([])

// 调休和请假天数
const compensatoryDays = ref(0)
const vacationDays = ref(0)
const parentalLeaveDays = ref(0)

// 原始数据
const parsedData = ref(null)

// 设置
const showSettings = ref(false)
const settings = ref({
  cookie: '',
  memberId: '',
  projectIds: []
})

// 项目ID文本（用于输入）
const projectIdsText = computed({
  get: () => settings.value.projectIds.join(','),
  set: (val) => {
    settings.value.projectIds = val.split(',').map(id => id.trim()).filter(id => id)
  }
})

// 初始化
onMounted(() => {
  loadSettings()
  quickSelectMonth()
})

// 监听调休、年假、育儿假天数变化，重新生成统计
watch([compensatoryDays, vacationDays, parentalLeaveDays], () => {
  if (parsedData.value) {
    generateKLineStats()
  }
})

// 加载设置
function loadSettings() {
  settings.value.cookie = getCookie() || ''
  settings.value.memberId = getMemberId() || ''
  settings.value.projectIds = getProjectIds() || []
}

// 保存设置
function saveSettings() {
  if (!settings.value.cookie) {
    ElMessage.warning('请输入 Cookie')
    return
  }
  
  saveCookie(settings.value.cookie)
  saveMemberId(settings.value.memberId)
  saveProjectIds(settings.value.projectIds)
  
  ElMessage.success('设置已保存')
  showSettings.value = false
}

// 测试 Cookie
async function testCookieValid() {
  try {
    loading.value = true
    const isValid = await testCookie()
    if (isValid) {
      ElMessage.success('Cookie 有效')
    } else {
      ElMessage.error('Cookie 无效，请重新配置')
    }
  } catch (error) {
    ElMessage.error('测试失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 快速选择本月
function quickSelectMonth() {
  const range = getCurrentMonthRange()
  startDate.value = range.start
  endDate.value = range.end
  updateWorkDays()
}

// 更新工作日
function updateWorkDays() {
  if (startDate.value && endDate.value) {
    workDays.value = calculateWorkDays(startDate.value, endDate.value)
  }
}

// 获取数据
async function fetchData() {
  if (!startDate.value || !endDate.value) {
    ElMessage.warning('请选择日期范围')
    return
  }
  
  if (!getCookie()) {
    ElMessage.warning('请先配置 Cookie')
    showSettings.value = true
    return
  }
  
  try {
    loading.value = true
    
    // 获取工时数据
    const rawData = await fetchWorkloadData(startDate.value, endDate.value)
    
    // 解析数据
    parsedData.value = parseWorkloadData(rawData)
    
    // 生成工作清单表格
    generateWorkTable()
    
    // 生成K线统计
    generateKLineStats()
    
    // 更新工作日
    updateWorkDays()
    
    hasData.value = true
    ElMessage.success('数据获取成功')
    
  } catch (error) {
    ElMessage.error('获取数据失败: ' + error.message)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 生成工作清单表格（简化版，只包含主要工作事项）
function generateWorkTable() {
  workTableData.value = parsedData.value.workList.map(item => ({
    workItem: item.parentTitle
  }))
}

// 生成K线统计
function generateKLineStats() {
  console.log('生成K线统计，tasks:', parsedData.value.tasks)
  const kLineDays = calculateKLineDays(
    parsedData.value.tasks,
    parsedData.value.taskTimeMap
  )
  console.log('K线天数:', kLineDays)
  kLineStats.value = formatKLineStats(kLineDays, vacationDays.value, compensatoryDays.value, parentalLeaveDays.value)
  
  // 同时生成工时总结和工时明细
  generateKLineSummary()
  generateWorkDetail()
}

// 生成工时明细表格
function generateWorkDetail() {
  // 从任务列表中提取需求名称和工时
  const requirementMap = new Map()
  
  parsedData.value.tasks.forEach(task => {
    const requirementName = task.parentTitle || task.title || '未命名需求'
    const hours = parsedData.value.taskTimeMap[task.id] || 0
    
    if (requirementMap.has(requirementName)) {
      const existing = requirementMap.get(requirementName)
      requirementMap.set(requirementName, {
        hours: existing.hours + hours,
        title: requirementName
      })
    } else {
      requirementMap.set(requirementName, {
        hours: hours,
        title: requirementName
      })
    }
  })
  
  // 转换为数组并排序
  workDetailData.value = Array.from(requirementMap.entries())
    .map(([requirement, data]) => {
      const kLine = classifyTask(data.title)
      const displayKLine = kLine === 'OTHER' ? '其他' : kLine
      return {
        kLine: displayKLine,
        requirement: data.title,
        hoursNum: data.hours,
        hours: data.hours.toFixed(1),
        days: (data.hours / 8).toFixed(2)
      }
    })
    .sort((a, b) => b.hoursNum - a.hoursNum)
  
  console.log('工时明细:', workDetailData.value)
}

// 生成工时总结（精简版）
function generateKLineSummary() {
  const kLineDays = calculateKLineDays(
    parsedData.value.tasks,
    parsedData.value.taskTimeMap
  )
  
  const summaryList = []
  const kLineOrder = ['K1', 'K2', 'K3', 'K8', 'SSG', 'OTHER']
  
  // 按顺序添加有数据的K线
  let totalDays = 0
  kLineOrder.forEach(kLine => {
    const days = kLineDays[kLine]
    if (days && days > 0) {
      const displayKLine = kLine === 'OTHER' ? '其他' : kLine
      summaryList.push(`${displayKLine}: ${days}`)
      totalDays += days
    }
  })
  
  // 添加调休
  if (compensatoryDays.value > 0) {
    summaryList.push(`调休: ${compensatoryDays.value}`)
    totalDays += compensatoryDays.value
  }
  
  // 添加年假
  if (vacationDays.value > 0) {
    summaryList.push(`年假: ${vacationDays.value}`)
    totalDays += vacationDays.value
  }
  
  // 添加育儿假
  if (parentalLeaveDays.value > 0) {
    summaryList.push(`育儿假: ${parentalLeaveDays.value}`)
    totalDays += parentalLeaveDays.value
  }
  
  // 添加总计
  summaryList.push(`总计：${totalDays}天`)
  
  kLineSummary.value = summaryList
  console.log('工时总结:', kLineSummary.value)
}

// 生成工作自评
function generateEvaluation() {
  // 简单版本：生成3个示例自评
  // TODO: 后续可接入 AI API
  const workItems = parsedData.value.workList.map(item => item.parentTitle)
  
  evaluations.value = [
    `本月主要完成了${workItems.length}个重点项目的开发工作，包括${workItems.slice(0, 3).join('、')}等。在工作中注重代码质量和用户体验，积极与团队成员协作，确保项目按时交付。同时，不断学习新技术，提升自身的技术能力。`,
    
    `本月工作饱和度较高，完成了${workItems.length}个业务需求的前端开发。在开发过程中，严格遵循开发规范，保证代码可维护性。积极响应业务方需求变更，灵活调整开发计划。遇到技术难题时，主动寻求解决方案并与同事交流讨论。`,
    
    `本月按时完成了所有分配的开发任务，项目进度符合预期。在技术实现上追求最佳实践，注重性能优化和用户体验。工作中保持良好的沟通，及时同步项目进展。通过本月的项目实践，进一步提升了前端开发能力和问题解决能力。`
  ]
  
  ElMessage.success('已生成3个自评参考版本')
}

// 复制工作表格（简化版）
function copyWorkTable() {
  const header = '| 主要工作事项 |\n|-------------|'
  const rows = workTableData.value.map(row => 
    `| ${row.workItem} |`
  ).join('\n')
  
  const text = header + '\n' + rows
  copyText(text)
}

// 复制K线统计
function copyKLineStats() {
  const text = kLineStats.value.map(item => 
    `${item.name}: ${item.days}天`
  ).join('\n')
  copyText(text)
}

// 复制工时总结（精简版）
function copyKLineSummary() {
  const text = kLineSummary.value.join('\n')
  copyText(text)
}

// 复制工时明细
function copyWorkDetail() {
  const header = '| K线分类 | 需求标题 | 工时(h) | 工天(d) |\n|---------|---------|---------|---------|'
  const rows = workDetailData.value.map(row => 
    `| ${row.kLine} | ${row.requirement} | ${row.hours} | ${row.days} |`
  ).join('\n')
  
  const text = header + '\n' + rows
  copyText(text)
}

// 复制文本到剪贴板
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.app-main {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.date-separator {
  color: #909399;
}

.work-days-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.results-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.kline-stats-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.kline-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kline-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}

.kline-item.kline-total {
  background: #e6f7ff;
  font-weight: 600;
  border: 1px solid #91d5ff;
}

.kline-name {
  min-width: 80px;
  color: #606266;
}

.kline-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin-right: 8px;
}

.kline-hours {
  color: #909399;
  font-size: 12px;
}

.evaluations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evaluation-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.evaluation-content {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.stats-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #e4e7ed;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.extra-inputs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.input-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.summary-list > div:last-child {
  margin-top: 8px;
  font-weight: 600;
  color: #303133;
}
</style>
