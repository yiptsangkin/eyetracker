function initSwitch() {
    // init switch status
    chrome.storage.local.get(['isImpression', 'isClick', 'isEyeMovement', 'isTargetBorder', 'isHotMap'], function (result) {
        if (result) {
            // impression switch
            if (result.isImpression) {
                // switch on impression tracker
                var ipSwitchClass = document.querySelector('.impression-switch').getAttribute('class')
                var ipSwitchClassList = ipSwitchClass.split(' ')
                ipSwitchClassList.push('actived')
                document.querySelector('.impression-switch').setAttribute('class', ipSwitchClassList.join(' '))
            }
            // click switch
            if (result.isClick) {
                // switch on click tracker
                var ckSwitchClass = document.querySelector('.click-switch').getAttribute('class')
                var ckSwitchClassList = ckSwitchClass.split(' ')
                ckSwitchClassList.push('actived')
                document.querySelector('.click-switch').setAttribute('class', ckSwitchClassList.join(' '))
            }
            // eye switch
            if (result.isEyeMovement) {
                // switch on eyemovement tracker
                var eyeSwitchClass = document.querySelector('.eye-switch').getAttribute('class')
                var eyeSwitchClassList = eyeSwitchClass.split(' ')
                eyeSwitchClassList.push('actived')
                document.querySelector('.eye-switch').setAttribute('class', eyeSwitchClassList.join(' '))
            }
            // is target border
            if (result.isTargetBorder) {
                // switch on target border
                var borderSwitchClass = document.querySelector('.target-border-switch').getAttribute('class')
                var borderSwitchClassList = borderSwitchClass.split(' ')
                borderSwitchClassList.push('actived')
                document.querySelector('.target-border-switch').setAttribute('class', borderSwitchClassList.join(' '))
            }
            // is show hot map
            if (result.isHotMap) {
                // switch on hot map
                var hotMapSwitchClass = document.querySelector('.hot-map-switch').getAttribute('class')
                var hotMapSwitchClassList = hotMapSwitchClass.split(' ')
                hotMapSwitchClassList.push('actived')
                document.querySelector('.hot-map-switch').setAttribute('class', hotMapSwitchClassList.join(' '))
            }
        }
    })
}

function initTargetBorder() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'targetBorder'
        })
    })
}

function initSwitchEvent() {
    // init switch event
    document.querySelectorAll('.switch-circle').forEach(function (item, index) {
        item.onclick = function (e) {
            var parentNode = e.currentTarget.parentNode
            var switchType = parentNode.getAttribute('switch-type')
            var classList = parentNode.getAttribute('class').split(' ')
            var activedIndex = classList.indexOf('actived')
            var curStatus = false
            if (activedIndex === -1) {
                var temClassList = Object.assign([], classList)
                temClassList.push('actived')
                parentNode.setAttribute('class', temClassList.join(' '))
                curStatus = true
            } else {
                var temClassList = Object.assign([], classList)
                temClassList.splice(activedIndex, 1)
                parentNode.setAttribute('class', temClassList.join(' '))
                curStatus = false
            }
            switch (switchType) {
                case 'impression':
                    chrome.storage.local.set({ 'isImpression': curStatus })
                    break
                case 'click':
                    chrome.storage.local.set({ 'isClick': curStatus })
                    break
                case 'eyemovement':
                    chrome.storage.local.set({ 'isEyeMovement': curStatus })
                    break
                case 'targetborder':
                    chrome.storage.local.set({ 'isTargetBorder': curStatus })
                    initTargetBorder()
                    break
                case 'hotmap':
                    chrome.storage.local.set({ 'isHotMap': curStatus })
                    showHotMap()
                    break
            }
            chrome.storage.local.get(['isEyeMovement', 'isClick', 'isImpression', 'isTargetBorder', 'isHotMap'], function (result) {
                // update event status
            })
        }
    })
}

