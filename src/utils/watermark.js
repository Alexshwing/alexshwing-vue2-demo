/**
 * 页面水印生成
 * 用 canvas 绘制水印内容并铺满屏幕, 设置 `pointer:events:none` 让用户无法选中和操作水印
 * 通过 伪元素 方式添加到页面中
 * 利用 `MutationObserver` 监听该元素，让用户无法删除该元素
 */

// 生成背景图
function createImgBase(options) {
  const { content, canvasHeight, canvasWidth } = options
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  if (ctx) {
    ctx.rotate((-10 * Math.PI) / 180)
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'
    ctx.font = '18px microsoft yahei'
    ctx.fillText(content, 10, 30)
  }
  return canvas.toDataURL('/image/png')
}

// 利用`MutationObserver`监听DOM变化
function listenerDOMChange(className) {
  const targetNode = document.querySelector(`.${className}`)
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        targetNode
      ) {
        const curClassVal = targetNode.getAttribute('class') || ''
        // 监听到className被删除了，手动加回去
        if (curClassVal.indexOf(className) === -1) {
          targetNode.setAttribute('class', `${className} ${curClassVal}`)
        }
      }
    }
  })
  observer.observe(targetNode, {
    attributes: true,
  })
}

// 水印生成
export function generateWaterMark({
  content,
  className,
  canvasHeight = 140,
  canvasWidth = 150,
}) {
  listenerDOMChange(className)

  const dataURL = createImgBase({ content, canvasHeight, canvasWidth })
  const watermarkStyle = document.createElement('style')
  watermarkStyle.innerHTML = `.${className}::after {
    content: '';
    display: block;
    width: 100%;
    height: 100vh;
    background-image: url(${dataURL});
    background-repeat: repeat;
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
  }`
  document.head.appendChild(watermarkStyle)
}

// 移除水印
export function removeWaterMark(className) {
  const watermarkStyle = document.createElement('style')
  watermarkStyle.innerHTML = `.${className}::after {
    display: none;
  }`
  document.head.appendChild(watermarkStyle)
}
