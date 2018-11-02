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

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherbg: '',
    hourlyWeather: []
  },
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad() {
    this.getNow()
  },
  getNow(callback) {
    let MyThis = this
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', 
      data: {
        city: '广州市'
      },
      success (res) {
        let result = res.data.result
        MyThis.set_Now(result)
        MyThis.set_hourlyWeather(result)
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
    for (let i = 0; i < 7; i += 1) {
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
  }
})