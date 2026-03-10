// pages/student/schedule.js
const app = getApp()

Page({
    data: {
        currentDate: new Date(),
        weekDays: [],
        timeSlots: [],
        schedules: {},
        showReservationModal: false,
        showCancelModal: false,
        selectedDate: '',
        selectedTime: '',
        hasConflict: false
    },

    onLoad() {
        this.initTimeSlots()
        this.generateWeekDays()
        this.loadSchedules()
    },

    onShow() {
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
        // 加载老师课程表数据
        const teacherSchedules = wx.getStorageSync('teacherSchedules') || {}

        // 加载学员预约数据
        const studentReservations = wx.getStorageSync('studentReservations') || {}
        const userInfo = app.getUserInfo()

        // 合并数据
        const schedules = {}

        this.data.weekDays.forEach(day => {
            schedules[day.date] = {}

            this.data.timeSlots.forEach(slot => {
                const teacherSchedule = teacherSchedules[day.date]?.[slot.startTime]
                const studentReservation = studentReservations[day.date]?.[slot.startTime]

                if (studentReservation && studentReservation.studentPhone === userInfo.phoneNumber) {
                    // 当前学员的预约
                    schedules[day.date][slot.startTime] = {
                        status: 'self-booked',
                        time: slot.time
                    }
                } else if (teacherSchedule) {
                    // 已被其他学员预约
                    schedules[day.date][slot.startTime] = {
                        status: teacherSchedule.status,
                        time: slot.time
                    }
                } else {
                    // 可预约
                    schedules[day.date][slot.startTime] = {
                        status: 'available',
                        time: slot.time
                    }
                }
            })
        })

        this.setData({schedules})
    },

    getScheduleClass(date, time) {
        const schedule = this.data.schedules[date]?.[time]
        return schedule ? schedule.status : 'available'
    },

    getScheduleStatus(date, time) {
        const schedule = this.data.schedules[date]?.[time]
        return schedule ? schedule.status : 'available'
    },

    getScheduleText(date, time) {
        const schedule = this.data.schedules[date]?.[time]
        if (!schedule) return '可预约'

        const statusMap = {
            'available': '可预约',
            'self-booked': '已预约',
            'booked': '已满',
            'completed': '已完成',
            'cancelled': '已取消'
        }

        return statusMap[schedule.status] || schedule.status
    },

    handleScheduleClick(e) {
        const {date, time, status} = e.currentTarget.dataset

        if (status === 'available') {
            // 检查时间冲突
            const hasConflict = this.checkTimeConflict(date, time)

            this.setData({
                showReservationModal: true,
                selectedDate: date,
                selectedTime: time,
                hasConflict: hasConflict
            })
        } else if (status === 'self-booked') {
            wx.showToast({
                title: '您已预约该课程',
                icon: 'none'
            })
        } else {
            wx.showToast({
                title: '该时间段不可预约',
                icon: 'none'
            })
        }
    },

    handleScheduleLongPress(e) {
        const {date, time, status} = e.currentTarget.dataset

        if (status === 'self-booked') {
            this.setData({
                showCancelModal: true,
                selectedDate: date,
                selectedTime: time
            })
        }
    },

    checkTimeConflict(date, time) {
        // 获取学员的所有预约
        const studentReservations = wx.getStorageSync('studentReservations') || {}
        const userInfo = app.getUserInfo()

        // 检查同一天是否有其他预约
        const dayReservations = studentReservations[date] || {}

        for (const [reservedTime, reservation] of Object.entries(dayReservations)) {
            if (reservation.studentPhone === userInfo.phoneNumber) {
                // 同一天已有预约，视为冲突
                return true
            }
        }

        return false
    },

    hideReservationModal() {
        this.setData({
            showReservationModal: false,
            hasConflict: false
        })
    },

    hideCancelModal() {
        this.setData({
            showCancelModal: false
        })
    },

    confirmReservation() {
        const {selectedDate, selectedTime} = this.data
        const userInfo = app.getUserInfo()

        // 更新老师课程表
        let teacherSchedules = wx.getStorageSync('teacherSchedules') || {}
        if (!teacherSchedules[selectedDate]) {
            teacherSchedules[selectedDate] = {}
        }

        teacherSchedules[selectedDate][selectedTime] = {
            studentName: `学员${userInfo.phoneNumber.slice(-4)}`,
            status: 'booked',
            time: selectedTime
        }

        // 更新学员预约记录
        let studentReservations = wx.getStorageSync('studentReservations') || {}
        if (!studentReservations[selectedDate]) {
            studentReservations[selectedDate] = {}
        }

        studentReservations[selectedDate][selectedTime] = {
            studentPhone: userInfo.phoneNumber,
            reservationTime: new Date().getTime(),
            time: selectedTime
        }

        wx.setStorageSync('teacherSchedules', teacherSchedules)
        wx.setStorageSync('studentReservations', studentReservations)

        wx.showToast({
            title: '预约成功',
            icon: 'success'
        })

        this.hideReservationModal()
        this.loadSchedules()
    },

    confirmCancel() {
        const {selectedDate, selectedTime} = this.data
        const userInfo = app.getUserInfo()

        // 更新老师课程表
        let teacherSchedules = wx.getStorageSync('teacherSchedules') || {}
        if (teacherSchedules[selectedDate] && teacherSchedules[selectedDate][selectedTime]) {
            teacherSchedules[selectedDate][selectedTime].status = 'cancelled'
        }

        // 移除学员预约记录
        let studentReservations = wx.getStorageSync('studentReservations') || {}
        if (studentReservations[selectedDate] && studentReservations[selectedDate][selectedTime]) {
            delete studentReservations[selectedDate][selectedTime]
        }

        wx.setStorageSync('teacherSchedules', teacherSchedules)
        wx.setStorageSync('studentReservations', studentReservations)

        wx.showToast({
            title: '取消成功',
            icon: 'success'
        })

        this.hideCancelModal()
        this.loadSchedules()
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