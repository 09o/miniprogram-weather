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

Page({
  // 所有的动态变量
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherbg: '',
    hourlyWeather: [],
    todayData: '',
    todayTemp: '',
    city: '广州市',
    locationAuthType: UNPROMPTED
  },
  // 生命周期函数，在一开始会被调用
  onLoad() {
    let MyThis = this
    this.qqmapsdk = new QQMapWX({
      key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
    })
    wx.getSetting({
      success(res) {
        let auth = res.authSetting['scope.userLocation']
        MyThis.setData({
          locationAuthType: auth ? AUTHORIZED : (auth == false) ? UNAUTHORIZED : UNPROMPTED,
        })
        if (auth) {
          MyThis.getCityAndLocation()
        } else {
          MyThis.getNow()
        }
      }
    })
    this.getNow()
  },
  // 下拉刷新
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  // v1:授权页面返回中教程所采用的方法，注意：需在app.js中添加代码 'APP({})'
  // 不建议使用
  // onShow() {
  //   let MyThis = this
  //   wx.getSetting({
  //     success (res) {
  //       let auth = res.authSetting['scope.userLocation']
  //       if (auth && MyThis.data.locationAuthType !== AUTHORIZED) {
  //         // 权限从无到有
  //         MyThis.setData({
  //           locationAuthType: AUTHORIZED,
  //           locationTipsText: AUTHORIZED_TIPS
  //         })
  //       MyThis.get_location()
  //       }
  //     }
  //   })
  // },
  // 核心部分，用于获取网络的函数。在onLoad() onPullDownRefresh() getCityAndWeather()中都会被调用
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
  // set_Now(obj) set_hourlyWeather(obj) set_Today(obj)会在getNow()返回结果后被调用
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
  // 跳转至第二页的点击响应函数
  onTapDayWeather() {
    wx.showToast()
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },
  // 点击获取位置时的响应函数
  onTapLocation() {
    let MyThis = this
    // v2:授权页面返回中我所使用的方法，另外教程也更新了这种方法
    if (MyThis.data.locationAuthType == 1) {
      wx.openSetting({
        success (res) {
          let auth = res.authSetting['scope.userLocation']
          if (auth == true) {
            MyThis.setData({
              locationAuthType: UNPROMPTED,
            })
          }
        }
      })

    // if (MyThis.data.locationAuthType == 1) {
    //   wx.openSetting()
    } else {
      MyThis.getCityAndLocation()
    }
  },
  // onTapLocation()&&onLoad()中被调用
  getCityAndLocation() {
    let MyThis = this
    wx.getLocation({
      success: function (res) {
        MyThis.setData({
          locationAuthType: AUTHORIZED
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
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }
})