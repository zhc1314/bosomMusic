// pages/student/reservation.js
const app = getApp()

Page({
    data: {
        filterDate: '',
        filterDateDisplay: '选择日期',
        filterStatus: 0,
        statusOptions: ['全部状态', '已预约', '已完成', '已取消'],
        reservations: [],
        showCancelModal: false,
        currentReservation: {}
    },

    onLoad() {
        const today = new Date()
        const dateStr = today.toISOString().split('T')[0]

        this.setData({
            filterDate: dateStr,
            filterDateDisplay: this.formatDateDisplay(today)
        })

        this.loadReservations()
    },

    onShow() {
        this.loadReservations()
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

        this.loadReservations()
    },

    onStatusChange(e) {
        this.setData({
            filterStatus: parseInt(e.detail.value)
        })
        this.loadReservations()
    },

    loadReservations() {
        const {filterDate, filterStatus} = this.data
        const userInfo = app.getUserInfo()

        if (!userInfo) {
            this.setData({reservations: []})
            return
        }

        // 从本地存储加载预约数据
        const studentReservations = wx.getStorageSync('studentReservations') || {}
        const teacherSchedules = wx.getStorageSync('teacherSchedules') || {}

        let allReservations = []

        // 遍历所有日期的预约记录
        for (const [date, dayReservations] of Object.entries(studentReservations)) {
            for (const [time, reservation] of Object.entries(dayReservations)) {
                if (reservation.studentPhone === userInfo.phoneNumber) {
                    // 获取课程状态
                    const teacherSchedule = teacherSchedules[date]?.[time]
                    const status = teacherSchedule?.status || 'booked'

                    allReservations.push({
                        id: `${date}-${time}`,
                        date: date,
                        time: time,
                        status: status,
                        reservationTime: reservation.reservationTime,
                        evaluation: teacherSchedule?.evaluation || '',
                        rating: teacherSchedule?.rating || 0
                    })
                }
            }
        }

        // 筛选记录
        let filteredReservations = allReservations.filter(record => {
            return record.date === filterDate
        })

        // 按状态筛选
        if (filterStatus > 0) {
            const statusMap = ['', 'booked', 'completed', 'cancelled']
            const targetStatus = statusMap[filterStatus]
            filteredReservations = filteredReservations.filter(record => record.status === targetStatus)
        }

        // 按时间排序
        filteredReservations.sort((a, b) => {
            return a.time.localeCompare(b.time)
        })

        this.setData({reservations: filteredReservations})
    },

    getStatusText(status) {
        const statusMap = {
            'booked': '已预约',
            'completed': '已完成',
            'cancelled': '已取消'
        }
        return statusMap[status] || status
    },

    formatReservationTime(timestamp) {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hour = date.getHours().toString().padStart(2, '0')
        const minute = date.getMinutes().toString().padStart(2, '0')
        return `${month}/${day} ${hour}:${minute}`
    },

    cancelReservation(e) {
        const reservation = e.currentTarget.dataset.reservation
        this.setData({
            showCancelModal: true,
            currentReservation: reservation
        })
    },

    hideCancelModal() {
        this.setData({
            showCancelModal: false
        })
    },

    confirmCancel() {
        const {currentReservation} = this.data
        const userInfo = app.getUserInfo()

        // 更新老师课程表
        let teacherSchedules = wx.getStorageSync('teacherSchedules') || {}
        if (teacherSchedules[currentReservation.date] && teacherSchedules[currentReservation.date][currentReservation.time]) {
            teacherSchedules[currentReservation.date][currentReservation.time].status = 'cancelled'
        }

        // 移除学员预约记录
        let studentReservations = wx.getStorageSync('studentReservations') || {}
        if (studentReservations[currentReservation.date] && studentReservations[currentReservation.date][currentReservation.time]) {
            delete studentReservations[currentReservation.date][currentReservation.time]
        }

        wx.setStorageSync('teacherSchedules', teacherSchedules)
        wx.setStorageSync('studentReservations', studentReservations)

        wx.showToast({
            title: '取消成功',
            icon: 'success'
        })

        this.hideCancelModal()
        this.loadReservations()
    },

    goToSchedule() {
        wx.switchTab({
            url: '/pages/student/schedule'
        })
    }
})