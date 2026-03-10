// pages/teacher/schedule.js
const app = getApp()

Page({
    data: {
        currentDate: new Date(),
        weekDays: [],
        timeSlots: [],
        schedules: {},
        totalLessons: 0,
        completedLessons: 0,
        pendingLessons: 0
    },

    onLoad() {
        this.initTimeSlots()
        this.generateWeekDays()
        this.loadSchedules()
    },

    onShow() {
        // 每次显示页面时刷新数据
        this.generateWeekDays()
        this.loadSchedules()
    },

    initTimeSlots() {
        // 生成时间槽：10:00-22:00，每节课45分钟，间隔30分钟
        const timeSlots = []
        let currentHour = 10
        let currentMinute = 0

        while (currentHour < 22 || (currentHour === 22 && currentMinute === 0)) {
            const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

            // 计算结束时间（45分钟后）
            let endHour = currentHour
            let endMinute = currentMinute + 45
            if (endMinute >= 60) {
                endHour += Math.floor(endMinute / 60)
                endMinute = endMinute % 60
            }
            const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

            timeSlots.push({
                time: `${startTime}-${endTime}`,
                startTime: startTime,
                endTime: endTime
            })

            // 增加30分钟间隔
            currentMinute += 75 // 45分钟课程 + 30分钟间隔
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60)
                currentMinute = currentMinute % 60
            }
        }

        this.setData({timeSlots})
    },

    generateWeekDays() {
        const {currentDate} = this.data
        const weekDays = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 获取本周一的日期
        const monday = new Date(currentDate)
        monday.setDate(currentDate.getDate() - currentDate.getDay() + 1)

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday)
            date.setDate(monday.getDate() + i)

            const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
            const isToday = date.toDateString() === today.toDateString()

            weekDays.push({
                date: this.formatDate(date),
                dayName: dayNames[date.getDay()],
                fullDate: date,
                isToday: isToday
            })
        }

        // 更新当前周范围显示
        const startDate = this.formatDate(weekDays[0].fullDate, 'MM月dd日')
        const endDate = this.formatDate(weekDays[6].fullDate, 'MM月dd日')
        const currentWeekRange = `${startDate} - ${endDate}`

        this.setData({
            weekDays,
            currentWeekRange
        })
    },

    formatDate(date, format = 'MM/dd') {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')

        if (format === 'MM月dd日') {
            return `${month}月${day}日`
        }

        return `${month}/${day}`
    },

    loadSchedules() {
        // 模拟加载课程数据
        const schedules = wx.getStorageSync('teacherSchedules') || {}

        // 如果没有数据，生成一些模拟数据
        if (Object.keys(schedules).length === 0) {
            this.generateMockSchedules()
            return
        }

        this.setData({schedules})
        this.calculateStats()
    },

    generateMockSchedules() {
        const schedules = {}
        const studentNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
        const statuses = ['booked', 'completed', 'cancelled']

        this.data.weekDays.forEach(day => {
            schedules[day.date] = {}

            this.data.timeSlots.forEach(slot => {
                // 随机生成课程状态
                const random = Math.random()
                if (random > 0.6) { // 40%的概率有课程
                    const status = statuses[Math.floor(Math.random() * statuses.length)]
                    const studentName = studentNames[Math.floor(Math.random() * studentNames.length)]

                    schedules[day.date][slot.startTime] = {
                        studentName: studentName,
                        status: status,
                        time: slot.time
                    }
                }
            })
        })

        wx.setStorageSync('teacherSchedules', schedules)
        this.setData({schedules})
        this.calculateStats()
    },

    calculateStats() {
        const {schedules, timeSlots, weekDays} = this.data
        let total = 0
        let completed = 0
        let pending = 0

        weekDays.forEach(day => {
            timeSlots.forEach(slot => {
                const schedule = schedules[day.date]?.[slot.startTime]
                if (schedule) {
                    total++
                    if (schedule.status === 'completed') {
                        completed++
                    } else if (schedule.status === 'booked') {
                        pending++
                    }
                }
            })
        })

        this.setData({
            totalLessons: total,
            completedLessons: completed,
            pendingLessons: pending
        })
    },

    getScheduleClass(date, time) {
        const schedule = this.data.schedules[date]?.[time]
        if (!schedule) return 'available'
        return schedule.status
    },

    getStudentName(date, time) {
        const schedule = this.data.schedules[date]?.[time]
        return schedule ? schedule.studentName : '可预约'
    },

    getScheduleStatus(date, time) {
        const schedule = this.data.schedules[date]?.[time]
        if (!schedule) return ''

        const statusMap = {
            'booked': '已预约',
            'completed': '已完成',
            'cancelled': '已取消'
        }

        return statusMap[schedule.status] || ''
    },

    viewScheduleDetail(e) {
        const {date, time} = e.currentTarget.dataset
        const schedule = this.data.schedules[date]?.[time]

        if (!schedule) {
            wx.showToast({
                title: '该时间段空闲',
                icon: 'none'
            })
            return
        }

        const statusMap = {
            'booked': '已预约',
            'completed': '已完成',
            'cancelled': '已取消'
        }

        wx.showModal({
            title: '课程详情',
            content: `学员：${schedule.studentName}\n时间：${schedule.time}\n状态：${statusMap[schedule.status]}`,
            showCancel: false,
            confirmText: '知道了'
        })
    },

    prevWeek() {
        const newDate = new Date(this.data.currentDate)
        newDate.setDate(newDate.getDate() - 7)
        this.setData({currentDate: newDate})
        this.generateWeekDays()
        this.loadSchedules()
    },

    nextWeek() {
        const newDate = new Date(this.data.currentDate)
        newDate.setDate(newDate.getDate() + 7)
        this.setData({currentDate: newDate})
        this.generateWeekDays()
        this.loadSchedules()
    },

    goToToday() {
        this.setData({currentDate: new Date()})
        this.generateWeekDays()
        this.loadSchedules()
    }
})