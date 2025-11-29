import { LoadingPlugin } from 'tdesign-vue-next'

let loadingInstance = null

export const showLoading = () => {
  loadingInstance = LoadingPlugin({
    fullscreen: true,
    attach: 'body',
    size: 'large',
  })
}

export const hideLoading = () => {
  if (loadingInstance) {
    loadingInstance.hide()
  }
}
