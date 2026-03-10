// pages/login/login.js
Page({
    data: {
        phoneNumber: '',
        verificationCode: '',
        codeCountdown: 0,
        agreed: true
    },

    onLoad() {
        // 检查是否已登录
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            wx.redirectTo({
                url: '/pages/role/role'
            });
        }
    },

    onPhoneInput(e) {
        this.setData({
            phoneNumber: e.detail.value
        });
    },

    onCodeInput(e) {
        this.setData({
            verificationCode: e.detail.value
        });
    },

    onAgreementChange(e) {
        this.setData({
            agreed: e.detail.value.length > 0
        });
    },

    getVerificationCode() {
        const {phoneNumber} = this.data;

        if (!phoneNumber) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
            return;
        }

        if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }

        // 模拟发送验证码
        wx.showLoading({
            title: '发送中...'
        });

        setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
                title: '验证码已发送',
                icon: 'success'
            });

            // 开始倒计时
            this.startCountdown();
        }, 1000);
    },

    startCountdown() {
        this.setData({
            codeCountdown: 60
        });

        const timer = setInterval(() => {
            if (this.data.codeCountdown <= 1) {
                clearInterval(timer);
                this.setData({
                    codeCountdown: 0
                });
            } else {
                this.setData({
                    codeCountdown: this.data.codeCountdown - 1
                });
            }
        }, 1000);
    },

    handleLogin() {
        const {phoneNumber, verificationCode, agreed} = this.data;

        if (!phoneNumber) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
            return;
        }

        if (!verificationCode) {
            wx.showToast({
                title: '请输入验证码',
                icon: 'none'
            });
            return;
        }

        if (!agreed) {
            wx.showToast({
                title: '请同意用户协议',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '登录中...'
        });

        // 模拟登录验证
        setTimeout(() => {
            wx.hideLoading();

            // 存储用户信息
            const userInfo = {
                phoneNumber: phoneNumber,
                loginTime: new Date().getTime()
            };
            wx.setStorageSync('userInfo', userInfo);

            wx.showToast({
                title: '登录成功',
                icon: 'success'
            });

            // 跳转到角色选择页面
            setTimeout(() => {
                wx.redirectTo({
                    url: '/pages/role/role'
                });
            }, 1000);
        }, 1500);
    },

    viewAgreement() {
        wx.showModal({
            title: '用户协议',
            content: '欢迎使用声乐课程表小程序。请仔细阅读并理解本协议内容。',
            showCancel: false,
            confirmText: '我知道了'
        });
    }
})