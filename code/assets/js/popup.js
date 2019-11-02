// script for popup.html
void function () {
    // default page
    // init swiper
    var pageSwiper = new Swiper('.swiper-container', {
    })
    // bind setting btn click event
    document.querySelector('.pd-setting').onclick = function () {
        pageSwiper.slideNext()
    }
    // bind setting back click event
    document.querySelector('.pd-back').onclick = function () {
        pageSwiper.slidePrev()
    }

    // setting page
    // get switch value
    initSwitch()
    // init switch click event
    initSwitchEvent()
    // init base data
    initBaseData()
    // init target list
    initAddTargetBtn()
    initTargetList()
    // init other btn
    initOtherBtn()

    // listener
    chrome.runtime.onMessage.addListener(
        function (message, sender, sendResponse) {
            switch (message.type) {
                case 'updateBaseData':
                    initBaseData()
                    break
                default:
                    console.log("Unrecognised message: ", message)
            }
        }
    )
}()