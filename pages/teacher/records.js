// pages/teacher/records.js
const app = getApp()

Page({
    data: {
        filterDate: '',
        filterDateDisplay: '选择日期',
        filterStatus: 0,
        statusOptions: ['全部状态', '已预约', '已完成', '已取消'],
        records: [],
        showEvaluationModal: false,
        currentRecord: {},
        evaluationRating: 0,
        evaluationContent: ''
    },

    onLoad() {
        const today = new Date()
        const dateStr = today.toISOString().split('T')[0]

        this.setData({
            filterDate: dateStr,
            filterDateDisplay: this.formatDateDisplay(today)
        })

        this.loadRecords()
    },

    onShow() {
        this.loadRecords()
    },

    formatDateDisplay(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${month}月${day}日`
    },

    onDateChange(e) {
        const dateStr = e.detail.value
        const date = new Date(dateStr)

        this.setData({
            filterDate: dateStr,
            filterDateDisplay: this.formatDateDisplay(date)
        })

        this.loadRecords()
    },

    onStatusChange(e) {
        this.setData({
            filterStatus: parseInt(e.detail.value)
        })
        this.loadRecords()
    },

    loadRecords() {
        const {filterDate, filterStatus} = this.data

        // 从本地存储加载记录
        let allRecords = wx.getStorageSync('teacherRecords') || []

        // 如果没有记录，生成一些模拟数据
        if (allRecords.length === 0) {
            allRecords = this.generateMockRecords()
            wx.setStorageSync('teacherRecords', allRecords)
        }

        // 筛选记录
        let filteredRecords = allRecords.filter(record => {
            return record.date === filterDate
        })

        // 按状态筛选
        if (filterStatus > 0) {
            const statusMap = ['', 'booked', 'completed', 'cancelled']
            const targetStatus = statusMap[filterStatus]
            filteredRecords = filteredRecords.filter(record => record.status === targetStatus)
        }

        // 按时间排序
        filteredRecords.sort((a, b) => {
            return a.time.localeCompare(b.time)
        })

        this.setData({records: filteredRecords})
    },

    generateMockRecords() {
        const records = []
        const studentNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
        const statuses = ['booked', 'completed', 'cancelled']
        const times = ['10:00-10:45', '11:15-12:00', '14:00-14:45', '15:15-16:00', '16:30-17:15', '19:00-19:45', '20:15-21:00']

        // 生成最近7天的记录
        for (let i = 0; i < 7; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            // 每天随机生成2-4条记录
            const recordCount = Math.floor(Math.random() * 3) + 2

            for (let j = 0; j < recordCount; j++) {
                const status = statuses[Math.floor(Math.random() * statuses.length)]
                const studentName = studentNames[Math.floor(Math.random() * studentNames.length)]
                const time = times[Math.floor(Math.random() * times.length)]

                const record = {
                    id: `${dateStr}-${j}`,
                    studentName: studentName,
                    date: dateStr,
                    time: time,
                    status: status,
                    rating: status === 'completed' ? Math.floor(Math.random() * 5) + 1 : 0,
                    evaluation: status === 'completed' && Math.random() > 0.5 ? '学员表现良好，音准掌握不错，需要加强气息控制。' : ''
                }

                records.push(record)
            }
        }

        return records
    },

    getStatusText(status) {
        const statusMap = {
            'booked': '已预约',
            'completed': '已完成',
            'cancelled': '已取消'
        }
        return statusMap[status] || status
    },

    evaluateRecord(e) {
        const record = e.currentTarget.dataset.record
        this.setData({
            showEvaluationModal: true,
            currentRecord: record,
            evaluationRating: record.rating || 0,
            evaluationContent: record.evaluation || ''
        })
    },

    hideEvaluationModal() {
        this.setData({
            showEvaluationModal: false,
            evaluationRating: 0,
            evaluationContent: ''
        })
    },

    setRating(e) {
        const rating = e.currentTarget.dataset.rating
        this.setData({
            evaluationRating: rating
        })
    },

    onEvaluationInput(e) {
        this.setData({
            evaluationContent: e.detail.value
        })
    },

    submitEvaluation() {
        const {currentRecord, evaluationRating, evaluationContent} = this.data

        if (evaluationRating === 0) {
            wx.showToast({
                title: '请选择评分',
                icon: 'none'
            })
            return
        }

        if (!evaluationContent.trim()) {
            wx.showToast({
                title: '请输入评价内容',
                icon: 'none'
            })
            return
        }

        // 更新记录
        let allRecords = wx.getStorageSync('teacherRecords') || []
        const recordIndex = allRecords.findIndex(record => record.id === currentRecord.id)

        if (recordIndex !== -1) {
            allRecords[recordIndex].rating = evaluationRating
            allRecords[recordIndex].evaluation = evaluationContent.trim()

            wx.setStorageSync('teacherRecords', allRecords)

            wx.showToast({
                title: '评价提交成功',
                icon: 'success'
            })

            this.hideEvaluationModal()
            this.loadRecords()
        }
    }
})