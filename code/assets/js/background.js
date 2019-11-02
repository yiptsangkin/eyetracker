// listen event from broswer
void function () {
    // set base value
    chrome.storage.local.get([
        'clickTimes', 
        'impressionTimes', 
        'targetImpressionTimes', 
        'targetClickTimes', 
        'isFaceOut',
        'allPersonNum',
        'maleNum',
        'femaleNum',
        'isImpression',
        'isClick',
        'isEyeMovement',
        'isTargetBorder',
        'isHotMap',
        'ageList',
        'clickCorList',
        'maxClickHeight',
        'maxClickWidth',
        'curUser',
        'hotMapSex',
        'hotMapAge'
    ], function ({ 
        clickTimes, 
        impressionTimes, 
        targetImpressionTimes, 
        targetClickTimes, 
        isFaceOut,
        allPersonNum,
        maleNum,
        femaleNum,
        isImpression,
        isClick,
        isEyeMovement,
        isTargetBorder,
        isHotMap,
        ageList,
        clickCorList,
        maxClickHeight,
        maxClickWidth,
        curUser,
        hotMapSex,
        hotMapAge
    }) {
        chrome.storage.local.set({
            clickTimes: clickTimes || 0,
            impressionTimes: impressionTimes || 0,
            targetClickTimes: targetClickTimes || 0,
            targetImpressionTimes: targetImpressionTimes || 0,
            isFaceOut: isFaceOut || true,
            allPersonNum: allPersonNum || 0,
            maleNum: maleNum || 0,
            femaleNum: femaleNum || 0,
            isImpression: isImpression || true,
            isClick: isClick || true,
            isEyeMovement: isEyeMovement || false,
            isTargetBorder: isTargetBorder || false,
            ageList: ageList || [],
            isHotMap: isHotMap || false,
            clickCorList: clickCorList || {},
            maxClickHeight: maxClickHeight || 0,
            maxClickWidth: maxClickWidth || 0,
            curUser: curUser || {
                age: 'unknown',
                sex: 'unknown'
            },
            hotMapSex: hotMapSex || 0,
            hotMapAge: hotMapAge || 0
        })
    })

    // listener
    chrome.runtime.onMessage.addListener(
        function (message, sender, sendResponse) {
            switch (message.type) {
                case 'addClick':
                    chrome.storage.local.get([
                        'clickTimes', 
                        'targetClickTimes', 
                        'clickCorList',
                        'maxClickHeight',
                        'maxClickWidth'
                    ], function ({ clickTimes, targetClickTimes, clickCorList, maxClickHeight, maxClickWidth }) {
                        // update click times
                        chrome.storage.local.set({
                            clickTimes: clickTimes + 1
                        })
                        if (message.data.isTarget) {
                            chrome.storage.local.set({
                                targetClickTimes: targetClickTimes + 1
                            })
                        }
                        // send message to popup
                        chrome.runtime.sendMessage({
                            type: 'updateBaseData'
                        })
                        // add click cor for hot map
                        if (clickCorList[`${message.data.corObj.x},${message.data.corObj.y}`]) {
                            clickCorList[`${message.data.corObj.x},${message.data.corObj.y}`].value = clickCorList[`${message.data.corObj.x},${message.data.corObj.y}`].value + 1
                        } else {
                            clickCorList[`${message.data.corObj.x},${message.data.corObj.y}`] = {
                                sex: message.data.corObj.sex,
                                age: message.data.corObj.age,
                                value: 1
                            }
                        }
                        chrome.storage.local.set({
                            clickCorList: clickCorList,
                            maxClickHeight: message.data.corObj.y > maxClickHeight ? message.data.corObj.y : maxClickHeight,
                            maxClickWidth: message.data.corObj.x > maxClickWidth ? message.data.corObj.x : maxClickWidth
                        })
                        // split word
                    })
                    break
                case 'addImpression':
                    chrome.storage.local.get(['impressionTimes', 'targetImpressionTimes', 'isImpression'], function ({ impressionTimes, targetImpressionTimes, isImpression }) {
                        if (isImpression) {
                            // update click times
                            if (message.data.isTarget) {
                                chrome.storage.local.set({
                                    targetImpressionTimes: targetImpressionTimes + 1
                                })
                            } else {
                                chrome.storage.local.set({
                                    impressionTimes: impressionTimes + 1
                                })
                            }
                            // send message to popup
                            chrome.runtime.sendMessage({
                                type: 'updateBaseData'
                            })
                        }
                    })
                    break
                case 'getUserFaceInfo':
                    var params = {
                        app_id: "10195055",
                        image: message.img.replace(/data:image\/.*?\;base64,/g, '')
                    }
                    axios.post('http://api.youtu.qq.com/youtu/api/detectface', params, {
                        headers: {
                            'Temp-Content-Length': JSON.stringify(params).length
                        }
                    }).then(function (res) {
                        // if success
                        if (res.data.errorcode === 0) {
                            var faceInfo = res.data.face[0]
                            chrome.storage.local.get(['impressionTimes'], function ({ impressionTimes }) {
                                console.log({
                                    sex: faceInfo.gender < 50 ? 0 : 1, // 0 female 1 male
                                    age: faceInfo.age
                                })
                                // update click times
                                chrome.storage.local.set({
                                    impressionTimes: impressionTimes + 1,
                                    curUser: {
                                        sex: faceInfo.gender < 50 ? 0 : 1, // 0 female 1 male
                                        age: faceInfo.age
                                    }
                                })
                                // send message to popup
                                chrome.runtime.sendMessage({
                                    type: 'updateBaseData'
                                })
                            })
                            // success
                            params = {
                                app_id: "10195055",
                                image: message.img.replace(/data:image\/.*?\;base64,/g, ''),
                                group_id: 'webtracker'
                            }
                            // query if user is existed
                            axios.post('http://api.youtu.qq.com/youtu/api/multifaceidentify', params, {
                                headers: {
                                    'Temp-Content-Length': JSON.stringify(params).length
                                }
                            }).then(function (res) {
                                var existUser = false
                                for (var i = 0; i < res.data.results.length; i++) {
                                    var item = res.data.results[i]
                                    if (item.candidates.length && item.candidates[0].confidence > 80) {
                                        existUser = true
                                        break
                                    }
                                }
                                if (existUser) {
                                    // exist user face
                                } else {
                                    chrome.storage.local.get(['allPersonNum', 'maleNum', 'femaleNum', 'ageList'], function ({ allPersonNum, maleNum, femaleNum, ageList }) {
                                        ageList.push(faceInfo.age)
                                        chrome.storage.local.set({
                                            allPersonNum: allPersonNum + 1,
                                            maleNum: maleNum + (faceInfo.gender < 50 ? 0 : 1),
                                            femaleNum: femaleNum + (faceInfo.gender >= 50 ? 0 : 1),
                                            ageList: ageList
                                        })
                                        // send message to popup
                                        chrome.runtime.sendMessage({
                                            type: 'updateBaseData'
                                        })
                                    })
                                    // save user face to the youtu system
                                    params = {
                                        app_id: "10195055",
                                        image: message.img.replace(/data:image\/.*?\;base64,/g, ''),
                                        group_ids: ['webtracker'],
                                        person_id: 'user-' + getUuid()
                                    }
                                    axios.post('http://api.youtu.qq.com/youtu/api/newperson', params, {
                                        headers: {
                                            'Temp-Content-Length': JSON.stringify(params).length
                                        }
                                    }).then(function (res) {
                                        if (res.data.errorcode === 0) {
                                            // TODO 
                                        }
                                    })
                                }
                            })
                        } else {
                            console.log('get face info false')
                        }
                    })
                    break
                default:
                    console.log('Unrecognised message: ', message)
            }
        }
    )
    chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {

        var signStr = signUT()
        console.log(signStr)
        var hostIndex = -1
        var authIndex = -1
        var contentTypeIndex = -1
        var contentLengthIndex = -1
        var temContentLengthIndex = -1
        var contentLength = 0
        var newHeaders = []
        for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'Host') {
                hostIndex = i
            }
            if (details.requestHeaders[i].name === 'Authorization') {
                authIndex = i
            }
            if (details.requestHeaders[i].name === 'Content-Type') {
                contentTypeIndex = i
            }
            if (details.requestHeaders[i].name === 'Temp-Content-Length') {
                temContentLengthIndex = i
                contentLength = details.requestHeaders[i].value
            }
            if (details.requestHeaders[i].name === 'Content-Length') {
                contentLengthIndex = i
            }
        }

        if (hostIndex === -1) {
            // replace host
            details.requestHeaders.push({
                'name': 'Host',
                'value': 'api.youtu.qq.com'
            })
        } else {
            details.requestHeaders[hostIndex].value = 'api.youtu.qq.com'
        }
        if (authIndex === -1) {
            // replace auth
            details.requestHeaders.push({
                'name': 'Authorization',
                'value': signStr
            })
        } else {
            details.requestHeaders[authIndex].value = signStr
        }
        if (contentTypeIndex === -1) {
            // replace centent type
            details.requestHeaders.push({
                'name': 'Content-Type',
                'value': 'text/json'
            })
        } else {
            details.requestHeaders[contentTypeIndex].value = 'text/json'
        }

        if (contentLengthIndex === -1 && temContentLengthIndex !== -1) {
            // replace content length
            details.requestHeaders.push({
                'name': 'Content-Length',
                'value': contentLength
            })
        } else {
            if (contentLengthIndex === -1) {
                details.requestHeaders.push({
                    'name': 'Content-Length',
                    'value': contentLength.toString()
                })
            }
        }

        for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'Host' || details.requestHeaders[i].name === 'Authorization' ||
                details.requestHeaders[i].name === 'Content-Type' || details.requestHeaders[i].name === 'Content-Length') {
                newHeaders.push(details.requestHeaders[i])
            }
        }

        details.requestHeaders = newHeaders

        return { requestHeaders: details.requestHeaders }
    },
        { urls: ['*://api.youtu.qq.com/*'] },
        ['blocking', 'requestHeaders', 'extraHeaders'])
    chrome.webRequest.onCompleted.addListener(function (details) {
        // init 
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'initTarget'
                })
            }
        })
    },
        { urls: ['*://*/*'] },
        ['responseHeaders'])
}()