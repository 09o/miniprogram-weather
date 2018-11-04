const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#C4EFFF',
  'cloudy': '#DAEFF7',
  'overcast': '#C4CED2',
  'lightrain': '#B6D6E2',
  'heavyrain': '#C3CCD0',
  'snow': '#99E3FF'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

const UNPROMPTED = 0  // 未弹窗
const UNAUTHORIZED = 1  // 已弹窗拒绝
const AUTHORIZED = 2    // 已弹窗同意

const UNPROMPTED_TIPS = "点击获取当前位置"  // 未弹窗
const UNAUTHORIZED_TIPS = "点击开启位置权限"  // 已弹窗拒绝
const AUTHORIZED_TIPS = ""  // 已弹窗同意

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherbg: '',
    hourlyWeather: [],
    todayData: '',
    todayTemp: '',
    city: '广州市',
    locationAuthTypes: UNPROMPTED,
    locationTipsText: UNPROMPTED_TIPS
  },

  // 下拉刷新
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },

  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
    })
    this.getNow()
  },

  // 授权页面返回中教程所采用的方法，注意：需在app.js中添加代码 'APP({})'
  onShow() {
    let MyThis = this
    wx.getSetting({
      success (res) {
        let auth = res.authSetting['scope.userLocation']
        if (auth && MyThis.data.locationAuthTypes !== AUTHORIZED) {
          // 权限从无到有
          MyThis.setData({
            locationAuthType: AUTHORIZED,
            locationTipsText: AUTHORIZED_TIPS
          })
        MyThis.get_location()
        }
      }
    })
  },

  getNow(callback) {
    let MyThis = this
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', 
      data: {
        city: MyThis.data.city
      },
      success (res) {
        let result = res.data.result
        // console.log(result)
        MyThis.set_Now(result)
        MyThis.set_hourlyWeather(result)
        MyThis.set_Today(result)
      },
      complete () {
        callback && callback()
      }  
    })
  },

  set_Now(result) {
    let MyThis = this
    let temp = result.now.temp
    let weather = result.now.weather
    MyThis.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherbg: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: weatherColorMap[weather]
    })
  },

  // set forecast
  set_hourlyWeather(result) {
    let MyThis = this
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i <= 7; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    MyThis.setData({
      hourlyWeather: hourlyWeather
    })
  },

  set_Today(result) {
    let MyThis = this
    let date = new Date()
    MyThis.setData({
      todayTemp: `${result.today.minTemp}°-${result.today.maxTemp}°`,
      todayData: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },

  // 跳转
  onTapDayWeather() {
    wx.showToast()
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },

  // 获取位置
  onTapLocation() {
    let MyThis = this

    // 授权页面返回中我所使用的方法
    // if (MyThis.data.locationAuthTypes == 1) {
    //   wx.openSetting({
    //     success (res) {
    //       let auth = res.authSetting['scope.userLocation']
    //       if (auth == true) {
    //         MyThis.setData({
    //           locationAuthTypes: UNPROMPTED,
    //           locationTipsText: UNPROMPTED_TIPS
    //         })
    //       }
    //     }
    //   })

    if (MyThis.data.locationAuthTypes == 1) {
      wx.openSetting()
    } else {
      MyThis.get_location()
    }
  },

  get_location() {
    let MyThis = this
    wx.getLocation({
      success: function (res) {
        MyThis.setData({
          locationAuthTypes: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        MyThis.qqmapsdk.reverseGeocoder({
          location: {
            latitude: 39.984060,
            longitude: 116.307520
          },
          success: function (res) {
            let city = res.result.address_component.city
            MyThis.setData({
                city: city,
            })
            MyThis.getNow()
          }
        })
      },
      fail:function () {
        MyThis.setData({
          locationAuthTypes: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})