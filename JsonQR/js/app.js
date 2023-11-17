window.JsonQR = window.JsonQR || {}

JsonQR.reader = (() => {
    if (!navigator.mediaDevices) {
        showUnsuportedScreen()
        return
    }

    const video = document.querySelector('#js-video')

    const findJsonQR = () => {
        const canvas = document.querySelector('#js-canvas')
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, canvas.width, canvas.height)

        if (code) {
            var text_decoder = new TextDecoder('shift-jis')
            const qrdata = text_decoder.decode(Uint8Array.from(code.binaryData).buffer)
            if (validateQRdata(qrdata)) {
                const obj = JSON.parse(qrdata)
                const mailto = `mailto:hiroaki.etoh1@ibm.com?subject=${obj.title}&body=${qrdata}`
                JsonQR.modal.open(obj.title, mailto)
            }
        }
        setReticleColor( code ? 'red'  : 'white')
        setTimeout(findJsonQR, 500)
    }

    const validateQRdata = (qrdata) => {
        try {
            obj = JSON.parse(qrdata)
            if ('title' in obj) return true
            return false
        }
        catch (err) {
            return false
        }
    }

    const initCamera = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    facingMode: {
                        exact: 'environment',
                    },
                },
            })
            .then((stream) => {
                video.srcObject = stream
                video.onloadedmetadata = () => {
                    video.play()
                    findJsonQR()
                }
            })
            .catch(() => {
                showUnsuportedScreen()
            })
    }

    const setReticleColor = (color) => {
        const rectile = document.querySelector('div.reticle-box')
        rectile.style.borderColor = color
    }

    const showUnsuportedScreen = () => {
        document.querySelector('#js-unsupported').classList.add('is-show')
    }

    return {
        initCamera,
        findJsonQR,
    }
})()

JsonQR.modal = (() => {
    const result = document.querySelector('#js-result')
    const link = document.querySelector('#js-link')
    const modal = document.querySelector('#js-modal')
    const modalClose = document.querySelector('#js-modal-close')

    const open = (title, url) => {
        result.value = title
        link.setAttribute('href', url)
        modal.classList.add('is-show')
    }

    const close = () => {
        modal.classList.remove('is-show')
    }

    link.addEventListener('click', () => setTimeout(()=>{close()},5000))
    modalClose.addEventListener('click', () => close())

    return {
        open,
    }
})()

if (JsonQR.reader) JsonQR.reader.initCamera()
