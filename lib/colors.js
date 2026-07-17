import util from 'node:util'

export const SUPPORTS_COLOR = !!process.stdout.hasColors?.()

const identity = (text) => text

export const green = SUPPORTS_COLOR ? (text) => util.styleText('green', text) : identity

export const red = SUPPORTS_COLOR ? (text) => util.styleText('red', text) : identity

export const yellow = SUPPORTS_COLOR ? (text) => util.styleText('yellow', text) : identity

export const blue = SUPPORTS_COLOR ? (text) => util.styleText('blue', text) : identity

export const dim = SUPPORTS_COLOR ? (text) => util.styleText('dim', text) : identity

export const bold = SUPPORTS_COLOR ? (text) => util.styleText('bold', text) : identity