function initBaseData() {
    // update base data, clickTimes, impressionTimes
    chrome.storage.local.get(['clickTimes', 'impressionTimes', 'targetClickTimes', 'targetImpressionTimes', 'isHotMap'], function ({ clickTimes, impressionTimes, targetClickTimes, targetImpressionTimes, isHotMap }) {
        // update event status
        document.querySelector('.all-click .card-value').innerText = clickTimes
        document.querySelector('.all-impression .card-value').innerText = impressionTimes
        document.querySelector('.target-click .card-value').innerText = targetClickTimes
        document.querySelector('.target-impression .card-value').innerText = targetImpressionTimes
        initHotMapOpt ()
    })
    // init charts
    initEcharts()
}

function initAddTargetBtn() {
    // init add target
    document.querySelector('.add-btn').onclick = function () {
        var perDom
        perDom = document.createElement('li')
        perDom.innerHTML = `
                    <input placeholder="please enter the selector for target"/>
                    <span class="close-icon">×</span>
                `
        var inputDom = document.querySelectorAll('.target-list ul li input')
        var hadEmpty = false
        for (var i = 0; i < inputDom.length; i++) {
            var item = inputDom[i]
            if (item.value === '') {
                hadEmpty = true
                break
            }
        }
        if (!hadEmpty) {
            document.querySelector('.target-list ul').appendChild(perDom)
            bindTargetEvent()
        }
    }
}

function bindTargetEvent() {
    // int edit target
    // dbclick to edit
    document.querySelectorAll('.target-list ul li').forEach(function (item, index) {
        item.ondblclick = function (e) {
            item.getElementsByTagName('input')[0].disabled = false
            item.getElementsByTagName('input')[0].focus()
        }
    })
    document.querySelectorAll('.target-list ul li input').forEach(function (item, index) {
        // blur input, set diabled and update storge
        item.onblur = function (e) {
            var inputVal = e.currentTarget.value
            chrome.storage.local.get(['targetList'], function ({ targetList }) {
                // get default value
                targetList = targetList || []
                var defaultValue = targetList[index] ? targetList[index].value : ''
                if (inputVal !== '') {
                    // send message to content script to check if dom is exist
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: 'checkIfTargetExist',
                            selector: inputVal
                        }, function (res) {
                            if (res) {
                                item.disabled = true
                                showMsg({
                                    text: 'add target successfully'
                                })
                                chrome.storage.local.get(['targetList'], function ({ targetList }) {
                                    targetList = targetList || []
                                    targetList.push({
                                        value: item.value
                                    })
                                    chrome.storage.local.set({
                                        targetList: targetList
                                    })
                                })
                            } else {
                                item.value = ''
                                showMsg({
                                    text: 'please fill a existed selector',
                                    type: 'error'
                                })
                            }
                        })
                    })
                } else {
                    item.value = defaultValue
                }
            })
        }
    })
    // init remove target
    document.querySelectorAll('.target-list ul li .close-icon').forEach(function (item, index) {
        item.onclick = function (e) {
            // remove dom
            e.currentTarget.parentNode.remove()
            // remove storage
            chrome.storage.local.get(['targetList'], function ({ targetList }) {
                targetList = targetList || []
                targetList.splice(index, 1)
                chrome.storage.local.set({
                    targetList: targetList
                })
            })
        }
    })
}

function initTargetList() {
    // init target list
    chrome.storage.local.get(['targetList'], function ({ targetList }) {
        var perDom
        targetList = targetList || []
        targetList.forEach(function (item, index) {
            perDom = document.createElement('li')
            perDom.innerHTML = `
                <input value="${item.value}" disabled placeholder="please enter the selector for target"/>
                <span class="close-icon">×</span>
            `
            document.querySelector('.target-list ul').appendChild(perDom)
        })
        bindTargetEvent()
        initTargetBorder()
    })
}

