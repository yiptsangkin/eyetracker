// inject mouse tracker js into browser page
void function () {
    // get able click tracker
    chrome.storage.local.get(['isClick', 'curUser'], function ({ isClick, curUser }) {
        let textList = []
        let corObj = []
        // listen target event from background
        // bind mouse click event
        document.onclick = function (e) {
            if (isClick) {
                // able click event
                var clickTarget = e.target
                var targetText = clickTarget.innerText // record the dom's text which is clicked
                if (targetText !== '') {
                    textList.push(targetText)
                }
                corObj = {
                    x: e.pageX,
                    y: e.pageY,
                    age: curUser.age,
                    sex: curUser.sex
                }
                // is target
                var isTarget = (clickTarget.getAttribute('is-target') === 'true')
                var childHadTarget = clickTarget.querySelectorAll('*[is-target="true"]')
                if (isTarget || childHadTarget.length > 0) {
                    isTarget = true
                }
                // post message to background
                if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage({
                        type: 'addClick',
                        data: {
                            corObj: corObj,
                            isTarget: isTarget
                        }
                    })
                }
            }
        }
        // bind mouse move event
        document.onmousemove = function (e) {
            if (isClick) {
                // able click event
            }
        }
    })
}()