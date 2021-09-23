import defaultSettings from '@/settings'

const title = defaultSettings.title || '叶子宇'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
