const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({
  data: {
    weekWeather: [],
    city: '广州市'
  },
  onLoad(options) {
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },
  onPullDownRefresh() {
    this.getWeekWeather(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback) {
    let MyThis = this
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: MyThis.data.city
      },
      success(res) {
        let result = res.data.result
        MyThis.setweekWeather(result)
      },
      complete() {
        callback && callback()
      }
    })
  },
  setweekWeather(result) {
    let MyThis = this
    let weekWeather = []
    for ( let i=0; i<7; i++ ) {
      let date = new Date()
      date.setDate(date.getDate()+i) // 未来七天的日期
      weekWeather.push({
        day: dayMap[date.getDay()],  // date.getDay() 返回一周中的第几天，0表示星期日
        date: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,
        temp: `${result[i].minTemp}°-${result[i].maxTemp}°`,
        iconPath: '/images/' + result[i].weather + '-icon.png'
      })
    }
    weekWeather[0].day = '今天'
    MyThis.setData({
      weekWeather: weekWeather
    })
  }
})