import moment from 'moment'

function now(): string {
  return moment().format('YYYY-MM-DDTHH:mm:ss:SSSSZ')
}

export function pad(id: string, words: string, ...rest: Array<any>): void {
  console.log(`${now()}      ${id} - ${words}`, ...rest)
}

export function arrow(words: string, ...rest: Array<any>): void {
  console.log(`${now()} >>>> ${words}`, ...rest)
}

export function error(words: string, ...rest: Array<any>): void {
  console.error(`${now()} $$$$ ${words}`, ...rest)
}
