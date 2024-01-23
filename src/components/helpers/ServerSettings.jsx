let window_url = window.location.href
export const apiServerURL = (window_url.indexOf('kleinkunstig') != -1) ? 'https://100daysofdata.kleinkunstig.nl/api/' : 'http://local.kk-datavisuals-api:8888/'
// console.log('window_url', window_url, 'apiServerURL:', apiServerURL)