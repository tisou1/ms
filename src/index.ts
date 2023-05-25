// Helpers.
const s = 1000
const m = s * 60
const h = m * 60
const d = h * 24
const w = d * 7
const y = d * 365.25

type Unit =
  | 'Years'
  | 'Year'
  | 'Yrs'
  | 'Yr'
  | 'Y'
  | 'Weeks'
  | 'Week'
  | 'W'
  | 'Days'
  | 'Day'
  | 'D'
  | 'Hours'
  | 'Hour'
  | 'Hrs'
  | 'Hr'
  | 'H'
  | 'Minutes'
  | 'Minute'
  | 'Mins'
  | 'Min'
  | 'M'
  | 'Seconds'
  | 'Second'
  | 'Secs'
  | 'Sec'
  | 's'
  | 'Milliseconds'
  | 'Millisecond'
  | 'Msecs'
  | 'Msec'
  | 'Ms'

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>

export type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`

interface Option {
  long?: boolean
}

/**
 *
 * @param value string / number
 * @param option 是否选择长短模式
 */
function msFn(value: number, option?: Option): string
function msFn(value: StringValue, option?: Option): number
function msFn(value: StringValue | number, option?: Option): string | number {
  try {
    if (typeof value === 'string' && value.length > 0) {
      return parse(value)
    }
    else if (typeof value === 'number' && isFinite(value)) {
      // isFinite检测是否是一个有穷数
      return option?.long ? fmtLong(value) : fmtShort(value)
    }
    throw new Error('Value is not a string or number.')
  }
  catch (error) {
    const message = isError(error)
      ? `${error.message}. value=${JSON.stringify(value)}`
      : 'An unknown error has occurred.'
    throw new Error(message)
  }
}

export default msFn

function parse(str: string): number {
  // 需要正则去解析 输入字段
  if (str.length > 100)
    throw new Error('Value exceeds the maximum length of 100 characters.')

  // 关键的正则
  const match
    = /^(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str,
    )
  const groups = match?.groups as { value: string; type?: string } | undefined
  if (!groups)
    return NaN
  const n = parseFloat(groups.value)
  const type = (groups.type || 'ms').toLocaleLowerCase() as Lowercase<Unit>
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'weeks':
    case 'week':
    case 'w':
      return n * w
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      // This should never occur.
      throw new Error(
        `The unit ${type as string} was matched, but no matching case exists.`,
      )
  }
}

function fmtLong(value: number): StringValue {
  // 单位ms ,然后返回
  const msAbs = Math.abs(value)
  if (msAbs >= d)
    return plural(value, msAbs, d, 'day')
  else if (msAbs >= h)
    return plural(value, msAbs, h, 'hour')
  else if (msAbs >= m)
    return plural(value, msAbs, m, 'minute')
  else if (msAbs >= s)
    return plural(value, msAbs, s, 'second')
  else
    return `${msAbs}ms`
}

function fmtShort(value: number): StringValue {
  const msAbs = Math.abs(value)
  if (msAbs >= d)
    return `${Math.round(value / d)}d`
  else if (msAbs >= h)
    return `${Math.round(value / h)}h`
  else if (msAbs >= m)
    return `${Math.round(value / m)}m`
  else if (msAbs >= s)
    return `${Math.round(value / s)}s`
  else
    return `${msAbs}ms`
}

// 进行复数的处理
function plural(
  ms: number,
  msAbs: number,
  n: number,
  name: string,
): StringValue {
  const isPlural = msAbs >= n * 1.5
  return `${Math.round(ms / n)}${name}${isPlural ? 's' : ''}` as StringValue
}

function isError(value: unknown): value is Error {
  return typeof value === 'object' && value !== null && 'message' in value
}
