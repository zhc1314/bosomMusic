// pages/role/role.js
Page({
    data: {},

    onLoad() {
        // 检查是否已选择角色
        const userRole = wx.getStorageSync('userRole');
        if (userRole) {
            this.redirectToHome(userRole);
        }
    },

    selectTeacher() {
        this.setUserRole('teacher');
    },

    selectStudent() {
        this.setUserRole('student');
    },

    setUserRole(role) {
        // 存储用户角色
        wx.setStorageSync('userRole', role);

        // 更新用户信息
        const userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.role = role;
        wx.setStorageSync('userInfo', userInfo);

        wx.showToast({
            title: role === 'teacher' ? '老师身份已选择' : '学员身份已选择',
            icon: 'success'
        });

        // 跳转到对应页面
        setTimeout(() => {
            this.redirectToHome(role);
        }, 1000);
    },

    redirectToHome(role) {
        // 无论老师还是学员，都先进入首页
        wx.switchTab({
            url: '/pages/index/index'
        });
    }
})