// inject impression tracker js into browser page
void function () {
    chrome.runtime.sendMessage({
        type: 'addImpression',
        data: {}
    })
}()