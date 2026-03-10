// app.js
App({
    globalData: {
        userInfo: null,
        userRole: null
    },

    onLaunch() {
        // 检查登录状态
        this.checkLoginStatus();
    },

    checkLoginStatus() {
        const userInfo = wx.getStorageSync('userInfo');
        const userRole = wx.getStorageSync('userRole');

        if (userInfo && userRole) {
            this.globalData.userInfo = userInfo;
            this.globalData.userRole = userRole;

            // 已登录且已选择角色，直接进入首页
            // 不进行跳转，让用户停留在当前页面
        } else if (userInfo && !userRole) {
            this.globalData.userInfo = userInfo;
            // 已登录但未选择角色，先进入首页，用户可以从首页选择登录
        } else {
            // 未登录，直接进入首页，用户可以从首页选择登录
        }
    },

    getUserInfo() {
        return this.globalData.userInfo;
    },

    getUserRole() {
        return this.globalData.userRole;
    },

    setUserInfo(userInfo) {
        this.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
    },

    setUserRole(role) {
        this.globalData.userRole = role;
        wx.setStorageSync('userRole', role);
    },

    logout() {
        this.globalData.userInfo = null;
        this.globalData.userRole = null;
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('userRole');

        wx.redirectTo({
            url: '/pages/login/login'
        });
    }
})
