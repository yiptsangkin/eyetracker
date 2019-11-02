var transferTimer = null

void function () {
    // function
    function initTarget(targetList, isTargetBorder, isInit) {
        targetList = targetList || []
        targetList.forEach(function (item, index) {
            var perDomList = document.querySelectorAll(item.value)
            perDomList.forEach(function (ditem, didx) {
                if (isInit) {
                    ditem.setAttribute('is-target', true)
                    ditem.setAttribute('is-load', false)
                }
                if (isTargetBorder) {
                    ditem.style.border = '1px solid #583df2'
                } else {
                    ditem.style.border = 'none'
                }
            })
        })
    }

    function initHotMap() {
        // click hot map
        chrome.storage.local.get([
            'clickCorList', 
            'maxClickHeight', 
            'maxClickWidth', 
            'hotMapSex', 
            'hotMapAge'
        ], function ({ 
            clickCorList, 
            maxClickHeight, 
            maxClickWidth, 
            hotMapSex, 
            hotMapAge
         }) {
            var hotMapData = []
            var maxValue = 0
            for (var key in clickCorList) {
                var xy = key.split(',')
                var age = clickCorList[key].age
                var sex = clickCorList[key].sex
                if (hotMapSex === 1 && sex === 0) {
                    // if filter is male but click data is female, next loop
                    continue
                } else if (hotMapSex === 2 && sex === 1) {
                    // if filter is female but click data is male, next loop
                    continue
                }
                if (hotMapAge === 1 && !(age < 18)) {
                    continue
                } else if (hotMapAge === 2 && !(age >= 18 && age <= 24)) {
                    continue
                } else if (hotMapAge === 3 && !(age >= 25 && age <= 29)) {
                    continue     
                } else if (hotMapAge === 4 && !(age >= 30 && age <= 39)) {
                    continue        
                } else if (hotMapAge === 5 && !(age >= 40 && age <= 49)) {
                    continue         
                } else if (hotMapAge === 6 && !(age >= 50)) {
                    continue         
                }
                hotMapData.push({
                    x: xy[0],
                    y: xy[1],
                    value: clickCorList[key].value
                })
                if (clickCorList[key] > maxValue) {
                    maxValue = clickCorList[key]
                }
            }
            var heatmap = h337.create({
                container: document.getElementById('tracker-hot-map')
            })

            heatmap.setData({
                max: maxValue,
                data: hotMapData
            })
        })

    }

    function clearHotMap (message) {
        chrome.storage.local.get(['maxClickHeight', 'maxClickWidth'], function ({ maxClickHeight, maxClickWidth }) {
            var checkDom = document.getElementById('tracker-hot-map')
            if (message.status) {
                var clientWidth = document.body.clientWidth
                var clientHeight = document.body.clientHeight
                var hotMapDom = document.createElement('div')
                hotMapDom.setAttribute('id', 'tracker-hot-map')
                hotMapDom.style = `position: absolute; top: 0;left: 0;width: ${Math.max(maxClickWidth, clientWidth)}px;height: ${Math.max(maxClickHeight, clientHeight)}px;z-index: 999;`
                if (checkDom) {
                    document.getElementById('tracker-hot-map').remove()
                }
                document.getElementsByTagName('body')[0].appendChild(hotMapDom)
                // init hot map
                initHotMap()
            } else {
                if (checkDom) {
                    document.getElementById('tracker-hot-map').remove()
                }
            }
        })
    }
    // init localforage
    localforage.setDriver([localforage.INDEXEDDB])
    // init event
    chrome.storage.local.get(['isEyeMovement', 'targetList', 'isTargetBorder', 'isFaceOut', 'isHotMap'], function ({ isEyeMovement, targetList, isTargetBorder, isFaceOut, isHotMap }) {
        localforage.getItem('webgazerGlobalData').then(function (value) {
            if (isEyeMovement && value) {
                webgazer
                    .setRegression('ridge') /* currently must set regression and tracker */
                    .setTracker('clmtrackr')
                    .setGazeListener(function (data, clock) {
                        if (data != null) {
                            var domelement = document.elementFromPoint(data.x, data.y)
                            // get domelement text
                            if (domelement) {
                                // if is target
                                var isTarget = (domelement.getAttribute('is-target') === 'true')
                                var childHadTarget = domelement.querySelectorAll('*[is-target="true"]')
                                if (isTarget || childHadTarget.length > 0) {
                                    isTarget = true
                                    if (!transferTimer) {
                                        transferTimer = setTimeout(function () {
                                            chrome.runtime.sendMessage({
                                                type: 'addImpression',
                                                data: {
                                                    isTarget: isTarget
                                                }
                                            })
                                            clearTimeout(transferTimer)
                                            transferTimer = null
                                        }, 2000)
                                    }
                                }
                            }
                        }
                    })
                    .begin(function () {
                    })
                // .showPredictionPoints(true)
            }
        })
        if (isHotMap) {
            clearHotMap({
                status: isHotMap
            })
        }
        initTarget(targetList, isTargetBorder, true)
    })

    // add event listener
    chrome.runtime.onMessage.addListener(
        function (message, sender, sendResponse) {
            switch (message.type) {
                case 'clearHotMap':
                    clearHotMap(message)
                    sendResponse(true)
                    break
                case 'initTarget':
                    chrome.storage.local.get(['targetList', 'isTargetBorder'], function ({ targetList, isTargetBorder }) {
                        var timer = setTimeout(function () {
                            initTarget(targetList, isTargetBorder, true)
                            clearTimeout(timer)
                        }, 500)
                    })
                    break
                case 'checkIfTargetExist':
                    try {
                        var domCheck = document.querySelectorAll(message.selector)
                        if (domCheck.length === 0) {
                            sendResponse(false)
                        } else {
                            sendResponse(true)
                        }
                    } catch (e) {
                        sendResponse(false)
                    }
                    break;
                case 'targetBorder':
                    chrome.storage.local.get(['targetList', 'isTargetBorder'], function ({ targetList, isTargetBorder }) {
                        initTarget(targetList, isTargetBorder)
                    })
                    break
                case 'clearTrainData':
                    localforage.removeItem('webgazerGlobalData').then(function () {
                    })
                    sendResponse(true)
                    break
                case 'stopTrainData':
                    webgazer.end()
                    sendResponse(true)
                    break
                case 'startTrainData':
                    webgazer.setRegression('ridge')
                        .setTracker('clmtrackr')
                        .setGazeListener(function (data, clock) {
                        })
                        .begin()
                        .showPredictionPoints(true)
                    sendResponse(true)

                    // create a point guide dom
                    var guideDom = document.createElement('div')
                    guideDom.style = 'position: fixed; top: 0;left: 0;width: 100%;height: 100%;background-color: rgba(0,0,0,0.8);z-index: 9999;'
                    guideDom.innerHTML = `
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                        <div class="train-circle-wrp">
                            <div class="train-circle"></div> 
                        </div>
                    `
                    document.body.appendChild(guideDom)
                    break
                default:
                    console.log('Unrecognised message: ', message);
            }
        }
    )
}()