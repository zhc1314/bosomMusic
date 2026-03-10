// pages/index/index.js
const app = getApp()

Page({
    data: {
        banners: [
            {
                id: 1,
                image: '/images/banner1.jpg',
                title: '专业声乐教学',
                desc: '一对一专业指导，提升歌唱技巧'
            },
            {
                id: 2,
                image: '/images/banner2.jpg',
                title: '灵活预约系统',
                desc: '自由选择上课时间，合理安排学习计划'
            },
            {
                id: 3,
                image: '/images/banner3.jpg',
                title: '个性化课程',
                desc: '根据学员水平定制专属教学方案'
            }
        ],
        userInfo: {},
        userRole: '',
        todayLessons: 0,
        todayLessonList: []
    },

    onLoad() {
        this.loadUserInfo()
        this.loadTodayLessons()
    },

    onShow() {
        this.loadUserInfo()
        this.loadTodayLessons()
    },

    loadUserInfo() {
        const userInfo = app.getUserInfo()
        const userRole = app.getUserRole()

        this.setData({
            userInfo: userInfo || {},
            userRole: userRole || ''
        })
    },

    loadTodayLessons() {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const userInfo = app.getUserInfo()

        if (!userInfo) return

        let todayLessons = 0
        let todayLessonList = []

        if (this.data.userRole === 'student') {
            // 学员：查看自己的预约
            const studentReservations = wx.getStorageSync('studentReservations') || {}
            const dayReservations = studentReservations[todayStr] || {}

            for (const [time, reservation] of Object.entries(dayReservations)) {
                if (reservation.studentPhone === userInfo.phoneNumber) {
                    todayLessons++
                    todayLessonList.push({
                        id: time,
                        time: time,
                        info: '声乐课程',
                        status: 'booked',
                        statusText: '已预约'
                    })
                }
            }
        } else if (this.data.userRole === 'teacher') {
            // 老师：查看今天的课程安排
            const teacherSchedules = wx.getStorageSync('teacherSchedules') || {}
            const daySchedules = teacherSchedules[todayStr] || {}

            for (const [time, schedule] of Object.entries(daySchedules)) {
                if (schedule.status === 'booked' || schedule.status === 'completed') {
                    todayLessons++
                    todayLessonList.push({
                        id: time,
                        time: time,
                        info: schedule.studentName,
                        status: schedule.status,
                        statusText: schedule.status === 'booked' ? '待上课' : '已完成'
                    })
                }
            }
        }

        this.setData({
            todayLessons: todayLessons,
            todayLessonList: todayLessonList
        })
    },

    goToTeacherSchedule() {
        wx.switchTab({
            url: '/pages/teacher/schedule'
        })
    },

    goToTeacherRecords() {
        wx.switchTab({
            url: '/pages/teacher/records'
        })
    },

    goToStudentSchedule() {
        wx.switchTab({
            url: '/pages/student/schedule'
        })
    },

    goToStudentReservation() {
        wx.navigateTo({
            url: '/pages/student/reservation'
        })
    },

    switchRole() {
        wx.showModal({
            title: '切换身份',
            content: `确定要切换到${this.data.userRole === 'teacher' ? '学员' : '老师'}身份吗？`,
            success: (res) => {
                if (res.confirm) {
                    const newRole = this.data.userRole === 'teacher' ? 'student' : 'teacher'
                    app.setUserRole(newRole)

                    wx.showToast({
                        title: '身份切换成功',
                        icon: 'success'
                    })

                    setTimeout(() => {
                        this.loadUserInfo()
                        this.loadTodayLessons()

                        // 重新加载页面
                        if (newRole === 'teacher') {
                            wx.switchTab({
                                url: '/pages/teacher/schedule'
                            })
                        } else {
                            wx.switchTab({
                                url: '/pages/student/schedule'
                            })
                        }
                    }, 1000)
                }
            }
        })
    },

    goToLogin() {
        wx.navigateTo({
            url: '/pages/login/login'
        })
    },

    logout() {
        wx.showModal({
            title: '确认退出',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    app.logout()
                }
            }
        })
    }
})