function initOtherBtn() {
    // bind other btn
    var clearBtn = document.querySelector('#clear-train-data')
    var opBtn = document.querySelector('#op-train-data')
    var clearClickBtn = document.querySelector('#clear-click-data')
    chrome.storage.local.get(['trainStatus'], function ({ trainStatus }) {
        opBtn.innerText = trainStatus || 'start'
    })
    // clear click data
    clearClickBtn.onclick = function () {
        chrome.storage.local.set({
            clickTimes: 0,
            impressionTimes: 0,
            targetClickTimes: 0,
            targetImpressionTimes: 0,
            isFaceOut: true,
            allPersonNum: 0,
            maleNum: 0,
            femaleNum: 0,
            isImpression: true,
            isClick: true,
            isEyeMovement: false,
            isTargetBorder: false,
            ageList: [],
            isHotMap: false,
            clickCorList: {},
            maxClickHeight: 0,
            maxClickWidth: 0,
            curUser: {
                age: 'unknown',
                sex: 'unknown'
            }
        })
        showMsg({
            text: 'clean click data success'
        })
    }
    // clear train data
    clearBtn.onclick = function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'clearTrainData'
            }, function (res) {
                if (res) {
                    showMsg({
                        text: 'clean trains data success'
                    })
                } else {
                    showMsg({
                        text: 'clean trains data fail',
                        type: 'error'
                    })
                }
            })
        })
    }
    // click start/stop train data
    opBtn.onclick = function () {
        if (opBtn.innerText === 'stop') {
            opBtn.innerText = 'start'
            // stop get data
            chrome.storage.local.set({
                trainStatus: 'start'
            })
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'stopTrainData'
                })
            })
        } else {
            opBtn.innerText = 'stop'
            chrome.storage.local.set({
                trainStatus: 'stop'
            })
            // start get data
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'startTrainData'
                }, function (res) {
                    if (res) {
                        showMsg({
                            text: 'start get trains data'
                        })
                    } else {
                        showMsg({
                            text: 'get trains data fail',
                            type: 'error'
                        })
                    }
                })
            })
        }
    }
    // init hot map opt change event
    document.getElementById('hot-map-sex').onchange = function (e) {
        chrome.storage.local.set({
            hotMapSex: parseInt(e.currentTarget.value)
        })
        showHotMap()
    }
    document.getElementById('hot-map-age').onchange = function (e) {
        chrome.storage.local.set({
            hotMapAge: parseInt(e.currentTarget.value)
        })
        showHotMap()
    }
}

function initEcharts() {
    chrome.storage.local.get(['maleNum', 'femaleNum', 'ageList'], function ({ maleNum, femaleNum, ageList }) {

        // gender pie
        var genderPieOpt = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}：{c}（{d}%）"
            },
            series: [
                {
                    name: 'gender',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '50%'],
                    selectedMode: 'single',
                    data: [
                        {
                            name: 'male',
                            value: maleNum
                        },
                        {
                            name: 'female',
                            value: femaleNum
                        }
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }
        var genderPie = echarts.init(document.getElementById('gender-chart'), 'dark')
        genderPie.setOption(genderPieOpt)

        // age bar chart
        var ageDataList = [
            0, // under 18 years old
            0, // 18~24 years old
            0, // 25~29 years old
            0, // 30~39 years old
            0, // 40~49 years old
            0  // above 50 years old
        ]

        ageList.forEach(function (item, index) {
            if (item < 18) {
                ageDataList[0] = ageDataList[0] + 1
            } else if (item >= 18 && item <= 24) {
                ageDataList[1] = ageDataList[1] + 1
            } else if (item >= 25 && item <= 29) {
                ageDataList[2] = ageDataList[2] + 1
            } else if (item >= 30 && item <= 39) {
                ageDataList[3] = ageDataList[3] + 1
            } else if (item >= 40 && item <= 49) {
                ageDataList[4] = ageDataList[4] + 1
            } else if (item >= 50) {
                ageDataList[5] = ageDataList[5] + 1
            }
        })
        var ageBarOpt = {
            tooltip: {
                trigger: 'item',
                formatter: "人数：{c}"
            },
            grid: {
                top: 20,
                right: 20,
                bottom: 50
            },
            xAxis: {
                type: 'category',
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    fontSize: 10,
                    rotate: 50
                },
                data: ['under 18', '18~24', '25~29', '30~39', '40~49', 'above 50']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: ageDataList,
                barWidth: 18,
                type: 'bar'
            }]
        }
        var ageBar = echarts.init(document.getElementById('age-chart'), 'dark')
        ageBar.setOption(ageBarOpt)
    })
}

function showMsg(msgObj) {
    var msgType = msgObj.type || 'success'
    if (msgType === 'error') {
        var errMsg = document.querySelector('.error-msg')
        errMsg.innerText = msgObj.text
        errMsg.style.display = 'block'
        var timer = setTimeout(function () {
            errMsg.style.display = 'none'
        }, 2000)
    } else if (msgType === 'success') {
        var successMsg = document.querySelector('.success-msg')
        successMsg.innerText = msgObj.text
        successMsg.style.display = 'block'
        var timer = setTimeout(function () {
            successMsg.style.display = 'none'
        }, 2000)
    }
}

function base64Encode(str) {
    if (window.btoa) // Internet Explorer 10 and above  
        return window.btoa(unescape(encodeURIComponent(str)));
    else {
        // Cross-Browser Method (compressed)  

        // Create Base64 Object  
        var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
        // Encode the String  
        return Base64.encode(unescape(encodeURIComponent(str)));
    }
}

function base64Decode(str) {
    if (window.atob) // Internet Explorer 10 and above  
        return decodeURIComponent(escape(window.atob(str)));
    else {
        // Cross-Browser Method (compressed)  

        // Create Base64 Object  
        var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
        // Encode the String  
        return decodeURIComponent(escape(Base64.decode(str)));
    }
}

function signUT() {
    var timeStamp = parseInt(new Date().getTime() / 1000)
    var rdnNum = parseInt(Math.random() * Math.pow(2, 32))
    var paramsStr = `a=10195055&k=AKIDeEsUyKbggfZqvsm7KK9lJZicBanAsLq6&e=${timeStamp + 7200}&t=${timeStamp}&r=${rdnNum}&u=867584522`
    var shaList = CryptoJS.HmacSHA1(paramsStr, 'B8sOlu7rLiqiNp1LSKxLVEk1M4cyY2JP')
    var paramsStrList = CryptoJS.enc.Utf8.parse(paramsStr)
    var allList = shaList.concat(paramsStrList)
    var sign = CryptoJS.enc.Base64.stringify(allList)
    return sign
}

function getUuid() {
    var charList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
        'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    var randomList = []
    for (var i = 0; i < 16; i++) {
        var rdn = parseInt(Math.random() * 16)
        randomList.push(charList[rdn].toLowerCase())
    }
    return randomList.join('')
}

function showHotMap() {
    // insert hot map
    chrome.storage.local.get(['isHotMap'], function ({ isHotMap }) {
        initHotMapOpt ()
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'clearHotMap',
                status: isHotMap
            }, function (res) {
                if (res) {
                    if (isHotMap) {
                        showMsg({
                            text: 'show hot map success'
                        })
                    } else {
                        showMsg({
                            text: 'hide hot map success'
                        })
                    }
                } else {
                    showMsg({
                        text: 'clear hot map fail',
                        type: 'error'
                    })
                }
            })
        })
    })
}

function initHotMapOpt () {
    // show hot map option
    chrome.storage.local.get(['isHotMap', 'hotMapSex', 'hotMapAge'], function ({ isHotMap, hotMapSex, hotMapAge }) {
        if (isHotMap) {
            document.getElementById('hot-map-opt').style.display = 'block'
        } else {
            document.getElementById('hot-map-opt').style.display = 'none'
        }
        // init hot map option value
        document.getElementById('hot-map-sex').value = hotMapSex
        document.getElementById('hot-map-age').value = hotMapAge
    })
}